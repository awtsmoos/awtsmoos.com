#!/usr/bin/env node
// B"H
// merkava-shot — Instant screenshot + visual verification via Merkava's
// native software renderer. NO CHROME. Pure Merkava.
//
// Classic (unchanged):
//   node merkava-shot.mjs --url <url> --out shot.png [--width 1280 --height 800 --full]
//   node merkava-shot.mjs --html '<h1>hi</h1>' --out shot.png
//   node merkava-shot.mjs --file page.html --out shot.png
//
// Visual verification (Yaakov 2026-10-12 — LAW 9):
//   --device iphone14            viewport preset (see --devices)
//   --viewport 390x844           explicit viewport (overrides --width/--height)
//   --dpr 2                      device pixel ratio (1-3)
//   --interact "steps"           scripted interaction sequence (see ops below)
//   --batch batch.json           warm multi-page run, one process
//   --serve                      persistent NDJSON protocol on stdin
//   --fast                       fast PNG encode (zlib level 1)
//   --profile                    print stage timings
//
// Interaction ops (semicolon-separated; use \; for a literal semicolon):
//   shot[:path]  click:x,y|click:.sel  tap:...  hover:...  dblclick:...
//   scroll:dy  scrollto:y  type:.sel:text  press:Enter  wait:ms
//   state:.sel:+open (-open ~open)  hide:.sel  show:.sel
//   attr:.sel:name=value  style:.sel:prop=value
//   assert:visible:.sel  assert:hidden:.sel  assert:text:.sel:sub  assert:bg:.sel:#hex
//   viewport:390x844  log:message
//
// Example (LAW 9 tap-test — sheet must close):
//   node merkava-shot.mjs --file reader.html --device iphone14 --fast \
//     --interact "shot:before.png;click:.close-x;state:.sheet:-open;assert:hidden:.sheet;shot:after.png"
//
// Serve protocol (stdin, one JSON object per line):
//   {"cmd":"load","html":"...","viewport":"390x844","dpr":2}
//   {"cmd":"load","url":"https://..."} | {"cmd":"load","file":"page.html"}
//   {"cmd":"run","steps":"click:.btn;shot"}          -> {ok, report}
//   {"cmd":"shot","out":"x.png"}                     -> {ok, path, bytes, ms}
//   {"cmd":"viewport","viewport":"390x844","dpr":2}
//   {"cmd":"quit"}
import { writeFileSync, readFileSync } from 'fs';
import { createInterface } from 'readline';
import { pathToFileURL } from 'url';
import { renderVirtualSnapshotPng } from './geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/virtualPngRenderer.js';
import { VerifySession, VIEWPORT_PRESETS, parseInteract, runBatch } from './geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/verifySession.js';

// B"H — programmatic core, shared by the CLI, the live API, the tunnel, and SDKs.
export { runPage, VIEWPORT_PRESETS, VERSION as CORE_VERSION } from './geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaCore.mjs';
export { runJs, VERSION as JS_CORE_VERSION } from './geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaJsCore.mjs';

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(name);

function resolveViewport() {
  const device = arg('--device');
  let width = parseInt(arg('--width', '1280'), 10);
  let height = parseInt(arg('--height', '800'), 10);
  let dpr = parseInt(arg('--dpr', '1'), 10);
  const vp = arg('--viewport');
  if (vp) {
    const m = vp.match(/^(\d+)x(\d+)$/);
    if (!m) { console.error(`bad --viewport ${vp}, want WxH`); process.exit(1); }
    width = +m[1]; height = +m[2];
  } else if (device) {
    const p = VIEWPORT_PRESETS[device];
    if (!p) { console.error(`unknown --device ${device}; try --devices`); process.exit(1); }
    width = p.width; height = p.height; dpr = p.dpr;
  }
  return { width, height, dpr: Math.max(1, Math.min(3, dpr || 1)) };
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Merkava/1.0 (screenshot)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function loadHtml() {
  const url = arg('--url');
  const htmlArg = arg('--html');
  const file = arg('--file');
  if (url) { console.log(`Fetching ${url} ...`); return await fetchHtml(url); }
  if (file) return readFileSync(file, 'utf8');
  if (htmlArg) return htmlArg;
  console.error('Need one of: --url, --file, --html');
  process.exit(1);
}

function printReport(report) {
  for (const s of report.steps) {
    const mark = s.ok ? 'ok' : 'FAIL';
    console.log(`  [${mark}] ${s.op}${s.arg ? ':' + s.arg : ''} (${s.ms}ms) ${s.detail}`);
  }
  console.log(report.ok ? `PASS ${report.steps.length} steps, ${report.failed} failed` : `FAIL ${report.failed}/${report.steps.length} steps failed`);
}

export async function main() {
  // B"H — flagship: `merkava-shot run-js <url|--html|--js>`: execute page JS
  // with the real Merkava browser engine, print console output + runtime errors.
  const sub = process.argv[2];
  if (sub === "run-js") {
    const target = process.argv[3];
    const jsArg = arg('--js');
    const jsFile = arg('--js-file');
    const htmlArg = arg('--html');
    const fileArg = arg('--file');
    let js = jsArg || null;
    if (jsFile) js = readFileSync(jsFile, 'utf8');
    let html = htmlArg || null;
    if (fileArg && !js) html = readFileSync(fileArg, 'utf8');
    let url = null;
    if (target && !target.startsWith('--')) url = target;
    else if (!js && !html) url = arg('--url');
    if (!js && !html && !url) {
      console.error('Usage: merkava-shot run-js <url> [--js "code"] [--js-file f.js] [--html "<...>"] [--file page.html]');
      process.exit(1);
    }
    let r;
    if (js && !html && !url) {
      // Raw snippet: fast bytecode VM.
      const { runJs } = await import('./geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaJsCore.mjs');
      r = await runJs({ js, file: jsFile || '<inline>' });
    } else {
      // Real page: full browser engine (DOM + fetch + errors).
      const { runPageWithJs } = await import('./geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/jsPageRunner.js');
      const pr = await runPageWithJs({ html: html || undefined, url: url || undefined, waitMs: 4000 });
      r = {
        consoleLogs: pr.consoleLogs,
        jsErrors: pr.jsErrors,
        scriptsRun: pr.scriptsRun,
        wallMs: pr.wallMs,
      };
      console.log(`page: ${url || fileArg || '<html>'} — ${pr.scriptsFetched} external script(s) fetched, ${pr.scriptsRun} script step(s)`);
    }
    for (const l of r.consoleLogs) console.log(`[${l.level}] ${l.text}`);
    if (!r.jsErrors.length) {
      console.log(`OK: ${r.scriptsRun} script(s), ${r.wallMs}ms — no errors`);
    } else {
      for (const e of r.jsErrors) {
        const line = e.line ? `:${e.line}` : '';
        const est = e.estimated ? ' (line estimated)' : '';
        console.log(`ERROR [${e.kind}] ${e.name}: ${e.message} @ ${e.file}${line}${est}`);
      }
      console.log(`FAIL: ${r.jsErrors.length} error(s) in ${r.scriptsRun} script(s)`);
    }
    process.exit(r.jsErrors.length ? 1 : 0);
  }

  if (has('--devices')) {
    for (const [k, p] of Object.entries(VIEWPORT_PRESETS))
      console.log(`${k.padEnd(10)} ${p.width}x${p.height} @${p.dpr}x  ${p.label}`);
    return;
  }

  const interact = arg('--interact');
  const batchFile = arg('--batch');

  if (has('--serve')) return serve();

  if (batchFile) {
    const spec = JSON.parse(readFileSync(batchFile, 'utf8'));
    const t0 = Date.now();
    // Pre-fetch URLs so the warm loop never blocks on network.
    for (const pg of spec.pages || []) {
      if (pg.url && !pg.html) { console.log(`Fetching ${pg.url} ...`); pg.html = await fetchHtml(pg.url); }
      else if (pg.file && !pg.html) pg.html = readFileSync(pg.file, 'utf8');
    }
    const defaults = spec.defaults || {};
    if (!defaults.width) { const v = resolveViewport(); defaults.width = v.width; defaults.height = v.height; defaults.dpr = v.dpr; }
    if (has('--fast')) defaults.pngLevel = 1;
    const results = await runBatch(spec.pages || [], defaults);
    let failed = 0;
    for (const r of results) {
      console.log(`== ${r.name}: ${r.ok ? 'PASS' : 'FAIL'} (${r.ms}ms)${r.error ? ' ' + r.error : ''}`);
      if (r.report) printReport(r.report);
      if (!r.ok) failed++;
    }
    console.log(`batch done: ${results.length - failed}/${results.length} passed in ${Date.now() - t0}ms (one warm process)`);
    process.exit(failed ? 1 : 0);
  }

  const html = await loadHtml();

  if (interact) {
    const v = resolveViewport();
    const sess = new VerifySession(html, {
      width: v.width, height: v.height, dpr: v.dpr,
      pngLevel: has('--fast') ? 1 : undefined,
    });
    const t0 = Date.now();
    const report = await sess.runSteps(parseInteract(interact));
    printReport(report);
    console.log(`session total ${Date.now() - t0}ms (parse-once, warm)`);
    if (has('--profile')) console.log(`stages: layout ${sess.timings.layout}ms, paint ${sess.timings.paint}ms, png ${sess.timings.encode}ms, renders ${sess.timings.renders}`);
    process.exit(report.ok ? 0 : 1);
  }

  // Classic single-shot path (unchanged behavior, now device-aware).
  const out = arg('--out', '/tmp/merkava-shot.png');
  const cv = resolveViewport();
  const width = cv.width, height = cv.height;
  const fullPage = has('--full');
  const t0 = Date.now();
  const result = renderVirtualSnapshotPng({ html }, { width, height, fullPage });
  const ms = Date.now() - t0;
  const png = Buffer.from(result.dataUrl.split(',')[1], 'base64');
  writeFileSync(out, png);
  console.log(`OK ${out} ${result.width}x${result.height} ${png.length}B in ${ms}ms (no Chrome)`);
}

async function serve() {
  console.log(JSON.stringify({ ready: true, devices: Object.keys(VIEWPORT_PRESETS) }));
  let sess = null;
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const send = (o) => console.log(JSON.stringify(o));
  for await (const line of rl) {
    let msg;
    try { msg = JSON.parse(line); } catch { send({ ok: false, error: 'bad JSON' }); continue; }
    try {
      switch (msg.cmd) {
        case 'load': {
          let html = msg.html;
          if (msg.url) html = await fetchHtml(msg.url);
          else if (msg.file) html = readFileSync(msg.file, 'utf8');
          if (html == null) throw new Error('load needs html|url|file');
          let width = 1280, height = 800, dpr = 1;
          if (msg.viewport) {
            const m = String(msg.viewport).match(/^(\d+)x(\d+)$/);
            if (m) { width = +m[1]; height = +m[2]; }
          }
          if (msg.dpr) dpr = Math.max(1, Math.min(3, +msg.dpr));
          const t0 = Date.now();
          sess = new VerifySession(html, { width, height, dpr, pngLevel: msg.fast ? 1 : undefined });
          send({ ok: true, ms: Date.now() - t0, viewport: `${width}x${height}`, dpr });
          break;
        }
        case 'run': {
          if (!sess) throw new Error('no session; send load first');
          const t0 = Date.now();
          const report = await sess.runSteps(parseInteract(msg.steps || 'shot'));
          send({ ok: report.ok, failed: report.failed, ms: Date.now() - t0, steps: report.steps });
          break;
        }
        case 'shot': {
          if (!sess) throw new Error('no session; send load first');
          const t0 = Date.now();
          const r = sess.savePng(msg.out || `/tmp/merkava-serve-${Date.now()}.png`);
          send({ ok: true, path: r.path, bytes: r.bytes, ms: Date.now() - t0 });
          break;
        }
        case 'viewport': {
          if (!sess) throw new Error('no session; send load first');
          const m = String(msg.viewport || '').match(/^(\d+)x(\d+)$/);
          if (m) sess.setViewport(+m[1], +m[2], msg.dpr);
          send({ ok: true, viewport: `${sess.width}x${sess.height}`, dpr: sess.dpr });
          break;
        }
        case 'timings':
          send({ ok: true, timings: sess ? sess.timings : null });
          break;
        case 'quit':
          send({ ok: true, bye: true });
          process.exit(0);
          break;
        default:
          send({ ok: false, error: `unknown cmd: ${msg.cmd}` });
      }
    } catch (e) {
      send({ ok: false, error: e.message });
    }
  }
}

// B"H — run CLI only when executed directly; importing this file (or the
// standalone bundle) exposes runPage programmatically without side effects.
const __isMain = (() => {
  try {
    return !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch { return false; }
})();
if (__isMain) main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
