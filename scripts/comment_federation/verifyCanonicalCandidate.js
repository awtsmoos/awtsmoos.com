#!/usr/bin/env node
// B"H
const crypto = require('crypto');
const path = require('path');
const P = require('./restorePaths.js');
const { open, close, files, readRaw, decodeRaw } = require('./restoreDb.js');
const { buildPlan } = require('./tanachPlan.js');
function seriesPath(series) { return `/social/heichelos/ikar/series/${series}/posts.awtsmoosJSON`; }
function keys(value) { return Object.keys(value || {}).filter(k => k !== '$awtsmoosObjectShape'); }
function hash(raw) { return crypto.createHash('sha256').update(raw || Buffer.alloc(0)).digest('hex'); }
function corpusRefs() {
  const db = open(P.likkuteiCorpus), refs = [];
  try {
    for (const inode of files(db)) {
      const m = inode.path.match(/^\/social\/heichelos\/ikar\/comments\/atSeries\/([^/]+)\/atPost\/([^/]+)\/likkutei_translation_en$/);
      if (m) refs.push({ series: m[1], post: m[2] });
    }
  } finally { close(db); }
  return refs;
}
function verifyLikkutei(candidate) {
  let exact = 0;
  for (const ref of corpusRefs()) {
    const bundle = decodeRaw(readRaw(candidate, seriesPath(ref.series)));
    if (!bundle?.[ref.post]) throw new Error(`Missing Likkutei post: ${ref.series}/${ref.post}`);
    exact++;
  }
  if (exact !== 735) throw new Error(`Likkutei reference count changed: ${exact}`);
  return exact;
}
function verifyTanach(candidate) {
  const plan = buildPlan();
  let posts = 0, verses = 0;
  for (const [series, items] of plan.grouped) {
    const bundle = decodeRaw(readRaw(candidate, seriesPath(series)));
    const ids = plan.posts.get(series);
    if (keys(bundle).length !== items.length) throw new Error(`Tanach post count mismatch: ${series}`);
    items.forEach((item, index) => {
      const post = bundle?.[ids[index]];
      const source = Object.values(item.data.body.verses || {}).map(v => String(v?.hebrew?.text || '').trim());
      const actual = (post?.dayuh?.sections || []).map(v => String(Array.isArray(v) ? v.join(' ') : v).trim());
      if (JSON.stringify(actual) !== JSON.stringify(source)) throw new Error(`Tanach Hebrew mismatch: ${series}/${ids[index]}`);
      posts++;
      verses += actual.length;
    });
  }
  if (posts !== 929) throw new Error(`Tanach post count changed: ${posts}`);
  return { posts, verses };
}
function verifyUntouched(active, candidate) {
  const targets = new Set([...Array.from({ length: 28 }, (_, i) => `likkuteiSichosVolume${i + 2}`), ...buildPlan().grouped.keys()]);
  let checked = 0;
  for (const inode of files(active)) {
    const m = inode.path.match(/^\/social\/heichelos\/ikar\/series\/([^/]+)\/posts(?:\.awtsmoosJSON)?$/);
    if (!m || targets.has(m[1])) continue;
    const a = readRaw(active, inode.path), b = readRaw(candidate, inode.path);
    if (hash(a) !== hash(b)) throw new Error(`Non-target series changed: ${m[1]}`);
    checked++;
  }
  return checked;
}
function main() {
  const active = open(P.active), candidate = open(P.candidate);
  try {
    const report = {
      likkuteiExact: verifyLikkutei(candidate),
      tanach: verifyTanach(candidate),
      untouchedSeries: verifyUntouched(active, candidate)
    };
    console.log(JSON.stringify(report, null, 2));
  } finally { close(active); close(candidate); }
}
main();
