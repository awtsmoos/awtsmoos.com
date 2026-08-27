#!/usr/bin/env node
//B"H
/**
 * @file migrateConnectedPostsToAwtsdb.js
 * @description
 * Chapter 109: A CLI vessel for connected posts only.
 *
 * Usage:
 *   node geelooy/api/social/helper/packed/scripts/migrateConnectedPostsToAwtsdb.js --dry
 *   node geelooy/api/social/helper/packed/scripts/migrateConnectedPostsToAwtsdb.js --write --heichel=ikar
 *
 * The script uses the AwtsmoosDB/DosDB root, writes new packed `.awtsdb` files,
 * keeps legacy data intact, and skips orphan posts not connected by series.
 */

const path = require('path');
const DosDB = require('../../../../../../ayzarim/DosDB/index.js');
const { runPostMigration } = require('../postMigration.js');

function arg(name, fallback = '') {
  const found = process.argv.find(item => item === `--${name}` || item.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.includes('=') ? found.split('=').slice(1).join('=') : 'yes';
}

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const db = new DosDB(dbPath);
  await db.init();
  process.awtsmoosDbPath = dbPath;
  const dryRun = !arg('write', '') || Boolean(arg('dry', ''));
  const report = await runPostMigration({
    $i: { db },
    heichelId: arg('heichel', ''),
    seriesId: arg('series', ''),
    limit: Number(arg('limit', 10000)),
    dryRun
  });
  console.log(JSON.stringify({ B_H: true, dbPath, dryRun, report }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
