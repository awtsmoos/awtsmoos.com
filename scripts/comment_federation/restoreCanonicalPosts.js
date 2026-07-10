#!/usr/bin/env node
// B"H
const fs = require('fs');
const P = require('./restorePaths.js');
const { open, close, readRaw, encode } = require('./restoreDb.js');
const { buildPlan } = require('./tanachPlan.js');
const { buildBundles } = require('./tanachPosts.js');
function seriesPath(series) {
  return `/social/heichelos/ikar/series/${series}/posts.awtsmoosJSON`;
}
function cloneActive() {
  fs.rmSync(P.candidate, { force: true });
  fs.copyFileSync(P.active, P.candidate, fs.constants.COPYFILE_FICLONE);
}
function restoreLikkutei(target) {
  const source = open(P.likkuteiSource);
  const restored = [];
  try {
    for (let volume = 2; volume <= 29; volume++) {
      const series = `likkuteiSichosVolume${volume}`;
      const raw = readRaw(source, seriesPath(series));
      if (!raw) throw new Error(`Missing Likkutei source bundle: ${series}`);
      target.fs.write(seriesPath(series), raw);
      restored.push({ series, bytes: raw.length });
    }
  } finally { close(source); }
  return restored;
}
function restoreTanach(target) {
  const plan = buildPlan(), bundles = buildBundles(plan), restored = [];
  for (const [series, bundle] of bundles) {
    const raw = encode(bundle);
    target.fs.write(seriesPath(series), raw);
    restored.push({ series, posts: Object.keys(bundle).length, bytes: raw.length });
  }
  return restored;
}
function main() {
  cloneActive();
  const target = open(P.candidate, false);
  let likkutei, tanach;
  try {
    likkutei = restoreLikkutei(target);
    tanach = restoreTanach(target);
    target.fs.flush();
  } finally { close(target); }
  const report = {
    candidate: P.candidate,
    bytes: fs.statSync(P.candidate).size,
    likkutei,
    tanach,
    totals: {
      likkuteiSeries: likkutei.length,
      tanachSeries: tanach.length,
      tanachPosts: tanach.reduce((n, x) => n + x.posts, 0)
    }
  };
  fs.writeFileSync(`${P.candidate}.restore-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main();
