//B"H
const assert = require('assert');
const communityRoutes = require('../../../_awtsmoos.community.js');
const contentRoutes = require('../../../_awtsmoos.content.js');
const commentRoutes = require('../../comments/routes/rich.js');
function makeDb() {
  const store = new Map();
  return {
    store,
    async write(path, value) { store.set(path, value); return { path, value }; },
    async delete(path) { store.delete(path); return { path }; },
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : path + '/';
      const out = {};
      for (const [key, value] of store.entries()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (rest && !rest.includes('/')) out[rest] = value;
      }
      return Object.keys(out).length ? out : undefined;
    }
  };
}
function req(db, method, aliasId, post = {}, get = {}) { return { db, request: { method }, $_POST: { aliasId, ...post }, $_GET: { aliasId, ...get }, async fetchAwtsmoos() { return {}; } }; }
(async () => {
  const db = makeDb();
  await db.write('/social/aliases/me/heichelos/profile', 'profile-me');
  await db.write('/social/aliases/other/heichelos/profile', 'profile-other');
  await db.write('/users/user-other/aliases/other', { id: 'other' });
  await db.write('/users/user-me/aliases/me', { id: 'me' });
  await db.write('/social/heichelos/profile-me/editors', ['me']);
  await db.write('/social/heichelos/community-open/editors', ['me']);
  await db.write('/social/heichelos/profile-me/settings/community', { allowPublicSubmissions: true, requireModeratorApproval: true, allowPosts: true, allowComments: true });
  await db.write('/social/heichelos/community-open/settings/community', { allowPublicSubmissions: true, requireModeratorApproval: true, allowPosts: true, allowComments: true });

  let $i = req(db, 'POST', 'me', { postId: 'self-direct', title: 'My own profile post', content: 'root', sections: JSON.stringify([{ id: 'v1', verseSection: 'v1', title: 'Verse', content: 'Text', assets: [{ id: 'img1', type: 'image', publicPath: '/img.png' }], segments: [{ id: 's1', content: 'sub' }] }]) });
  let content = contentRoutes({ $i });
  const selfDirect = await content['/content/heichelos/:heichel/posts']({ heichel: 'profile-me' });
  assert.equal(selfDirect.success.contentType, 'post');
  assert.equal(selfDirect.success.sections[0].assets[0].id, 'img1');

  $i = req(db, 'POST', 'other', { postId: 'other-pending', title: 'Other into my Heichel', content: 'pending body', sections: JSON.stringify([{ id: 'v2', verseSection: 'v2', content: 'other verse' }]) });
  content = contentRoutes({ $i });
  const pending = await content['/content/heichelos/:heichel/posts']({ heichel: 'profile-me' });
  assert.equal(pending.success.status, 'pending');
  assert.equal(pending.success.aliasId, 'other');

  $i = req(db, 'GET', 'me', {}, { search: 'Other' });
  let community = communityRoutes({ $i });
  const queue = await community['/heichelos/:heichel/review']({ heichel: 'profile-me' });
  assert.equal(queue.success.total, 1);

  $i = req(db, 'POST', 'me', { publish: false });
  community = communityRoutes({ $i });
  const approved = await community['/heichelos/:heichel/review/:review/approve']({ heichel: 'profile-me', review: pending.success.id });
  assert.equal(approved.success.status, 'approved');

  $i = req(db, 'POST', 'other', { postId: 'shared-to-open', title: 'Share to easy found Heichel', content: 'share', targetHeichelIds: ['profile-other', 'community-open'] });
  content = contentRoutes({ $i });
  const shared = await content['/content/heichelos/:heichel/posts']({ heichel: 'community-open' });
  assert.equal(shared.success.status, 'pending');

  $i = req(db, 'POST', 'other', { content: 'Root comment with image', verseSection: 'v1', subsectionId: '', assets: JSON.stringify([{ id: 'commentImg', type: 'image', publicPath: '/comment.png' }]) });
  const comments = commentRoutes({ $i, userid: 'user-other' });
  const comment = await comments['/heichelos/:heichel/posts/:post/comment-tree']({ heichel: 'profile-me', post: 'self-direct' });
  assert.equal(comment.success.verseSection, 'v1');
  assert.equal(comment.success.assets[0].id, 'commentImg');

  $i = req(db, 'POST', 'other', { content: 'Subsection reply', verseSection: 'v1', subsectionId: 's1' });
  const subsectionComment = await commentRoutes({ $i, userid: 'user-other' })['/heichelos/:heichel/posts/:post/comment-tree']({ heichel: 'profile-me', post: 'self-direct' });
  assert.equal(subsectionComment.success.subsectionId, 's1');
  console.log('B"H multiAccountApiJourney.test passed');
})().catch(error => { console.error(error); process.exit(1); });
