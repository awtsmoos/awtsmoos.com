#!/usr/bin/env node
// B"H
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const childProcess = require('child_process');

const DEFAULT_SKIP = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache']);

function emit(row) {
  process.stdout.write(JSON.stringify(row) + '\n');
}

function decode() {
  const raw = process.argv[2] || '';
  if (!raw) throw new Error('missing_scan_payload');
  return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
}

function inside(root, target) {
  const full = path.resolve(root, target || '.');
  const rel = path.relative(root, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Path outside root: ' + full);
  return full;
}

function rel(root, full) {
  return path.relative(root, full).replace(/\\/g, '/') || '.';
}

function skipName(name, options = {}) {
  if (options.includeHidden !== true && name.startsWith('.') && name !== '.') return true;
  const excludes = new Set([...(options.exclude || []), ...DEFAULT_SKIP]);
  return excludes.has(name);
}

async function runTree(input) {
  const root = path.resolve(input.root || process.cwd());
  const start = inside(root, input.path || input.p || '.');
  const maxDepth = Math.max(0, Number(input.depth ?? input.maxDepth ?? 8));
  const maxNodes = Math.max(1, Number(input.maxNodes || 5000));
  const summary = { files: 0, directories: 0, skipped: 0, extensions: {}, truncated: false };
  let seen = 0;
  emit({ type: 'meta', action: 'treeStart', root, path: rel(root, start), startedAt: new Date().toISOString() });
  async function walk(full, depth) {
    if (seen >= maxNodes) { summary.truncated = true; return; }
    const st = await fsp.lstat(full).catch(() => null);
    if (!st) return;
    const name = path.basename(full);
    const isDirectory = st.isDirectory();
    seen += 1;
    if (isDirectory) summary.directories += 1; else summary.files += 1;
    if (!isDirectory) {
      const ext = path.extname(name).toLowerCase() || '[none]';
      summary.extensions[ext] = (summary.extensions[ext] || 0) + 1;
    }
    emit({ type: 'node', path: rel(root, full), name, depth, isDirectory, sizeBytes: st.size, mtimeMs: st.mtimeMs });
    if (!isDirectory || depth >= maxDepth) return;
    const entries = await fsp.readdir(full, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (skipName(entry.name, input)) {
        summary.skipped += 1;
        emit({ type: 'skip', path: rel(root, path.join(full, entry.name)), reason: 'default_exclude_or_hidden' });
        continue;
      }
      await walk(path.join(full, entry.name), depth + 1);
      if (summary.truncated) break;
    }
  }
  await walk(start, 0);
  emit({ type: 'summary', ...summary, completedAt: new Date().toISOString() });
}

async function runRg(input) {
  const root = path.resolve(input.root || process.cwd());
  const cwd = inside(root, input.path || input.p || '.');
  const query = String(input.query || input.pattern || input.find || '');
  if (!query) throw new Error('missing_query');
  emit({ type: 'meta', action: 'rgStart', root, path: rel(root, cwd), query, startedAt: new Date().toISOString() });
  if (await hasRg()) return await runNativeRg(root, cwd, query, input);
  return await runJsSearch(root, cwd, query, input);
}

function rgArgs(query, input = {}) {
  const args = ['--json', '--line-number', '--column', '--no-heading'];
  if (input.literal !== false && !input.regex) args.push('--fixed-strings');
  if (input.caseSensitive === false || input.ignoreCase === true) args.push('-i');
  if (input.hidden === true || input.includeHidden === true) args.push('--hidden');
  args.push('-g', '!node_modules/**', '-g', '!.git/**', '-g', '!dist/**', '-g', '!build/**');
  for (const glob of input.glob ? [].concat(input.glob) : []) args.push('-g', String(glob));
  args.push(query, '.');
  return args;
}

async function runNativeRg(root, cwd, query, input) {
  const maxMatches = Math.max(1, Number(input.maxMatches || 10000));
  const child = childProcess.spawn('rg', rgArgs(query, input), { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  let count = 0;
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    for (const line of chunk.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const parsed = parseRgJson(root, cwd, line);
      if (!parsed) continue;
      count += 1;
      if (count <= maxMatches) emit(parsed);
    }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => emit({ type: 'warning', message: chunk.trim() }));
  await new Promise(resolve => child.on('close', resolve));
  emit({ type: 'summary', engine: 'rg', matches: Math.min(count, maxMatches), truncated: count > maxMatches, completedAt: new Date().toISOString() });
}

function parseRgJson(root, cwd, line) {
  try {
    const evt = JSON.parse(line);
    if (evt.type !== 'match') return null;
    const file = path.resolve(cwd, evt.data.path.text);
    const submatches = evt.data.submatches || [];
    return {
      type: 'match',
      path: rel(root, file),
      lineNumber: evt.data.line_number,
      column: submatches[0]?.start + 1 || 1,
      text: evt.data.lines.text
    };
  } catch (_) {
    return null;
  }
}

async function runJsSearch(root, cwd, query, input) {
  const needle = input.caseSensitive === true ? query : query.toLowerCase();
  const maxMatches = Math.max(1, Number(input.maxMatches || 10000));
  const summary = { engine: 'js-fallback', matches: 0, scannedFiles: 0, skipped: 0, truncated: false };
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (skipName(entry.name, input)) { summary.skipped += 1; continue; }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else await scanFile(full);
      if (summary.truncated) return;
    }
  }
  async function scanFile(file) {
    summary.scannedFiles += 1;
    const text = await fsp.readFile(file, 'utf8').catch(() => null);
    if (text == null) return;
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      const hay = input.caseSensitive === true ? line : line.toLowerCase();
      const column = hay.indexOf(needle);
      if (column < 0 || summary.truncated) return;
      summary.matches += 1;
      if (summary.matches > maxMatches) { summary.truncated = true; return; }
      emit({ type: 'match', path: rel(root, file), lineNumber: index + 1, column: column + 1, text: line });
    });
  }
  await walk(cwd);
  emit({ type: 'summary', ...summary, completedAt: new Date().toISOString() });
}

async function hasRg() {
  return await new Promise(resolve => {
    const child = childProcess.spawn('rg', ['--version'], { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('close', code => resolve(code === 0));
  });
}

(async () => {
  const input = decode();
  if (input.mode === 'rg') return await runRg(input);
  return await runTree(input);
})().catch(error => {
  emit({ type: 'error', error: error.message, stack: error.stack });
  process.exitCode = 1;
});
