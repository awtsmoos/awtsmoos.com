//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateIkarAllSeriesHelpers.js
 * @description Shared helpers extracted verbatim from migrateIkarAllSeriesToAllPosts.js.
 */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

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

module.exports = { arg, intArg, listSeriesWithPosts, writeJson, compactSeriesReport, addTotals };