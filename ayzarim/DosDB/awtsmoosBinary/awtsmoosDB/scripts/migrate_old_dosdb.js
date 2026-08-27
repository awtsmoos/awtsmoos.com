// B"H

/**
 * @file scripts/migrate_old_dosdb.js
 * @chapter The Caravan Into One File
 * @description
 * Migrates any old DosDB file/folder tree into the new single-file AwtsmoosDB
 * without importing the old implementation. JSON files become live objects;
 * binary files become range-readable blobs; folders become nested records.
 *
 * Usage:
 *   node scripts/migrate_old_dosdb.js old-folder-or-file new.awtsdb imported
 */

const path = require('path');
const AwtsmoosDB = require('../index.js');

async function main() {
  const oldPath = process.argv[2];
  const newPath = process.argv[3] || path.resolve('migrated.awtsdb');
  const rootKey = process.argv[4] || 'imported';

  if (!oldPath) throw new Error('B"H: Provide an old DosDB file or folder path to migrate.');

  const db = new AwtsmoosDB(newPath, { compression: true, turboWrites: true, wal: true });
  db.open();

  const stats = db.DosDB.importPath(oldPath, { rootKey });
  db.waitForIdle();
  db.close();

  console.log(`B"H migrated ${stats.files} files, ${stats.dirs} dirs, ${stats.bytes} bytes -> ${newPath} at root.${rootKey}`);
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
