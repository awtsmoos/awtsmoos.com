// B"H
const fs = require('fs');
const path = require('path');
const { open, close, files, readRaw, decodeRaw } = require('./restoreDb.js');
const P = require('./restorePaths.js');
function timestamp(id) { return Number(String(id).match(/BH_POST_(\d+)/)?.[1] || 0); }
function collectPostIds() {
  const bySeries = new Map();
  for (const name of fs.readdirSync(P.tanachShards).filter(x => x.endsWith('.awtsdb'))) {
    const db = open(path.join(P.tanachShards, name));
    try {
      for (const inode of files(db)) {
        const m = inode.path.match(/^\/bySeries\/([^/]+)\/byPost\/([^/]+)\/comments\.awtsmoosJSON$/);
        if (!m) continue;
        const set = bySeries.get(m[1]) || new Set();
        set.add(m[2]);
        bySeries.set(m[1], set);
      }
    } finally { close(db); }
  }
  return new Map([...bySeries].map(([k, set]) => [k, [...set].sort((a, b) => timestamp(a) - timestamp(b))]));
}
function articleSeriesMap() {
  const file = path.join(P.tanachShards, 'torah_translation_en.comments.fs.awtsdb');
  const db = open(file), map = new Map();
  try {
    for (const inode of files(db)) {
      const m = inode.path.match(/^\/bySeries\/([^/]+)\/byPost\/([^/]+)\/comments\.awtsmoosJSON$/);
      if (!m) continue;
      const rows = decodeRaw(readRaw(db, inode.path));
      const row = Array.isArray(rows) && rows.find(x => x?.dayuh?.tanachAlignment?.articleId);
      if (row) map.set(Number(row.dayuh.tanachAlignment.articleId), m[1]);
    }
  } finally { close(db); }
  return map;
}
function buildPlan() {
  const source = JSON.parse(fs.readFileSync(P.tanachJson, 'utf8'));
  const posts = collectPostIds(), articleMap = articleSeriesMap(), bookMap = new Map();
  for (const item of source) {
    const series = articleMap.get(Number(item.data.body['article-id']));
    const title = item.data.titles[2];
    if (!series) continue;
    const existing = bookMap.get(title);
    if (existing && existing !== series) throw new Error(`Book mapping conflict: ${title}`);
    bookMap.set(title, series);
  }
  const grouped = new Map();
  for (const item of source) {
    const series = bookMap.get(item.data.titles[2]);
    if (!series) throw new Error(`Unmapped canonical book: ${item.data.titles[2]}`);
    const list = grouped.get(series) || [];
    list.push(item);
    grouped.set(series, list);
  }
  if (source.length !== 929 || posts.size !== 39) throw new Error('Tanach universe count changed');
  for (const [series, items] of grouped) {
    if (items.length !== posts.get(series)?.length) throw new Error(`Chapter count mismatch: ${series}`);
  }
  return { source, posts, grouped, bookMap };
}
module.exports = { buildPlan, timestamp };
