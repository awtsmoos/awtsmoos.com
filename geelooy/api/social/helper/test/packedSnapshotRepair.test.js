//B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packed = require('../packed/socialPacked.js');
const { writePacked } = packed;
const { exportPackedSnapshot } = require('../packed/snapshot.js');
const { scanPackedIntegrity, repairMissingPostManifests } = require('../packed/repairScanner.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-packed-repair-'));
const $i = { db: { directory: tmp } };

writePacked({ $i, shard: 'core', key: '/posts/h1/legacy', value: { id: 'legacy', heichelId: 'h1', aliasId: 'a1', title: 'Legacy' }, meta: { kind: 'post', type: 'post' } });
let scan = scanPackedIntegrity({ $i });
assert.equal(scan.ok, false);
assert.equal(scan.missingPostManifests.length, 1);

const repair = repairMissingPostManifests({ $i });
assert.equal(repair.repaired, 1);
scan = scanPackedIntegrity({ $i });
assert.equal(scan.ok, true);

packed.mirrorPost({ $i, post: { id: 'p1', heichelId: 'h1', aliasId: 'a1', contentType: 'question', title: 'Q' } });
packed.mirrorGraphReference({ $i, reference: { id: 'g1', kind: 'references', from: { type: 'post', id: 'p1' }, to: { type: 'alias', id: 'a1' } } });
const snapshot = exportPackedSnapshot({ $i });
assert.ok(snapshot.stats.some(item => item.shard === 'core'));
assert.ok(snapshot.indexStats.records >= 1);
assert.ok(snapshot.manifests >= 2);
assert.ok(Array.isArray(snapshot.manifestKeys));

fs.rmSync(tmp, { recursive: true, force: true });
console.log('B"H packedSnapshotRepair.test passed');
