#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateHeichelFamiliesToRealAwtsmoosDbFs.js
 * @description
 * Chapter 39: The forest is carved once, then sealed into three arks.
 *
 * This migrates `dayuhChadash/social/heichelos/:heichel` into family-separated
 * real AwtsmoosDB filesystem files:
 * - comments: everything under `/comments`
 * - posts: every `series/:series/posts.awtsmoosJSON`
 * - series: all other files under `/series`
 *
 * Every file is copied as raw bytes into a native AwtsmoosDB blob. A plain
 * virtual filesystem tree is built in memory per family and assigned once to
 * `db.root.__fs__`, avoiding repeated deep live-handle mutations. No
 * AwtsmoosJSON is parsed. No map is exploded.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const {
	FAMILIES, arg, writeJson, acquireLock, walkFiles, familyFor,
	streamFileIntoBlob, virtualPath, setTreeBlob, openDbs, sealDbs
} = require('./migrateHeichelFamiliesFsHelpers.js');

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const heichelId = arg('heichel', 'ikar');
  const heichelRoot = path.join(dbPath, 'social', 'heichelos', heichelId);
  const packedDir = path.join(dbPath, 'socialPacked');
  const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/${heichelId}-family-fs-migration-report.json`));
  const lockPath = path.resolve(process.cwd(), `.awtsmoos-tmp/${heichelId}-family-fs-migration.lock`);
  await fsp.mkdir(packedDir, { recursive: true });
  const release = acquireLock(lockPath);
  const report = { B_H: true, engine: 'real-awtsmoosDB', mode: 'family-separated-tree-sealed-native-blobs', heichelId, dbPath, heichelRoot, packedDir, families: {}, filesDiscovered: 0, filesCopied: 0, bytesCopied: 0, current: null, startedAt: Date.now(), pid: process.pid };
  for (const family of FAMILIES) report.families[family] = { filesCopied: 0, bytesCopied: 0, outFile: outFileFor({ packedDir, heichelId, family }) };
  await writeJson(reportPath, report);
  let dbs;
  try {
    const files = await walkFiles(heichelRoot);
    report.filesDiscovered = files.length;
    await writeJson(reportPath, report);
    dbs = openDbs({ packedDir, heichelId });
    for (const file of files) {
      const family = familyFor(file.rel);
      report.current = { rel: file.rel, bytes: file.bytes, family };
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
      const blob = await streamFileIntoBlob(dbs[family].db, file);
      setTreeBlob(dbs[family].tree, virtualPath(heichelId, file.rel), blob);
      report.filesCopied++;
      report.bytesCopied += file.bytes;
      report.families[family].filesCopied++;
      report.families[family].bytesCopied += file.bytes;
      report.current = null;
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
    }
    await sealDbs(dbs);
    for (const family of FAMILIES) report.families[family].dbInfo = dbs[family].info;
    report.finishedAt = Date.now();
    await writeJson(reportPath, report);
    console.log(JSON.stringify({ B_H: true, reportPath, filesCopied: report.filesCopied, bytesCopied: report.bytesCopied, families: report.families }, null, 2));
  } finally {
    if (dbs) for (const family of Object.keys(dbs)) try { dbs[family].db.close(); } catch {}
    release();
  }
}

main().catch(async error => {
  await writeJson(path.resolve(process.cwd(), '.awtsmoos-tmp/family-fs-migration-error.json'), { B_H: true, error: error.message, stack: error.stack, at: Date.now() }).catch(() => {});
  console.error(error);
  process.exit(1);
});