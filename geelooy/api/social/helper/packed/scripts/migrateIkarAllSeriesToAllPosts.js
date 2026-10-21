#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateIkarAllSeriesToAllPosts.js
 * @description
 * Chapter 16: The runner writes its footsteps before entering each gate.
 *
 * It discovers real series folders with posts.awtsmoosJSON from disk, migrates
 * only active connected posts from those series maps, and records progress
 * before each series so a timeout cannot hide where the journey paused.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const DosDB = require('../../../../../../ayzarim/DosDB/index.js');
const { runPostMigration } = require('../postMigration.js');
const { allShardStats } = require('../socialPacked.js');

const { arg, intArg, listSeriesWithPosts, writeJson, compactSeriesReport, addTotals } = require('./migrateIkarAllSeriesHelpers.js');

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const heichelId = arg('heichel', 'ikar');
  const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/${heichelId}-all-series-allPosts-report.json`));
  const startAt = intArg('start', 0);
  const maxSeries = intArg('maxSeries', 1000000);
  const limitPerSeries = intArg('limitPerSeries', 1000000);
  const db = new DosDB(dbPath);
  await db.init();
  process.awtsmoosDbPath = dbPath;

  const allSeries = await listSeriesWithPosts({ dbPath, heichelId });
  const selected = allSeries.slice(startAt, startAt + maxSeries);
  const report = {
    B_H: true,
    mode: 'all-series-connected-posts-to-allPosts-awtsdb',
    dbPath,
    heichelId,
    startedAt: Date.now(),
    startAt,
    maxSeries,
    discoveredSeries: allSeries.length,
    selectedSeries: selected.length,
    processedSeries: 0,
    currentSeries: null,
    totals: { total: 0, plannedToMirror: 0, mirrored: 0, skipped: 0, failed: 0 },
    series: []
  };
  await writeJson(reportPath, report);

  for (const series of selected) {
    report.currentSeries = { id: series.id, sourceBytes: series.bytes, startedAt: Date.now() };
    report.updatedAt = Date.now();
    await writeJson(reportPath, report);
    const migrated = await runPostMigration({ $i: { db }, heichelId, seriesId: series.id, limit: limitPerSeries, dryRun: false });
    const compact = compactSeriesReport(series, migrated);
    report.series.push(compact);
    report.processedSeries++;
    addTotals(report.totals, compact);
    report.currentSeries = null;
    report.updatedAt = Date.now();
    await writeJson(reportPath, report);
  }

  report.finishedAt = Date.now();
  report.stats = allShardStats({ $i: { db } });
  await writeJson(reportPath, report);
  console.log(JSON.stringify({ B_H: true, reportPath, discoveredSeries: report.discoveredSeries, processedSeries: report.processedSeries, totals: report.totals }, null, 2));
}

main().catch(async error => {
  const fallback = path.resolve(process.cwd(), '.awtsmoos-tmp/ikar-all-series-allPosts-error.json');
  await writeJson(fallback, { B_H: true, error: error.message, stack: error.stack, at: Date.now() }).catch(() => {});
  console.error(error);
  process.exit(1);
});