import { Elysia, t } from "elysia";
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();
const server = new Elysia();

// Handle URL shortening requests
server.post('/shorten', async ({ body: { url } }) => {
  if (!url) {
    console.error('URL is required');
    return { status: 400, body: { errMsg: 'URL is required' } };
  }

  // Generate a unique ID for the shortened URL
  const urlId = nanoid(7);

  try {
    // Insert new shortened URL into the database
    await prisma.shortenedUrl.create({
      data: {
        id: urlId, // Use URL ID as the primary key
        srcurl: url,
        lastaccessed: new Date(), // Set the initial lastaccessed date
      },
    });

    console.log(`Shortened URL created: http://localhost:3000/shorten/${urlId}`);
    // Return the shortened URL
    return {
      status: 200,
      body: { shortenedUrl: `http://localhost:3000/shorten/${urlId}` }
    };
  } catch (error) {
    console.error('Error shortening URL:', error);
    return { status: 500, body: { errMsg: 'Failed to shorten URL' } };
  }
}, {
  body: t.Object({
    url: t.String(),
  }),
});

// Handle URL redirection
server.get('/shorten/:id', async ({ params: { id }, query }) => {
  try {
    console.log(`Redirect request for ID: ${id}`);
    const urlEntry = await prisma.shortenedUrl.findUnique({
      where: { id },
    });

    if (!urlEntry) {
      console.log(`URL not found for ID: ${id}`);
      return new Response('URL not found', { status: 404 });
    }

    console.log(`Found URL: ${urlEntry.srcurl}`);

    // Default status code
    let statusCode = 302;


    // Redirect to the URL from the database with the determined status code
    return new Response(null, {
      status: statusCode,
      headers: {
        Location: urlEntry.srcurl,
      },
    });
  } catch (error) {
    console.error('Error handling redirect:', error.message || error);
    return new Response('Internal server error', { status: 500 });
  }
});

server.listen(3000);

console.log(`🦊 Elysia is running at http://localhost:3000`);
