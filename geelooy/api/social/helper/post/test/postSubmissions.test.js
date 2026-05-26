//B"H
const assert = require('assert');
const postSubmissions = require('../submissions.js');

function makeDb() {
  const store = new Map();
  return {
    store,
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : path + '/';
      const children = {};
      for (const [key, value] of store.entries()) {
        if (key.startsWith(prefix)) {
          const rest = key.slice(prefix.length);
          if (rest && !rest.includes('/')) children[rest] = value;
        }
      }
      return Object.keys(children).length ? children : undefined;
    },
    async write(path, value) { store.set(path, value); return { path, value }; },
    async delete(path) { const old = store.get(path); store.delete(path); return { path, old }; },
    async arrayAppend(path, value) {
      const current = store.get(path) || [];
      current.push(value);
      store.set(path, current);
      return { path, value };
    }
  };
}

async function run() {
  const db = makeDb();
  await db.write('/social/heichelos/h1/settings/submissions', {
    allowPostSubmissions: true,
    requirePostApproval: true
  });

  const $i = {
    db,
    $_POST: {
      aliasId: 'authorA',
      title: 'A submitted light',
      content: 'Please approve this vessel.',
      seriesId: 'root'
    },
    async fetchAwtsmoos(path) {
      if (path.includes('/ownership')) return { no: true };
      return null;
    }
  };

  const state = await postSubmissions.shouldSubmitPostForApproval({ $i, heichelId: 'h1', aliasId: 'authorA' });
  assert.equal(state.shouldSubmit, true);

  const submitted = await postSubmissions.submitPostForApproval({ $i, heichelId: 'h1', seriesId: 'root' });
  assert.equal(submitted.success.submitted, true);

  const all = await postSubmissions.getSubmittedPosts({ $i, heichelId: 'h1' });
  const postId = Object.keys(all.success)[0];
  assert.ok(postId);
  assert.equal(all.success[postId].title, 'A submitted light');

  await db.write('/social/heichelos/h1/editors', ['owner']);
  $i.$_POST = { aliasId: 'owner' };
  $i.fetchAwtsmoos = async () => ({});
  const approved = await postSubmissions.approveSubmittedPost({
    $i,
    heichelId: 'h1',
    postId,
    approverAliasId: 'owner',
    async addPostToSeries({ isApproval }) {
      assert.equal(isApproval, true);
      return { success: { postId: 'approvedPost' } };
    }
  });
  assert.equal(approved.success.approved, postId);

  $i.$_POST = {
    aliasId: 'authorB',
    title: 'Denied light',
    content: 'No.',
    seriesId: 'root'
  };
  const second = await postSubmissions.submitPostForApproval({ $i, heichelId: 'h1', seriesId: 'root' });
  const deniedId = second.success.postId;
  const denied = await postSubmissions.denySubmittedPost({ $i, heichelId: 'h1', postId: deniedId, approverAliasId: 'owner' });
  assert.equal(denied.success.denied, deniedId);

  console.log('B"H postSubmissions.test passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
