#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const { open, close, files, decode, objectKeys } = require('./dbTools.js');
const root = path.resolve(__dirname, '../..');
const packed = path.resolve(root, '../../dayuhChadash/socialPacked');
const outFile = path.resolve(root, 'ai_thoughts/20260710_posts_active_compaction/reference-reconciliation-report.json');
function activeIndex() {
  const db = open(path.join(packed, 'social.heichel.ikar.posts.fs.awtsdb'));
  const active = new Set(), seriesInfo = {};
  try {
    for (const inode of files(db)) {
      const match = inode.path.match(/^\/social\/heichelos\/ikar\/series\/([^/]+)\/posts(?:\.awtsmoosJSON)?$/);
      if (!match) continue;
      const ids = objectKeys(decode(db, inode));
      seriesInfo[match[1]] = { bytes: Number(inode.size), posts: ids.length, placeholder: Number(inode.size) <= 1 };
      for (const id of ids) active.add(`${match[1]}\u0000${id}`);
    }
  } finally { close(db); }
  return { active, seriesInfo };
}
function corpusRefs(file, regex) {
  const db = open(file), refs = [];
  try {
    for (const inode of files(db)) {
      const match = inode.path.match(regex);
      if (match) refs.push({ series: match[1], post: match[2], path: inode.path, bytes: Number(inode.size) });
    }
  } finally { close(db); }
  return refs;
}
function shardRefs(dir) {
  const refs = new Map();
  for (const name of fs.readdirSync(dir).filter(x => x.endsWith('.awtsdb'))) {
    const alias = name.replace(/\.comments\.fs\.awtsdb$/, ''), db = open(path.join(dir, name));
    try {
      for (const inode of files(db)) {
        const match = inode.path.match(/^\/bySeries\/([^/]+)\/byPost\/([^/]+)\/comments\.awtsmoosJSON$/);
        if (!match) continue;
        const key = `${match[1]}\u0000${match[2]}`;
        const row = refs.get(key) || { series: match[1], post: match[2], aliases: [], bytes: 0 };
        row.aliases.push(alias);
        row.bytes += Number(inode.size);
        refs.set(key, row);
      }
    } finally { close(db); }
  }
  return [...refs.values()];
}
function compare(name, refs, active, seriesInfo) {
  const exact = [], missing = [], placeholders = [];
  for (const ref of refs) {
    if (active.has(`${ref.series}\u0000${ref.post}`)) exact.push(ref);
    else {
      missing.push(ref);
      if (seriesInfo[ref.series]?.placeholder) placeholders.push(ref);
    }
  }
  return {
    name,
    total: refs.length,
    exact: exact.length,
    missing: missing.length,
    placeholderSeriesRefs: placeholders.length,
    exactSample: exact.slice(0, 20),
    missingSample: missing.slice(0, 20)
  };
}
function main() {
  const { active, seriesInfo } = activeIndex();
  const corpusRegex = /^\/social\/heichelos\/ikar\/comments\/atSeries\/([^/]+)\/atPost\/([^/]+)\/[^/]+$/;
  const likkutei = corpusRefs(path.join(packed, 'social.heichel.ikar.comments.corpus.likkuteiSichos.alias.likkutei_translation_en.v2.fs.awtsdb'), corpusRegex);
  const sefer = corpusRefs(path.join(packed, 'social.heichel.ikar.comments.corpus.seferHaSichos.alias.sefer_hasichos_translation_en.v2.fs.awtsdb'), corpusRegex);
  const tanach = shardRefs(path.join(packed, 'commentShards/tanach'));
  const meluket = corpusRefs(path.join(packed, 'social.heichel.ikar.comments.fs.awtsdb'), /^\/social\/heichelos\/ikar\/comments\/atSeries\/([^/]*meluket[^/]*)\/atPost\/([^/]+)\/(?:meluket_translation_en|awtsmoosTranslations(?:\.awtsmoosJSON)?|awtsmoos\.awtsmoosJSON)$/i);
  const report = {
    generatedAt: new Date().toISOString(),
    activePostPairs: active.size,
    activeSeries: Object.keys(seriesInfo).length,
    placeholderSeries: Object.entries(seriesInfo).filter(([, value]) => value.placeholder).map(([key]) => key),
    families: [
      compare('likkuteiSichos', likkutei, active, seriesInfo),
      compare('seferHaSichos', sefer, active, seriesInfo),
      compare('tanach', tanach, active, seriesInfo),
      compare('meluket', meluket, active, seriesInfo)
    ]
  };
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main();
