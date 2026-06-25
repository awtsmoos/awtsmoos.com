// B"H
import fs from 'node:fs/promises';
const files = {
  shardStore: 'geelooy/api/social/helper/awtsmoosDb/shardStore.js',
  civilizationStore: 'geelooy/api/social/helper/civilization/store.js',
  objectsStore: 'geelooy/api/social/helper/objects/store.js'
};
const checks = [];
function assert(ok, label, detail = {}) {
  if (!ok) { const e = new Error(label); e.detail = detail; throw e; }
  checks.push(label);
}
async function read(key) { return fs.readFile(files[key], 'utf8'); }
try {
  const shardStore = await read('shardStore');
  const civ = await read('civilizationStore');
  const obj = await read('objectsStore');
  assert(shardStore.includes('awtsmoosBinary/awtsmoosDB/index.js'), 'usesAwtsmoosDbModule');
  assert(shardStore.includes('root.socialShards'), 'usesNativeSocialShards');
  assert(civ.includes('../awtsmoosDb/shardStore.js'), 'civilizationUsesAwtsmoosDbShardStore');
  assert(obj.includes('../awtsmoosDb/shardStore.js'), 'objectsUsesAwtsmoosDbShardStore');
  for (const [name, text] of Object.entries({ civ, obj })) {
    assert(!text.includes('platformStore'), `${name}NoPlatformStore`);
    assert(!text.includes('socialPacked'), `${name}NoSocialPacked`);
    assert(!text.includes("shard: 'audit'"), `${name}NoAuditShardLiteral`);
    assert(!text.includes('listPackedRecords'), `${name}NoListPackedRecords`);
  }
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
