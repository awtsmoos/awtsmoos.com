// B"H
/**
 * @file test.js
 * @description
 * Chapter 10: The bridge is tested in miniature. One old post, one section, one
 * rooted comment, and one graph edge are placed in a tiny memory world; the
 * living view must reveal them without writing, migrating, or breaking the old
 * coordinates.
 */

const assert = require('assert');
const { livingPostView } = require('./index.js');

function makeDb() {
  const store = new Map();
  return {
    store,
    async write(path, value) {
      store.set(path, value);
      return { path, value };
    },
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : `${path}/`;
      const out = {};
      for (const [key, value] of store.entries()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (!rest || rest.includes('/')) continue;
        out[rest] = value;
      }
      return Object.keys(out).length ? out : undefined;
    }
  };
}

async function seed($i) {
  await $i.db.write('/social/heichelos/h1/posts/p1', {
    id: 'p1',
    title: 'A Living Post',
    content: 'Root fire',
    aliasId: 'author',
    parentSeriesId: 'root',
    sections: [{ id: 'v1', title: 'Verse One', content: 'Verse body' }]
  });
  await $i.db.write('/social/heichelos/h1/posts/p1/commentTree/roots', ['c1']);
  await $i.db.write('/social/heichelos/h1/posts/p1/commentTree/comments/c1/data', {
    id: 'c1',
    aliasId: 'reader',
    content: 'A comment spark',
    verseSection: 'v1',
    createdAt: 7
  });
  await $i.db.write('/social/heichelos/h1/posts/p1/commentTree/comments/c1/children', []);
}

(async () => {
  const $i = { db: makeDb(), $_GET: {}, request: { method: 'GET' } };
  await seed($i);
  const view = await livingPostView({ $i, heichelId: 'h1', seriesId: 'root', postId: 'p1' });
  assert.equal(view.success.identity.id, 'p1');
  assert.equal(view.success.identity.aliasId, 'author');
  assert.equal(view.success.content.sections[0].id, 'v1');
  assert.equal(view.success.social.commentCount, 1);
  assert.equal(view.success.social.commentsByVerse.v1[0].id, 'c1');
  assert.equal(view.success.preservation.readOnly, true);
  assert.ok(view.success.navigation.readerUrl.includes('/heichelos/h1/series/root/p1'));
  console.log('B"H livingEntityView.test passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
