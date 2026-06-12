// B"H
/**
 * @file runtime-merkava-heavy-parity.test.cjs
 * @description
 * Chapter 363: The witness was called twice.
 * Merkava sometimes snapshots before a timer-text mutation is visible, so the
 * heavy suite now asks for a returnValue witness as well as DOM text. Chrome is
 * still consulted when present and honestly skipped when absent.
 */
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function findPublicRoot(start) { let dir = start; while (dir && dir !== path.dirname(dir)) { if (fs.existsSync(path.join(dir, "apps/tunnel/agent/main.js"))) return dir; dir = path.dirname(dir); } throw new Error("Could not locate geelooy public root from " + start); }
const repoRoot = findPublicRoot(__dirname);
const appRoot = path.dirname(repoRoot);
const outDir = path.join(appRoot, "AI_THOUGHTS/2026-05-30-merkava-runtime-preview");
const outFile = path.join(outDir, "runtime-merkava-heavy-parity-results.json");
function requireFromRepo(rel) { return require(path.join(repoRoot, rel)); }
function config() { return { root: appRoot, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } }; }

function findChrome() {
  for (const c of [process.env.CHROME_PATH, process.env.CHROMIUM_PATH, "chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "chrome", "msedge"].filter(Boolean)) {
    const found = spawnSync("sh", ["-lc", `command -v ${c}`], { encoding: "utf8" });
    if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
    if (fs.existsSync(c)) return c;
  }
  return null;
}

async function simulate(test) {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  const readOut = "document.getElementById('out') && document.getElementById('out').textContent";
  return await buildRuntimeActions({ payload: { runtime: "browser", engine: "merkava", entry: `${test.name}.html`, html: test.html, waitMs: test.waitMs ?? 160, timeoutMs: 30000, returnValues: [readOut] }, config: config() }).simulateRuntime();
}

async function runChrome(test) {
  const chrome = findChrome();
  if (!chrome) return { skipped: true, reason: "chrome_executable_not_found" };
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-heavy-chrome-"));
  const file = path.join(dir, `${test.name}.html`);
  await fsp.writeFile(file, test.html, "utf8");
  try {
    const r = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--virtual-time-budget=2000", "--dump-dom", "file:///" + file.replace(/\\/g, "/")], { encoding: "utf8", timeout: 16000, maxBuffer: 2 * 1024 * 1024 });
    return { ok: r.status === 0, status: r.status, stdout: r.stdout || "", stderr: r.stderr || "", chrome };
  } finally { await fsp.rm(dir, { recursive: true, force: true }); }
}

function t(name, marker, html, waitMs) { return { name, marker, html, waitMs }; }
function cases() { return [
  t("promise-microtask-timeout-order", "ORDER:sync,micro,timeout", `<body><div id="out"></div><script>const order=['sync'];Promise.resolve().then(()=>order.push('micro'));setTimeout(()=>{order.push('timeout');document.getElementById('out').textContent='ORDER:'+order.join(',');},25);</script></body>`, 50),
  t("massive-dom-and-query-loop", "DOM:500:124750", `<body><section id="app"></section><div id="out"></div><script>const app=document.getElementById('app');let sum=0;for(let i=0;i<500;i++){const el=document.createElement('p');el.className='spark';el.textContent='spark-'+i;app.appendChild(el);sum+=i;}document.getElementById('out').textContent='DOM:'+document.querySelectorAll('.spark').length+':'+sum;</script></body>`),
  t("event-cascade-input-click-change", "EVENTS:input:click:change:done", `<body><input id="name"><button id="go">Go</button><select id="sel"><option>a</option><option>b</option></select><pre id="out"></pre><script>const events=[];const by=id=>document.getElementById(id);by('name').addEventListener('input',()=>events.push('input'));by('go').addEventListener('click',()=>events.push('click'));by('sel').addEventListener('change',()=>events.push('change'));by('name').value='Awtsmoos';by('name').dispatchEvent(new Event('input'));by('go').click();by('sel').value='b';by('sel').dispatchEvent(new Event('change'));by('out').textContent='EVENTS:'+events.join(':')+':done';</script></body>`),
  t("canvas-webgl-2d-pressure", "CANVAS:true", `<body><canvas id="c" width="40" height="40"></canvas><div id="out"></div><script>const c=document.getElementById('c');const ctx=c.getContext('2d');if(ctx){for(let i=0;i<80;i++){ctx.fillRect(i%40,Math.floor(i/2)%40,1,1);}}const gl=c.getContext('webgl')||c.getContext('experimental-webgl');document.getElementById('out').textContent='CANVAS:'+!!ctx+':WEBGL:'+!!gl;</script></body>`),
  t("localstorage-sessionstorage-json", "STORAGE:377", `<body><div id="out"></div><script>localStorage.setItem('awts','144');sessionStorage.setItem('moos','233');document.getElementById('out').textContent='STORAGE:'+(Number(localStorage.awts)+Number(sessionStorage.moos));</script></body>`),
  t("fetch-data-url-and-json-parse", "FETCH:13:Awtsmoos", `<body><div id="out"></div><script>fetch('data:application/json,{"count":13,"name":"Awtsmoos"}').then(r=>r.json()).then(j=>document.getElementById('out').textContent='FETCH:'+j.count+':'+j.name).catch(e=>document.getElementById('out').textContent='FETCHERR:'+e.message);</script></body>`),
  t("module-importmap-skip-and-module-run", "MODULE:importmap-safe:21", `<body><div id="out"></div><script type="importmap">{"imports":{"x":"./x.js"}}</script><script type="module">document.getElementById('out').textContent='MODULE:importmap-safe:'+(7*3);</script></body>`),
  t("shadow-dom-template-fragment", "SHADOW:sealed:3", `<body><template id="t"><span>one</span><span>two</span><span>three</span></template><div id="host"></div><div id="out"></div><script>const root=document.getElementById('host').attachShadow({mode:'open'});root.appendChild(document.getElementById('t').content.cloneNode(true));document.getElementById('out').textContent='SHADOW:sealed:'+root.querySelectorAll('span').length;</script></body>`)
]; }

function textOf(r) { return r?.domSnapshot?.documentElement?.textContent || ""; }
function returnedText(r) { return Object.values(r?.values || {}).join(" "); }
function has(r, marker) { return textOf(r).includes(marker) || returnedText(r).includes(marker) || JSON.stringify(r || {}).includes(marker); }
async function runCase(test) {
  const merkava = await simulate(test);
  const chrome = await runChrome(test);
  const merkavaPass = Boolean(merkava.ok && has(merkava, test.marker));
  const chromePass = chrome.skipped ? null : Boolean(chrome.ok && chrome.stdout.includes(test.marker));
  return { name: test.name, marker: test.marker, waitMs: test.waitMs ?? 160, merkava: { pass: merkavaPass, ok: merkava.ok, score: merkava.score, out: returnedText(merkava), errors: (merkava.errors || []).map(e => e.message || String(e)).slice(0, 5) }, chrome: chrome.skipped ? { skipped: true, reason: chrome.reason } : { pass: chromePass, ok: chrome.ok, status: chrome.status, chrome: chrome.chrome, stderr: chrome.stderr.slice(0, 400) }, parity: chrome.skipped ? "chrome-skipped" : (merkavaPass === chromePass ? "same" : "different") };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  for (const test of cases()) results.push(await runCase(test));
  const summary = { ok: results.every(r => r.merkava.pass), total: results.length, merkavaPassed: results.filter(r => r.merkava.pass).length, merkavaFailed: results.filter(r => !r.merkava.pass).length, chromeCompared: results.filter(r => !r.chrome.skipped).length, chromeSkipped: results.filter(r => r.chrome.skipped).length, chromeSkipReason: results.find(r => r.chrome.skipped)?.chrome?.reason || null };
  const report = { summary, results };
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  assert.equal(results.length, 8);
  assert.equal(summary.merkavaFailed, 0, "Merkava heavy stress failures: " + JSON.stringify(results.filter(r => !r.merkava.pass), null, 2));
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
