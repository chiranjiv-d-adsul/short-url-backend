import { Context } from 'elysia';
import { shorten } from '../../lib/service';
import { getOriginalUrl , prisma} from '../../lib/db';


export async function handleShortenRequest(ctx: Context): Promise<{ srcUrl?: string; shortenedUrl?: string; errMsg?: string }> {
  const { srcUrl } = ctx.body as { srcUrl: string };

  if (!srcUrl) {
    ctx.set.status = 400;
    return { errMsg: "Parameter 'srcUrl' is missing" };
  }

  if (srcUrl.length > 250) {
    ctx.set.status = 400;
    return { errMsg: "Parameter 'srcUrl' must not be more than 250 characters" };
  }

  if (!/^https?:\/\//.test(srcUrl)) {
    ctx.set.status = 400;
    return { errMsg: "Parameter 'srcUrl' must start with http:// or https://" };
  }

  const shortenedUrl = await shorten(srcUrl);
  if (!shortenedUrl) {
    ctx.set.status = 500;
    return { errMsg: "Failed to shorten URL" };
  }

  return { srcUrl, shortenedUrl };
}



export async function handleRedirect(ctx: Context & { send: (data: any) => void }): Promise<void> {
  const { id } = ctx.params;

  console.log(`Received redirect request for ID: ${id}`);

  const shortenedUrl = await getOriginalUrl(id);
  console.log('Retrieved shortened URL:', shortenedUrl);

  if (shortenedUrl) {
    console.log(`Redirecting to: ${shortenedUrl.srcurl}`);

    // Update last accessed timestamp
    await prisma.shortenedUrl.update({
      where: { id },
      data: { lastaccessed: new Date() },
    });

    // Redirect to the original URL

    ctx.redirect(shortenedUrl.srcurl);
  } else {
    console.log(`URL not found for ID: ${id}`);
    ctx.set.status = 404;
    ctx.send({ errMsg: "URL not found" });
  }
}
