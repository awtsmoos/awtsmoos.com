// B"H
import fs from 'node:fs/promises';
const files = {
  socialPacked: 'geelooy/api/social/helper/packed/socialPacked.js',
  packedReader: 'geelooy/api/social/helper/packed/packedReader.js',
  compactor: 'geelooy/api/social/helper/packed/compactor.js',
  postBridge: 'geelooy/api/social/helper/packed/postPackedBridge.js',
  allPosts: 'geelooy/api/social/helper/packed/allPostsIndex.js',
  platformStore: 'geelooy/api/social/helper/platform/platformStore.js',
  assets: 'geelooy/api/social/helper/assets/assetManifest.js',
  drafts: 'geelooy/api/social/helper/editor/postDrafts.js',
  settings: 'geelooy/api/social/helper/governance/heichelSettings.js',
  roles: 'geelooy/api/social/helper/governance/roles.js',
  invites: 'geelooy/api/social/helper/governance/invites.js',
  submissions: 'geelooy/api/social/helper/governance/submissions.js',
  notifications: 'geelooy/api/social/helper/notifications.js',
  commentsVectorCompat: 'geelooy/api/social/helper/comments/commentVectorSearchPacked.js'
};
const checks = [];
function assert(ok, label, detail = {}) { if (!ok) { const e = new Error(label); e.detail = detail; throw e; } checks.push(label); }
async function read(key) { return fs.readFile(files[key], 'utf8'); }
try {
  assert((await read('socialPacked')).includes("../awtsmoosDb/shardStore.js"), 'socialPackedCompatibilityUsesAwtsmoosDb');
  assert(!(await read('socialPacked')).includes('jsonlShard'), 'socialPackedNoJsonlShard');
  assert(!(await read('packedReader')).includes('fs.'), 'packedReaderNoFsScan');
  assert(!(await read('compactor')).includes('jsonlShard'), 'compactorNoJsonlShard');
  assert((await read('postBridge')).includes('AwtsmoosDB.allPosts'), 'postBridgeAwtsmoosDbSource');
  assert((await read('allPosts')).includes('../awtsmoosDb/shardStore.js'), 'allPostsIndexUsesAwtsmoosDb');
  for (const key of ['platformStore','assets','drafts','settings','roles','invites','submissions','notifications','commentsVectorCompat']) {
    const text = await read(key);
    assert(text.includes('awtsmoosDb/shardStore.js'), `${key}UsesAwtsmoosDb`);
    assert(!text.includes('../packed/') && !text.includes('./packed/'), `${key}NoPackedImport`);
    assert(!text.includes('writePacked') && !text.includes('readPacked') && !text.includes('listPackedRecords'), `${key}NoPackedApiCall`);
  }
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
