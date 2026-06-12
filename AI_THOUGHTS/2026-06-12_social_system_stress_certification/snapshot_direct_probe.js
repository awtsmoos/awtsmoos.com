// B"H
const path = require('path');
const DosDB = require('../../ayzarim/DosDB/index.js');
const { exportPackedSnapshot } = require('../../geelooy/API/social/helper/packed/snapshot.js');
(async () => {
  const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
  const db = new DosDB(dbRoot);
  await db.init();
  const started = Date.now();
  const snap = exportPackedSnapshot({ $i: { db } });
  console.log(JSON.stringify({
    ms: Date.now() - started,
    manifests: snap.manifests,
    migrations: snap.migrations,
    indexRecords: snap.indexStats.records,
    stats: snap.stats.map(s => ({ shard: s.shard, approximate: s.approximate, records: s.records, bytes: s.bytes }))
  }, null, 2));
})().catch(error => { console.error(error.stack || error); process.exit(1); });
