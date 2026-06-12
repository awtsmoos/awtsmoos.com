// B"H
const path = require('path');
const DosDB = require('../../ayzarim/DosDB/index.js');
const { exportPackedSnapshot } = require('../../geelooy/API/social/helper/packed/snapshot.js');
const { scanPackedIntegrity } = require('../../geelooy/API/social/helper/packed/repairScanner.js');
const { listPackedKeys } = require('../../geelooy/API/social/helper/packed/packedReader.js');
(async () => {
  const db = new DosDB(path.resolve('../../dayuhChadash'));
  await db.init();
  const $i = { db };
  let t = Date.now();
  const s = exportPackedSnapshot({ $i });
  console.log('snapshotMs', Date.now() - t, s.stats.length, s.stats[0]?.approximate);
  t = Date.now();
  const i = scanPackedIntegrity({ $i });
  console.log('integrityMs', Date.now() - t, i.approximate, i.badEdges.length);
  t = Date.now();
  const k = listPackedKeys({ $i, shard: 'core', prefix: '/posts', limit: 20 });
  console.log('keysMs', Date.now() - t, k.count, k.bounded);
})().catch(error => { console.error(error); process.exit(1); });
