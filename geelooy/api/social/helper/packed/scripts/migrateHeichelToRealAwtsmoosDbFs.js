#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateHeichelToRealAwtsmoosDbFs.js
 * @description
 * Chapter 27: Every old file enters the ark as itself.
 *
 * This copies the physical heichel tree into one real AwtsmoosDB virtual
 * filesystem. Every file is copied as raw bytes into one blob token at the same
 * virtual path. No AwtsmoosJSON is parsed. No post/comment map is unpacked.
 * The old folder remains untouched.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const { arg, writeJson, acquireLock, walkFiles, streamFileIntoBlob, setVirtualBlob, virtualPath } = require('./migrateHeichelFsHelpers.js');

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const heichelId = arg('heichel', 'ikar');
  const heichelRoot = path.join(dbPath, 'social', 'heichelos', heichelId);
  const outFile = path.resolve(dbPath, 'socialPacked', arg('out', `social.heichel.${heichelId}.fs.awtsdb`));
  const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/${heichelId}-real-fs-migration-report.json`));
  await fsp.mkdir(path.dirname(outFile), { recursive: true });
  for (const suffix of ['', '.wal', '.lock']) if (fs.existsSync(outFile + suffix)) fs.rmSync(outFile + suffix, { force: true });
  const release = acquireLock(outFile + '.migration.lock');
  const db = new AwtsmoosDB(outFile, { compression: false, reuseFreedSpace: 'verified' });
  db.open();

  try {
    const files = await walkFiles(heichelRoot);
    const report = { B_H: true, engine: 'real-awtsmoosDB', mode: 'raw-files-as-native-db-fs-blobs', dbPath, heichelRoot, outFile, heichelId, filesDiscovered: files.length, filesCopied: 0, bytesCopied: 0, current: null, samples: [], startedAt: Date.now(), pid: process.pid };
    await writeJson(reportPath, report);
    for (const file of files) {
      report.current = { rel: file.rel, bytes: file.bytes };
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
      const blob = await streamFileIntoBlob(db, file);
      setVirtualBlob(db, virtualPath(heichelId, file.rel), blob);
      report.filesCopied++;
      report.bytesCopied += file.bytes;
      if (report.samples.length < 20) report.samples.push({ rel: file.rel, bytes: file.bytes });
      report.current = null;
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
    }
    await db.waitForIdle();
    report.finishedAt = Date.now();
    report.dbInfo = db.info();
    await writeJson(reportPath, report);
    console.log(JSON.stringify({ B_H: true, reportPath, outFile, filesCopied: report.filesCopied, bytesCopied: report.bytesCopied }, null, 2));
  } finally {
    db.close();
    release();
  }
}

main().catch(async error => {
  await writeJson(path.resolve(process.cwd(), '.awtsmoos-tmp/real-fs-migration-error.json'), { B_H: true, error: error.message, stack: error.stack, at: Date.now() }).catch(() => {});
  console.error(error);
  process.exit(1);
});