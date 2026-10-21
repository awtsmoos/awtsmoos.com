//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateIkarPostsHelpers.js
 * @description Shared helpers extracted verbatim from migrateIkarPostsToRealAwtsmoosDb.js.
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

module.exports = { arg, intArg, writeJson, acquireRunLock, listSeriesWithPostMaps, readPostMap, ensureMap, ensureVirtualRoot, countPosts, migrateSeries };