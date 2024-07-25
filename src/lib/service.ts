import { nanoid } from 'nanoid';
import { save } from './db';

const baseUrl = 'http://test.short/';

export async function shorten(srcUrl: string): Promise<string | undefined> {
  if (!srcUrl) {
    return;
  }

  const urlId = nanoid(10);
  const shortenedUrl = `${baseUrl}${urlId}`;

  const dbStatus = await save(urlId, srcUrl);
  return dbStatus ? shortenedUrl : undefined;
}
