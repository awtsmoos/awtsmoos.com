//B"H
/**
 * Inspect the real DosDB Torah corpus shape before translation automation.
 */
const path = require('path');
const DosDB = require('../../../ayzarim/DosDB/index.js');

const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
const db = new DosDB(dbRoot);

function summarize(value) {
  if (Array.isArray(value)) return { type: 'array', length: value.length, first: value.slice(0, 3) };
  if (value && typeof value === 'object') return { type: 'object', keys: Object.keys(value).slice(0, 20), firstValues: Object.values(value).slice(0, 3) };
  return { type: typeof value, value };
}

(async () => {
  await db.init();
  for (const series of ['bereishis', 'tehillim']) {
    const posts = await db.read(`/social/heichelos/ikar/series/${series}/posts`);
    const info = await db.read(`/social/heichelos/ikar/series/${series}/prateem`);
    console.log('SERIES', series, JSON.stringify(info));
    console.log('POSTS', series, JSON.stringify(summarize(posts), null, 2).slice(0, 8000));
    const ids = Array.isArray(posts) ? posts.map(x => x?.id || x?.postId || x).filter(Boolean) : Object.keys(posts || {});
    for (const postId of ids.slice(0, 5)) {
      const post = await db.read(`/social/heichelos/ikar/posts/${postId}`);
      console.log('POST', series, postId, JSON.stringify(summarize(post), null, 2).slice(0, 6000));
    }
  }
})().catch(error => { console.error(error); process.exit(1); });
