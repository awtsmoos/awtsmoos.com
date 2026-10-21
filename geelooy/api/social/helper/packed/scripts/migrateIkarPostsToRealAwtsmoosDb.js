#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateIkarPostsToRealAwtsmoosDb.js
 * @description
 * Chapter 23: One kohen enters the ark; duplicate writers remain outside.
 *
 * The old live shape is preserved inside one real binary AwtsmoosDB file:
 *   social/heichelos/:heichel/series/:series/posts.awtsmoosJSON
 *
 * No comments are touched. No posts are exploded into individual fake log keys.
 * A lock file prevents multiple tunnel-timeout launches from writing the same
 * real database at once.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const DosDB = require('../../../../../../ayzarim/DosDB/index.js');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const { arg, intArg, writeJson, acquireRunLock, listSeriesWithPostMaps, migrateSeries } = require('./migrateIkarPostsHelpers.js');

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const heichelId = arg('heichel', 'ikar');
  const outFile = path.resolve(dbPath, 'socialPacked', arg('out', 'social.posts.real.awtsdb'));
  const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/${heichelId}-real-awtsmoosdb-posts-report.json`));
  const start = intArg('start', 0);
  const maxSeries = intArg('maxSeries', 1000000);
  const lockPath = `${outFile}.migration.lock`;
  await fsp.mkdir(path.dirname(outFile), { recursive: true });
  const releaseLock = acquireRunLock(lockPath);

  try {
    for (const suffix of ['', '.wal', '.lock']) if (fs.existsSync(outFile + suffix)) fs.rmSync(outFile + suffix, { force: true });
    const legacyDb = new DosDB(dbPath);
    await legacyDb.init();
    const realDb = new AwtsmoosDB(outFile, { compression: true, autoCompress: true });
    await realDb.open();
    const allSeries = await listSeriesWithPostMaps({ dbPath, heichelId });
    const selected = allSeries.slice(start, start + maxSeries);
    const report = { B_H: true, engine: 'real-awtsmoosDB', mode: 'posts-awtsmoosJSON-maps-as-virtual-filesystem', dbPath, outFile, heichelId, discoveredSeries: allSeries.length, selectedSeries: selected.length, processedSeries: 0, totalPosts: 0, totalSourceBytes: 0, currentSeries: null, series: [], startedAt: Date.now(), pid: process.pid };
    await writeJson(reportPath, report);

    try {
      for (const series of selected) {
        report.currentSeries = series;
        report.updatedAt = Date.now();
        await writeJson(reportPath, report);
        const item = await migrateSeries({ db: realDb, legacyDb, heichelId, series });
        report.series.push(item);
        report.processedSeries++;
        report.totalPosts += item.postCount;
        report.totalSourceBytes += item.sourceBytes;
        report.currentSeries = null;
        report.updatedAt = Date.now();
        await writeJson(reportPath, report);
      }
      await realDb.waitForIdle();
      report.finishedAt = Date.now();
      report.dbInfo = realDb.info();
      await writeJson(reportPath, report);
    } finally {
      await realDb.close();
    }
    console.log(JSON.stringify({ B_H: true, reportPath, outFile, processedSeries: report.processedSeries, totalPosts: report.totalPosts, physicalBytes: report.dbInfo?.physicalBytes }, null, 2));
  } finally {
    releaseLock();
  }
}

main().catch(async error => {
  const reportPath = path.resolve(process.cwd(), '.awtsmoos-tmp/real-awtsmoosdb-posts-error.json');
  await writeJson(reportPath, { B_H: true, error: error.message, stack: error.stack, at: Date.now() }).catch(() => {});
  console.error(error);
  process.exit(1);
});