// B"H
const fs = require('fs');
const p = 'scripts/migrate_dayuh_chadash_grouped.js';
let s = fs.readFileSync(p, 'utf8');
function rep(find, replace) {
  if (!s.includes(find)) throw new Error('Missing pattern: ' + find.slice(0, 160));
  s = s.replace(find, replace);
}

rep(
`  const manifestJsonl = boolArg(args.manifestJsonl, true);
  const manifestFile = `${out}.manifest.jsonl`;`,
`  const manifestJsonl = boolArg(args.manifestJsonl, true);
  const heartbeatMs = Math.max(250, Number(args.heartbeatMs || 1000));
  const maxStepMs = Math.max(0, Number(args.maxStepMs || 0));
  const logEvery = Math.max(1, Number(args.logEvery || 1));
  const manifestFile = `${out}.manifest.jsonl`;`
);

rep(
`  log(` + '`rootKey=${ROOT_KEY} verifySamples=${verifySamples} manifestJsonl=${manifestJsonl}`' + `);`,
`  log(` + '`rootKey=${ROOT_KEY} verifySamples=${verifySamples} manifestJsonl=${manifestJsonl} heartbeatMs=${heartbeatMs} maxStepMs=${maxStepMs || "disabled"} logEvery=${logEvery}`' + `);`
);

rep(
`  const clock = new Clock();
  clock.lap('collect start');`,
`  const clock = new Clock();
  const heartbeat = new Heartbeat({ enabled: progress, intervalMs: heartbeatMs, maxStepMs, logEvery });
  clock.lap('collect start');`
);

rep(
`  const { files, dirs } = collect(source, progress);`,
`  const { files, dirs } = collect(source, progress, heartbeat);`
);

rep(
`    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      try {
        const raw = fs.readFileSync(item.abs);
        const hash = sha256(raw);
        const storeId = dirSet.has(item.id) ? `${item.id}/__value` : item.id;
        const imported = importValue(db, item, raw);
        const valueSeal = db.builder.build(imported.value);
        addPathEntry(childEntries, storeId, valueSeal);`,
`    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      const step = heartbeat.startStep('file', i + 1, files.length, item.rel, stats);
      try {
        heartbeat.tick('file:read', i + 1, files.length, item.rel, stats);
        const raw = fs.readFileSync(item.abs);
        const hash = sha256(raw);
        const storeId = dirSet.has(item.id) ? `${item.id}/__value` : item.id;
        heartbeat.tick('file:decode', i + 1, files.length, item.rel, stats, { size: raw.length });
        const imported = importValue(db, item, raw);
        heartbeat.tick('file:build', i + 1, files.length, item.rel, stats, { kind: imported.kind, size: raw.length });
        const valueSeal = db.builder.build(imported.value);
        heartbeat.tick('file:index', i + 1, files.length, item.rel, stats, { kind: imported.kind, size: raw.length });
        addPathEntry(childEntries, storeId, valueSeal);`
);

rep(
`        if (progress && ((i + 1) % 500 === 0 || i + 1 === files.length)) {
          writeSameLine(` + '`B"H grouped values ${i + 1}/${files.length} db=${formatBytes(safeFileSize(out))} in=${formatBytes(stats.bytes)} ${trimMiddle(item.rel, 60)}`' + `);
        }`,
`        heartbeat.endStep(step, 'file:done', i + 1, files.length, item.rel, stats, { kind: imported.kind, size: raw.length, dbSize: safeFileSize(out) });`
);

rep(
`      } catch (err) {
        errors.push({ rel: item.rel, abs: item.abs, error: err && err.stack ? err.stack : String(err) });
      }`,
`      } catch (err) {
        heartbeat.failStep(step, 'file:error', i + 1, files.length, item.rel, stats, err);
        errors.push({ rel: item.rel, abs: item.abs, error: err && err.stack ? err.stack : String(err) });
      }`
);

rep(
`    for (let i = 0; i < orderedDirs.length; i++) {
      const dir = orderedDirs[i];
      const entries = childEntries.get(dir) || [];
      const dictSeal = buildDictionary(db, entries);
      dirSeals.set(dir, dictSeal);`,
`    for (let i = 0; i < orderedDirs.length; i++) {
      const dir = orderedDirs[i];
      const entries = childEntries.get(dir) || [];
      const step = heartbeat.startStep('dir', i + 1, orderedDirs.length, dir, stats, { children: entries.length });
      const dictSeal = buildDictionary(db, entries);
      heartbeat.tick('dir:built', i + 1, orderedDirs.length, dir, stats, { children: entries.length });
      dirSeals.set(dir, dictSeal);`
);

rep(
`      if (progress && ((i + 1) % 500 === 0 || i + 1 === orderedDirs.length)) {
        writeSameLine(` + '`B"H grouped dirs ${i + 1}/${orderedDirs.length} ${trimMiddle(dir, 70)}`' + `);
      }`,
`      heartbeat.endStep(step, 'dir:done', i + 1, orderedDirs.length, dir, stats, { children: entries.length, dbSize: safeFileSize(out) });`
);

rep(
`    const rootEntries = childEntries.get('') || [];
    const rootSeal = buildDictionary(db, rootEntries);`,
`    const rootEntries = childEntries.get('') || [];
    const rootStep = heartbeat.startStep('root', 1, 1, ROOT_KEY, stats, { children: rootEntries.length });
    const rootSeal = buildDictionary(db, rootEntries);
    heartbeat.endStep(rootStep, 'root:done', 1, 1, ROOT_KEY, stats, { children: rootEntries.length, dbSize: safeFileSize(out) });`
);

rep(
`function collect(source, progress) {`,
`function collect(source, progress, heartbeat) {`
);

rep(
`    if (progress && seenDirs % 500 === 0) writeSameLine(` + '`B"H grouped collecting dirs=${seenDirs} files=${files.length}`' + `);`,
`    if (heartbeat) heartbeat.tick('collect', seenDirs, 0, relPath(source, abs) || '.', { files: files.length, dirs: seenDirs, bytes: 0 });
    else if (progress && seenDirs % 500 === 0) writeSameLine(` + '`B"H grouped collecting dirs=${seenDirs} files=${files.length}`' + `);`
);

rep(
`class Clock {
  constructor() { this.start = Date.now(); }
  elapsed() { return Date.now() - this.start; }
  lap(msg) { log(`${msg} (${this.elapsed()}ms)`); }
}
`,
`class Clock {
  constructor() { this.start = Date.now(); }
  elapsed() { return Date.now() - this.start; }
  lap(msg) { log(`${msg} (${this.elapsed()}ms)`); }
}

class Heartbeat {
  constructor({ enabled = true, intervalMs = 1000, maxStepMs = 0, logEvery = 1 } = {}) {
    this.enabled = enabled;
    this.intervalMs = intervalMs;
    this.maxStepMs = maxStepMs;
    this.logEvery = logEvery;
    this.last = 0;
    this.startedAt = Date.now();
    this.phaseStartedAt = this.startedAt;
  }

  startStep(phase, index, total, name, stats = {}, extra = {}) {
    const step = { phase, index, total, name, startedAt: Date.now() };
    this.tick(`${phase}:start`, index, total, name, stats, extra, true);
    return step;
  }

  endStep(step, phase, index, total, name, stats = {}, extra = {}) {
    const elapsed = Date.now() - step.startedAt;
    this.tick(phase, index, total, name, stats, { ...extra, stepMs: elapsed }, elapsed >= this.intervalMs || index % this.logEvery === 0 || index === total);
    if (this.maxStepMs > 0 && elapsed > this.maxStepMs) {
      throw new Error(`B"H: ${step.phase} step exceeded maxStepMs=${this.maxStepMs}; elapsed=${elapsed}ms; item=${name}`);
    }
  }

  failStep(step, phase, index, total, name, stats = {}, err) {
    const elapsed = Date.now() - step.startedAt;
    this.tick(phase, index, total, name, stats, { stepMs: elapsed, error: err && err.message ? err.message : String(err) }, true);
  }

  tick(phase, index, total, name, stats = {}, extra = {}, force = false) {
    if (!this.enabled) return;
    const now = Date.now();
    if (!force && now - this.last < this.intervalMs && index % this.logEvery !== 0) return;
    this.last = now;
    const pct = total ? `${((index / total) * 100).toFixed(1)}%` : '...';
    const elapsedSec = Math.max(0.001, (now - this.startedAt) / 1000);
    const rate = total ? `${(index / elapsedSec).toFixed(1)}/s` : '';
    const mem = process.memoryUsage();
    const parts = [
      `B"H ${phase}`,
      total ? `${index}/${total}` : `${index}`,
      pct,
      rate,
      `in=${formatBytes(stats.bytes || 0)}`,
      `files=${stats.files || 0}`,
      `dirs=${stats.dirs || 0}`,
      `rss=${formatBytes(mem.rss)}`,
      `heap=${formatBytes(mem.heapUsed)}`
    ];
    if (extra.kind) parts.push(`kind=${extra.kind}`);
    if (extra.size !== undefined) parts.push(`item=${formatBytes(extra.size)}`);
    if (extra.children !== undefined) parts.push(`children=${extra.children}`);
    if (extra.dbSize !== undefined) parts.push(`db=${formatBytes(extra.dbSize)}`);
    if (extra.stepMs !== undefined) parts.push(`step=${extra.stepMs}ms`);
    if (extra.error) parts.push(`err=${safeOneLine(extra.error)}`);
    parts.push(trimMiddle(name, 72));
    writeSameLine(parts.filter(Boolean).join(' '));
  }
}
`
);

rep(
`function safeFileSize(file) { try { return file && fs.existsSync(file) ? fs.statSync(file).size : 0; } catch (_err) { return 0; } }
function writeSameLine(text) { process.stdout.write(` + '`\r${text}`' + `); }`,
`function safeFileSize(file) { try { return file && fs.existsSync(file) ? fs.statSync(file).size : 0; } catch (_err) { return 0; } }
function safeOneLine(value) { return String(value || '').replace(/\s+/g, ' ').slice(0, 180); }
function writeSameLine(text) { process.stdout.write(` + '`\r${text}`' + `); }`
);

fs.writeFileSync(p, s);
console.log('patched grouped heartbeat progress');
