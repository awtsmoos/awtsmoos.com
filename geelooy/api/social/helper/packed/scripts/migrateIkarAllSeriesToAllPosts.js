#!/usr/bin/env node
//B"H
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

function arg(name, fallback = '') {
  const found = process.argv.find(item => item === `--${name}` || item.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.includes('=') ? found.split('=').slice(1).join('=') : 'yes';
}

function intArg(name, fallback) {
  const parsed = Number(arg(name, fallback));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function listSeriesWithPosts({ dbPath, heichelId }) {
  const seriesRoot = path.join(dbPath, 'social', 'heichelos', heichelId, 'series');
  const entries = await fsp.readdir(seriesRoot, { withFileTypes: true });
  const series = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const postsFile = path.join(seriesRoot, entry.name, 'posts.awtsmoosJSON');
    try {
      const stat = await fsp.stat(postsFile);
      if (stat.isFile() && stat.size > 0) series.push({ id: entry.name, bytes: stat.size });
    } catch {}
  }
  return series.sort((a, b) => a.id.localeCompare(b.id));
}

async function writeJson(file, value) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function compactSeriesReport(series, report) {
  return {
    seriesId: series.id,
    sourceBytes: series.bytes,
    total: report.total,
    plannedToMirror: report.plannedToMirror,
    mirrored: report.mirrored,
    skipped: report.skipped,
    failed: Array.isArray(report.failed) ? report.failed.length : 0
  };
}

function addTotals(totals, compact) {
  totals.total += compact.total || 0;
  totals.plannedToMirror += compact.plannedToMirror || 0;
  totals.mirrored += compact.mirrored || 0;
  totals.skipped += compact.skipped || 0;
  totals.failed += compact.failed || 0;
}

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
