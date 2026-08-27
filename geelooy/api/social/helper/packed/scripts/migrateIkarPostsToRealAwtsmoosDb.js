#!/usr/bin/env node
//B"H
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

function arg(name, fallback = '') {
  const found = process.argv.find(item => item === `--${name}` || item.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.includes('=') ? found.split('=').slice(1).join('=') : 'yes';
}

function intArg(name, fallback) {
  const parsed = Number(arg(name, fallback));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function writeJson(file, value) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function acquireRunLock(file) {
  try {
    const fd = fs.openSync(file, 'wx');
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: Date.now() }, null, 2));
    return () => { try { fs.closeSync(fd); } catch {} try { fs.rmSync(file, { force: true }); } catch {} };
  } catch (error) {
    throw new Error(`Migration already running or stale lock exists: ${file}`);
  }
}

async function listSeriesWithPostMaps({ dbPath, heichelId }) {
  const root = path.join(dbPath, 'social', 'heichelos', heichelId, 'series');
  const entries = await fsp.readdir(root, { withFileTypes: true });
  const series = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(root, entry.name, 'posts.awtsmoosJSON');
    try {
      const stat = await fsp.stat(file);
      if (stat.isFile() && stat.size > 0) series.push({ id: entry.name, bytes: stat.size });
    } catch {}
  }
  return series.sort((a, b) => a.id.localeCompare(b.id));
}

async function readPostMap({ legacyDb, heichelId, seriesId }) {
  const value = await legacyDb.get(`/social/heichelos/${heichelId}/series/${seriesId}/posts`, { max: true });
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

async function ensureMap(parent, key, db) {
  if (!parent[key]) await parent.set(key, new db.Map());
  return parent[key];
}

async function ensureVirtualRoot(db, heichelId) {
  if (!db.root.social) db.root.social = new db.Map();
  if (!db.root.social.heichelos) db.root.social.heichelos = new db.Map();
  const heichel = await ensureMap(db.root.social.heichelos, heichelId, db);
  if (!heichel.series) heichel.series = new db.Map();
  return heichel.series;
}

function countPosts(map) { return Object.keys(map || {}).length; }

async function migrateSeries({ db, legacyDb, heichelId, series }) {
  const posts = await readPostMap({ legacyDb, heichelId, seriesId: series.id });
  const seriesRoot = await ensureVirtualRoot(db, heichelId);
  const seriesNode = await ensureMap(seriesRoot, series.id, db);
  await seriesNode.set('posts.awtsmoosJSON', posts);
  await seriesNode.set('posts.meta.awtsmoosJSON', {
    migratedAt: Date.now(),
    source: `/social/heichelos/${heichelId}/series/${series.id}/posts.awtsmoosJSON`,
    sourceBytes: series.bytes,
    postCount: countPosts(posts),
    format: 'awtsmoosJSON-object-map-inside-real-awtsmoosDB'
  });
  return { seriesId: series.id, sourceBytes: series.bytes, postCount: countPosts(posts) };
}

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
