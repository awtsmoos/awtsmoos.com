//B"H
/**
 * Chapter 6: The API bridge held old clay in one hand and packed fire in the other.
 *
 * The Awtsmoos recreates every record every instant, so the reader must never
 * worship only one vessel. This test proves packed-only posts can be listed,
 * read singly, merged with legacy ids, and filtered by property.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packed = require('../packed/socialPacked.js');
const bridge = require('../packed/postPackedBridge.js');

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-post-bridge-'));
  const $i = { db: { directory: tmp } };

  packed.mirrorPost({
    $i,
    post: {
      id: 'packedOnly',
      heichelId: 'h1',
      seriesId: 'branch',
      title: 'Packed Flame',
      author: 'a1',
      category: 'light'
    }
  });

  const listed = bridge.listPackedPosts({ $i, heichelId: 'h1', seriesId: 'branch' });
  assert.equal(listed.length, 1);
  assert.equal(listed[0].title, 'Packed Flame');

  const one = bridge.readPackedPost({ $i, heichelId: 'h1', seriesId: 'branch', postId: 'packedOnly' });
  assert.equal(one.author, 'a1');

  const mergedIds = bridge.mergePostIds(['legacyOne'], listed);
  assert.deepEqual(mergedIds.sort(), ['legacyOne', 'packedOnly']);

  const mergedPosts = bridge.mergePosts([{ id: 'legacyOne', title: 'Old Clay' }], listed);
  assert.deepEqual(mergedPosts.map(post => post.id).sort(), ['legacyOne', 'packedOnly']);

  const filtered = bridge.filterPackedPostIds({ posts: listed, propertyKey: 'category', propertyValue: 'light' });
  assert.deepEqual(filtered, ['packedOnly']);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('B"H postPackedBridge.test passed');
})().catch(error => { console.error(error); process.exit(1); });
