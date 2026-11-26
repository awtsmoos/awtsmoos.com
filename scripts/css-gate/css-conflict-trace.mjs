#!/usr/bin/env node
// B"H — css-conflict-trace.mjs
// CSS conflict detector + tracer for the Awtsmoos front end.
// Hai's law: small modular files, but NO EXTRA FILES EVER. Every conflict is
// traced to its specific file so rewrites go faster.
//
// STATIC mode (core, no browser):
//   node css-conflict-trace.mjs --files a.css b.css ... [--out dir] [--name x]
//   node css-conflict-trace.mjs --dir geelooy/style/social [--out dir]
// SERVED mode (live page's real load order, no browser):
//   node css-conflict-trace.mjs --url http://127.0.0.1:8080/social/ --name social
//   Fetches the page HTML, enumerates <link rel=stylesheet> in order, expands
//   CompactCSS bundle=[...] params into their source files (in order), fetches
//   each source file's real bytes, and traces conflicts across the exact set
//   the browser would load. Inline <style> blocks become pseudo-files.
// CASCADE: winner per (media-context, selector, property) = !important first,
//   then specificity, then later load order. Declarations that never win are
//   "shadowed"; files with zero winning declarations are EXTRA candidates.
// Output: <name>.md (human) + <name>.json (machine) in --out dir (default .).

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';

const args = process.argv.slice(2);
function opt(name, dflt) { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; }
function has(name) { return args.includes('--' + name); }
const outDir = opt('out', '.');
const name = opt('name', 'css-conflict-report');

// ---------- CSS parsing (small, dependency-free) ----------
function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ''); }

// Split a selector list on top-level commas (parens/brackets aware).
function splitSelectors(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function specificity(sel) {
  let a = 0, b = 0, c = 0; let s = sel;
  s = s.replace(/\[[^\]]*\]/g, () => { b++; return ' '; });           // attributes
  s = s.replace(/#[\w-]+/g, () => { a++; return ' '; });               // ids
  s = s.replace(/::[\w-]+(\([^)]*\))?/g, () => { c++; return ' '; });  // pseudo-elements
  s = s.replace(/:(not|is|matches|has)\(([^)]*)\)/g, (m, f, inner) => { // functional: count inner max roughly
    const innerSpec = specificity(inner); a += innerSpec[0]; b += innerSpec[1]; c += innerSpec[2]; return ' '; });
  s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => { b++; return ' '; });   // pseudo-classes
  s = s.replace(/\.[\w-]+/g, () => { b++; return ' '; });              // classes
  s = s.replace(/[>+~*]/g, ' ');
  for (const tok of s.split(/\s+/)) if (/^[a-zA-Z][\w-]*$/.test(tok)) c++; // elements
  return [a, b, c];
}
function cmpSpec(x, y) { for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; }

// Parse one stylesheet into flat declarations:
// {selector, property, value, important, context, order}
function parseCss(css, fileLabel, orderStart) {
  const decls = []; const rules = [];
  let order = orderStart;
  function parseBlock(text, context) {
    let i = 0; const n = text.length;
    while (i < n) {
      // read prelude up to { or ;
      let pre = ''; let depth = 0;
      while (i < n) {
        const ch = text[i];
        if (ch === '(' || ch === '[') depth++;
        if (ch === ')' || ch === ']') depth--;
        if (depth === 0 && (ch === '{' || ch === ';')) break;
        pre += ch; i++;
      }
      pre = pre.trim();
      if (i >= n) break;
      if (text[i] === ';') { i++; continue; } // @import etc: counted by caller, no decls
      // capture block body
      let d = 1; let j = i + 1; let body = '';
      while (j < n && d > 0) { if (text[j] === '{') d++; else if (text[j] === '}') { d--; if (d === 0) break; } body += text[j]; j++; }
      i = j + 1;
      if (!pre) continue;
      if (/^@(media|supports|layer|document)/i.test(pre)) {
        parseBlock(body, context ? context + ' | ' + pre.replace(/\s+/g, ' ') : pre.replace(/\s+/g, ' '));
      } else if (/^@keyframes/i.test(pre) || /^@font-face/i.test(pre) || /^@page/i.test(pre)) {
        continue; // not element selectors; skipped for conflict tracing
      } else if (pre.startsWith('@')) {
        parseBlock(body, context); // unknown at-rule wrapper: descend transparently
      } else {
        const sels = splitSelectors(pre.replace(/\s+/g, ' '));
        const bodyDecls = [];
        for (const part of body.split(';')) {
          const ci = part.indexOf(':'); if (ci < 0) continue;
          const prop = part.slice(0, ci).trim().toLowerCase();
          let val = part.slice(ci + 1).trim().replace(/\s+/g, ' ');
          if (!prop || !val) continue;
          let important = false;
          if (/!important\s*$/i.test(val)) { important = true; val = val.replace(/!important\s*$/i, '').trim(); }
          bodyDecls.push({ property: prop, value: val, important });
        }
        if (!bodyDecls.length) continue;
        for (const sel of sels) {
          rules.push({ file: fileLabel, selector: sel, context: context || '', declCount: bodyDecls.length, order });
          for (const bd of bodyDecls) decls.push({ file: fileLabel, selector: sel, context: context || '', ...bd, spec: specificity(sel), order });
          order++;
        }
      }
    }
  }
  parseBlock(stripComments(css), '');
  return { decls, rules, nextOrder: order };
}

// ---------- analysis ----------
function analyze(files) {
  // files: [{label, bytes, css}]
  let order = 0; const allDecls = []; const fileStats = new Map();
  for (const f of files) {
    const { decls, rules, nextOrder } = parseCss(f.css, f.label, order); order = nextOrder;
    for (const d of decls) allDecls.push(d);
    fileStats.set(f.label, { file: f.label, bytes: f.bytes, rules: rules.length, declarations: decls.length, wins: 0, losses: 0, shadowed: 0 });
  }
  const key = d => d.context + '\n' + d.selector + '\n' + d.property;
  const groups = new Map();
  for (const d of allDecls) { const k = key(d); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(d); }
  const conflicts = []; const shadowedDecls = [];
  let exactDupRules = 0;
  for (const [k, ds] of groups) {
    const filesInvolved = new Set(ds.map(d => d.file));
    if (ds.length === 1) { fileStats.get(ds[0].file).wins++; continue; }
    // winner: important > specificity > later order
    const sorted = [...ds].sort((x, y) => (y.important - x.important) || cmpSpec(y.spec, x.spec) || (y.order - x.order));
    const winner = sorted[0];
    fileStats.get(winner.file).wins++;
    const sameValue = ds.every(d => d.value === ds[0].value && d.important === ds[0].important);
    for (const d of sorted.slice(1)) {
      fileStats.get(d.file).losses++; fileStats.get(d.file).shadowed++; shadowedDecls.push(d);
    }
    if (filesInvolved.size > 1) {
      conflicts.push({
        context: ds[0].context || '(top level)', selector: ds[0].selector, property: ds[0].property,
        kind: sameValue ? 'duplicate-same-value' : 'conflict-different-values',
        winner: { file: winner.file, value: winner.value, important: winner.important },
        losers: sorted.slice(1).map(d => ({ file: d.file, value: d.value, important: d.important })),
        files: [...filesInvolved],
      });
    }
  }
  // exact-duplicate rules: same context+selector+identical decl set in >=2 files
  const ruleKey = new Map();
  {
    let o = 0; const perRule = new Map();
    for (const f of files) { const { rules } = parseCss(f.css, f.label, 0); for (const r of rules) {
      const ds = allDecls.filter(d => d.file === r.file && d.selector === r.selector && d.context === r.context);
      const sig = r.context + '\n' + r.selector + '\n' + ds.map(d => d.property + ':' + d.value + (d.important ? '!' : '')).sort().join(';');
      if (!perRule.has(sig)) perRule.set(sig, new Set()); perRule.get(sig).add(r.file);
    } }
    for (const [, fs] of perRule) if (fs.size > 1) exactDupRules++;
  }
  conflicts.sort((x, y) => (y.losers.length - x.losers.length) || y.files.length - x.files.length);
  const stats = [...fileStats.values()].sort((a, b) => b.bytes - a.bytes);
  const zeroWin = stats.filter(s => s.wins === 0);
  return {
    files: stats, totalBytes: stats.reduce((s, f) => s + f.bytes, 0),
    totalDeclarations: allDecls.length, totalRules: stats.reduce((s, f) => s + f.rules, 0),
    conflicts, crossFileConflicts: conflicts.length,
    differentValueConflicts: conflicts.filter(c => c.kind === 'conflict-different-values').length,
    sameValueDuplicates: conflicts.filter(c => c.kind === 'duplicate-same-value').length,
    exactDuplicateRules: exactDupRules, shadowedDeclarations: shadowedDecls.length,
    zeroWinFiles: zeroWin.map(s => s.file),
  };
}

// ---------- report ----------
function renderMd(title, mode, sourceDesc, r) {
  const L = [];
  L.push('# CSS conflict report — ' + title, '');
  L.push('Mode: ' + mode + ' · Source: ' + sourceDesc);
  L.push('Generated by scripts/css-gate/css-conflict-trace.mjs', '');
  L.push('## Headline', '');
  L.push('- Files loaded: **' + r.files.length + '**');
  L.push('- Total CSS bytes: **' + r.totalBytes + '** (' + (r.totalBytes / 1024).toFixed(1) + ' KB)');
  L.push('- Rules: ' + r.totalRules + ' · Declarations: ' + r.totalDeclarations);
  L.push('- Cross-file selector/property collisions: **' + r.crossFileConflicts + '** (' + r.differentValueConflicts + ' with DIFFERENT values = true conflicts, ' + r.sameValueDuplicates + ' same-value duplicates)');
  L.push('- Exact-duplicate rules in >=2 files: ' + r.exactDuplicateRules);
  L.push('- Shadowed declarations (never win the cascade): ' + r.shadowedDeclarations);
  L.push('- Files contributing ZERO winning declarations (EXTRA candidates): **' + r.zeroWinFiles.length + '**' + (r.zeroWinFiles.length ? ' — ' + r.zeroWinFiles.join(', ') : ''));
  L.push('', '## Files (load order as listed = analysis order; bytes desc)', '');
  L.push('| File | Bytes | Rules | Decls | Wins | Shadowed |');
  L.push('|---|---:|---:|---:|---:|---:|');
  for (const f of r.files) L.push('| ' + f.file + ' | ' + f.bytes + ' | ' + f.rules + ' | ' + f.declarations + ' | ' + f.wins + ' | ' + f.shadowed + ' |');
  L.push('', '## Top conflicts (winner = what the browser actually applies)', '');
  for (const c of r.conflicts.slice(0, 60)) {
    L.push('- `' + c.selector + '` · **' + c.property + '** [' + c.kind + ']' + (c.context !== '(top level)' ? ' · ' + c.context : ''));
    L.push('  - WINNER: ' + c.winner.file + ' → `' + c.winner.value + '`' + (c.winner.important ? ' !important' : ''));
    for (const l of c.losers) L.push('  - loses: ' + l.file + ' → `' + l.value + '`' + (l.important ? ' !important' : ''));
  }
  if (r.conflicts.length > 60) L.push('- …and ' + (r.conflicts.length - 60) + ' more in the JSON.');
  L.push('');
  return L.join('\n');
}

// ---------- inputs ----------
async function fetchText(url) { const res = await fetch(url); if (!res.ok) throw new Error(res.status + ' ' + url); return await res.text(); }

async function servedFiles(pageUrl) {
  const html = await fetchText(pageUrl);
  const base = new URL(pageUrl);
  const files = []; const seen = new Set();
  const linkRe = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi; let m;
  const ordered = [];
  while ((m = linkRe.exec(html))) {
    const tag = m[0]; const hrefM = tag.match(/href=["']([^"']+)["']/); if (!hrefM) continue;
    const href = hrefM[1];
    const bundleM = href.match(/bundle=([^&"']+)/);
    if (bundleM) {
      try { const list = JSON.parse(decodeURIComponent(bundleM[1])); for (const u of list) ordered.push(u); continue; } catch {}
    }
    ordered.push(href);
  }
  for (const u of ordered) {
    const abs = new URL(u, base).toString();
    if (seen.has(abs)) continue; seen.add(abs);
    const clean = new URL(u, base).pathname;
    try { const css = await fetchText(abs); files.push({ label: clean, bytes: Buffer.byteLength(css), css }); }
    catch (e) { files.push({ label: clean + ' (FETCH FAILED: ' + e.message + ')', bytes: 0, css: '' }); }
  }
  // inline <style> blocks
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi; let k = 0;
  while ((m = styleRe.exec(html))) { const css = m[1]; if (css.trim().length > 20) files.push({ label: '<inline style #' + (++k) + ' on page>', bytes: Buffer.byteLength(css), css }); }
  return files;
}

let files = [], mode = '', sourceDesc = '', title = name;
if (has('url')) {
  const url = opt('url'); mode = 'served (page load order, bundle-expanded, real served bytes; no browser)';
  sourceDesc = url; title = name;
  files = await servedFiles(url);
} else if (has('files')) {
  mode = 'static'; const list = args.slice(args.indexOf('--files') + 1).filter(a => !a.startsWith('--') && a.endsWith('.css'));
  // note: --files consumes following args until next flag; .css filter keeps it simple
  sourceDesc = list.join(', ');
  files = list.map(p => { const css = readFileSync(p, 'utf8'); return { label: p, bytes: Buffer.byteLength(css), css }; });
} else if (has('dir')) {
  mode = 'static (dir)'; const dir = opt('dir'); sourceDesc = dir;
  const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : (e.name.endsWith('.css') ? [join(d, e.name)] : []));
  files = walk(dir).sort().map(p => { const css = readFileSync(p, 'utf8'); return { label: p, bytes: Buffer.byteLength(css), css }; });
} else {
  console.error('Usage: --url <page> | --files a.css... | --dir <dir>  [--name x] [--out dir]');
  process.exit(2);
}

const r = analyze(files);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, name + '.md'), renderMd(title, mode, sourceDesc, r));
writeFileSync(join(outDir, name + '.json'), JSON.stringify({ title, mode, source: sourceDesc, generatedAt: new Date().toISOString(), ...r }, null, 1));
console.log(JSON.stringify({ name, files: r.files.length, bytes: r.totalBytes, conflicts: r.crossFileConflicts, diffValue: r.differentValueConflicts, sameValue: r.sameValueDuplicates, exactDupRules: r.exactDuplicateRules, shadowed: r.shadowedDeclarations, zeroWinFiles: r.zeroWinFiles }, null, 1));
