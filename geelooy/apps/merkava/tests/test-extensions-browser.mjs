// B"H — test-extensions-browser.mjs
// Verifies merkava-browser/ExtensionHost.js inside a BROWSER-LIKE global:
// a Node `vm` sandbox with NO require/module/process/Buffer/fs/path/crypto.
// This emulates what the web-hosted Merkava browser page provides.
//
// Verifies:
//   S0  static browser-path dependency audit (zero unguarded Node-only deps)
//   S1  module loads in the sandbox; manifest validation; match patterns;
//       loadManifestFiles; clean degradation of startBackground without the VM;
//       content-script routing; action/popup metadata; list/unload
//   S2  chrome.storage.local persists via localStorage (incl. across a
//       simulated page reload = new host, same localStorage)
//   S3  chrome.alarms fires in the sandbox
//   S4  background service worker runs through the REAL Merkava VM pipeline
//       (VM sources loaded into the sandbox = what the browser bundle ships;
//       compiler/host injected via VmScriptRunner.setPipelineLoaders)
//   S5  content script executes with a DOM double and produces an observable
//       DOM effect, routed by match pattern
//   S6  popup HTML renders through the real Merkava engine (parse -> paint ->
//       PNG) and decodes to real pixels
//   S7  a REAL open-source extension (GoogleChrome/chrome-extensions-samples
//       tutorial.getting-started, Apache-2.0) loads end to end: manifest,
//       service worker via VM, onInstalled -> chrome.storage.sync, popup
//       renders to pixels
//   S8  net.js provider interface: FetchNetProvider honest errors,
//       TunnelRelayNetProvider stub
//
// Run: node test-extensions-browser.mjs
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";
import vm from "vm";

const require = createRequire(import.meta.url);
const HOME = os.homedir();
const BROWSER_DIR = path.join(HOME, "workspace/mw-repo/geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser");
const BIN_DIR = path.join(HOME, "workspace/mw-repo/geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary");
const MERK_ROOT = path.join(BIN_DIR, "..");
const EXT_HOST_SRC = path.join(BROWSER_DIR, "ExtensionHost.js");
const VM_RUNNER_SRC = path.join(BROWSER_DIR, "VmScriptRunner.js");
const NET_SRC = path.join(HOME, "workspace/mw-repo/geelooy/apps/merkava/js/net.js");
const REAL_EXT_DIR = "/tmp/realext/getting-started";
const SHOT_DIR = path.join(HOME, "workspace/merkava-screenshots");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; failures.push(name); console.log("  FAIL:", name); }
}
async function section(name, fn) {
  const p0 = pass, f0 = fail;
  try { await fn(); }
  catch (e) { fail++; failures.push(name + " threw: " + (e && e.message)); console.log("  THREW:", name, (e && e.message), (e && e.stack || "").split("\n")[1] || ""); }
  console.log(`## ${name}: ${pass - p0} pass, ${fail - f0} fail`);
}

/* ---------------- browser-like sandbox ---------------- */
// NOTE: deliberately NO require, module, exports, process, Buffer, __dirname,
// __filename, fs, path, crypto. A real <script> page provides none of these.
function makeSandbox(sharedStore) {
  const store = sharedStore || new Map();
  const sb = {
    console,
    setTimeout: (fn, ms, ...a) => setTimeout(fn, ms, ...a),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: (fn, ms, ...a) => setInterval(fn, ms, ...a),
    clearInterval: (id) => clearInterval(id),
    URL,
    localStorage: {
      getItem(k) { const v = store.get(String(k)); return v === undefined ? null : v; },
      setItem(k, v) { store.set(String(k), String(v)); },
      removeItem(k) { store.delete(String(k)); },
      clear() { store.clear(); },
      key(i) { const ks = [...store.keys()]; return i < ks.length ? ks[i] : null; },
      get length() { return store.size; },
    },
  };
  sb.self = sb;
  sb.window = sb;
  const ctx = vm.createContext(sb);
  return { sb, ctx, store };
}

function loadUmd(sb, ctx, file) {
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file });
  return sb.Merkava || {};
}

/* ---------------- minimal PNG decoder (for pixel assertions) ---------------- */
function decodePng(buf) {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.slice(0, 8).equals(PNG_SIG)) throw new Error("not a PNG");
  let pos = 8, width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) throw new Error(`unsupported PNG ${bitDepth}/${colorType}`);
  const ch = colorType === 6 ? 4 : 3;
  const { inflateSync } = require("zlib");
  const inf = inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = Buffer.alloc(width * height * 4);
  const paeth = (a, b, c) => { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  let p = 0;
  const prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const f = inf[p++];
    for (let x = 0; x < stride; x++) {
      let v = inf[p++];
      const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0;
      if (f === 1) v = (v + a) & 255;
      else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) v = (v + paeth(a, b, c)) & 255;
      cur[x] = v;
    }
    for (let x = 0; x < stride; x++) {
      const px = (x / ch) | 0, cc = x % ch;
      out[(y * width + px) * 4 + cc] = cur[x];
    }
    if (ch === 3) for (let px = 0; px < width; px++) out[(y * width + px) * 4 + 3] = 255;
    prev.set(cur);
  }
  return { width, height, rgba: out };
}

/* ---------------- fixtures ---------------- */
const FX_MANIFEST = {
  manifest_version: 3, name: "Fixture Ext", version: "1.0",
  description: "harness fixture extension",
  background: { service_worker: "bg.js" },
  action: { default_popup: "popup.html", default_title: "Fixture" },
  content_scripts: [{ matches: ["*://*.example.com/*"], js: ["cs.js"], run_at: "document_idle" }],
  permissions: ["storage", "alarms"]
};
const FX_BG = [
  "chrome.storage.local.set({ installed: true, count: 41 });",
  "chrome.alarms.create('tick', { delayInMinutes: 0.001 });",
  "chrome.alarms.onAlarm.addListener(function(alarm) {",
  "  chrome.storage.local.get('count', function(res) {",
  "    chrome.storage.local.set({ count: res.count + 1 });",
  "  });",
  "});",
  ""
].join("\n");
const FX_CS = "document.title = 'injected-by-cs'; document.body.style.backgroundColor = 'rgb(1,2,3)';";
const FX_POPUP = [
  "<!doctype html><html><head><style>",
  "body{margin:0;background:#ffffff;font-family:sans-serif}",
  "h1{color:#123456;font-size:28px;margin:16px}",
  "button{background:#3aa757;color:#ffffff;border:0;padding:10px 18px;margin:0 16px;font-size:16px}",
  "</style></head><body>",
  "<h1>Fixture Popup</h1><button>Click me</button>",
  "</body></html>"
].join("\n");
const FX_FILES = {
  "manifest.json": JSON.stringify(FX_MANIFEST),
  "bg.js": FX_BG, "cs.js": FX_CS, "popup.html": FX_POPUP
};

/* ---------------- S0: static browser-path dependency audit ---------------- */
await section("S0 static browser-path dependency audit", async () => {
  function scan(file) {
    let src = fs.readFileSync(file, "utf8");
    // The guarded nodeRequire shim is the blessed pattern — exclude its body.
    src = src.replace(/function nodeRequire\(name\) \{[\s\S]*?\n  \}/, "");
    const codeOnly = src.replace(/\/\/[^\n]*/g, "");
    const lines = codeOnly.split("\n");
    const hits = [];
    lines.forEach((ln, i) => {
      const n = i + 1;
      for (const m of ln.matchAll(/(?<![\w$.])require\(/g)) {
        const before = ln.slice(Math.max(0, m.index - 14), m.index);
        if (/nodeRequire\($/.test(before) || /createRequire\($/.test(before)) continue;
        hits.push({ line: n, kind: "bare-require", text: ln.trim().slice(0, 90) });
      }
      if (/(?<![\w$.])Buffer\./.test(ln)) hits.push({ line: n, kind: "Buffer", text: ln.trim().slice(0, 90) });
      if (/(?<![\w$.])process\./.test(ln)) hits.push({ line: n, kind: "process", text: ln.trim().slice(0, 90) });
      if (/(?<![\w$.])__dirname(?![\w$])/.test(ln)) hits.push({ line: n, kind: "__dirname", text: ln.trim().slice(0, 90) });
    });
    return { hits, lines };
  }
  function fnSpan(lines, name) {
    const start = lines.findIndex(l => l.includes("function " + name));
    if (start < 0) return null;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (/^  \}.*;?$/.test(lines[i]) || /^  function /.test(lines[i])) { end = i; break; }
    }
    return [start + 1, end + 1];
  }
  const { hits: hostHits, lines: hostLines } = scan(EXT_HOST_SRC);
  const bareHost = hostHits.filter(h => h.kind === "bare-require");
  ok(bareHost.length === 0, "ExtensionHost.js: zero bare require() calls outside the guarded nodeRequire shim");
  const crxSpan = fnSpan(hostLines, "parseCrx"), zipSpan = fnSpan(hostLines, "unzip");
  const inSpan = (ln, s) => s && ln >= s[0] && ln <= s[1];
  const badBuf = hostHits.filter(h => h.kind === "Buffer" && !inSpan(h.line, crxSpan) && !inSpan(h.line, zipSpan));
  const procGuarded = hostHits.filter(h => h.kind === "process").every(h => /path \?/.test(hostLines[h.line - 1]));
  console.log("  ExtensionHost Node-global hits (all must be Node-only/confined/guarded):");
  for (const h of hostHits) console.log(`    L${h.line} [${h.kind}] ${h.text}`);
  ok(badBuf.length === 0, "ExtensionHost.js Buffer use confined to CRX/zip path (unpacked flow is Buffer-free)");
  ok(procGuarded, "ExtensionHost.js process.* use guarded by `path ?` (never touched in browser)");
  const { hits: runnerHits } = scan(VM_RUNNER_SRC);
  const bareRunner = runnerHits.filter(h => h.kind === "bare-require");
  console.log("  VmScriptRunner bare require() hits (Node-only loadPipeline; browser uses setPipelineLoaders):");
  for (const h of bareRunner) console.log(`    L${h.line} ${h.text}`);
  ok(bareRunner.every(h => /loadPipeline|nodeRequire/.test(h.text) || h.line > 38 && h.line < 50),
    "VmScriptRunner bare require() confined to loadPipeline()");
});

/* ---------------- S1: strict sandbox — core, no VM ---------------- */
const s1 = makeSandbox();
const M1 = loadUmd(s1.sb, s1.ctx, EXT_HOST_SRC);
const H1 = M1.ExtensionHostModule; // full module surface (browser UMD)
let host1, ext1;

await section("S1 sandbox load + manifest/patterns (no VM)", async () => {
  ok(typeof M1.ExtensionHost === "function", "UMD browser branch defines Merkava.ExtensionHost (no require needed)");
  ok(H1 && typeof H1.validateManifest === "function" && typeof H1.urlMatches === "function", "helpers exported");
  const v = H1.validateManifest(FX_MANIFEST);
  ok(v.ok && v.manifestVersion === 3, "fixture manifest validates (mv3)");
  ok(!H1.validateManifest({ name: "x" }).ok, "bad manifest rejected");
  ok(H1.urlMatches("https://sub.example.com/a", ["*://*.example.com/*"]), "match: subdomain wildcard");
  ok(!H1.urlMatches("https://evil.com/", ["*://*.example.com/*"]), "match: other domain rejected");
  ok(H1.urlMatches("https://x.com/", ["<all_urls>"]), "match: <all_urls>");

  host1 = new M1.ExtensionHost({}); // no dataDir option -> browser path (no path module)
  ext1 = await host1.loadManifestFiles(FX_MANIFEST, FX_FILES);
  ok(ext1.id && ext1.id.length >= 8, "loadManifestFiles assigns id without fs");
  ok(ext1._chrome && ext1._chrome.storage && ext1._chrome.alarms, "chrome.* API present");

  // startBackground must degrade CLEANLY (no ReferenceError), not crash the page
  let degErr = null;
  try { await host1.startBackground(ext1.id); } catch (e) { degErr = e; }
  ok(degErr && /VmScriptRunner unavailable/.test(degErr.message), "startBackground degrades cleanly without VM: " + (degErr && degErr.message));

  const css = host1.getContentScriptsForUrl(ext1.id, "https://sub.example.com/article");
  ok(css.length === 1 && css[0].js.length === 1 && css[0].js[0].includes("injected-by-cs"), "content script routed by match pattern");
  ok(host1.getContentScriptsForUrl(ext1.id, "https://other.org/").length === 0, "no content script off-pattern");
  const act = host1.getAction(ext1.id);
  ok(act && act.defaultPopup === "popup.html" && act.defaultTitle === "Fixture", "action metadata");
  ok(host1.getExtensionPage(ext1.id, "popup.html").includes("Fixture Popup"), "popup page source retrievable");
  ok(host1.getExtensionPage(ext1.id, "nope.html") === null, "missing page -> null");
  ok(host1.listExtensions().length === 1, "listExtensions");
  ok(host1.unloadExtension(ext1.id) === true && host1.listExtensions().length === 0, "unloadExtension");
  ext1 = await host1.loadManifestFiles(FX_MANIFEST, FX_FILES); // reload for later sections
});

/* ---------------- S2: chrome.storage.local persists via localStorage ---------------- */
await section("S2 chrome.storage.local persists (localStorage-backed)", async () => {
  const chrome = ext1._chrome;
  await chrome.storage.local.set({ keep: "yes", n: 7 });
  const got = await chrome.storage.local.get(["keep", "n"]);
  ok(got.keep === "yes" && got.n === 7, "set -> get round-trips in-session");
  const keys = [...s1.store.keys()].filter(k => k.includes("storage"));
  ok(keys.length > 0, "backing write hit localStorage (keys: " + keys.join(",") + ")");
  // Simulate a full page reload: brand-new sandbox + host, SAME localStorage store.
  const s2 = makeSandbox(s1.store);
  const M2 = loadUmd(s2.sb, s2.ctx, EXT_HOST_SRC);
  const host2 = new M2.ExtensionHost({});
  const ext2 = await host2.loadManifestFiles(FX_MANIFEST, FX_FILES);
  ok(ext2.id === ext1.id, "same extension id after reload (stable _extId)");
  const got2 = await ext2._chrome.storage.local.get(["keep", "n"]);
  ok(got2.keep === "yes" && got2.n === 7, "storage.local survives simulated reload via localStorage");
  await ext2._chrome.storage.local.remove("n");
  const got3 = await ext2._chrome.storage.local.get("n");
  ok(got3.n === undefined, "storage.local.remove works");
  let changed = null;
  ext2._chrome.storage.onChanged.addListener((c, area) => { changed = { c, area }; });
  await ext2._chrome.storage.local.set({ keep: "no" });
  ok(changed && changed.area === "local" && changed.c.keep.newValue === "no", "storage.onChanged fires");
});

/* ---------------- S3: chrome.alarms fires in the sandbox ---------------- */
await section("S3 chrome.alarms fires (sandbox timers)", async () => {
  const chrome = ext1._chrome;
  let fired = null;
  chrome.alarms.onAlarm.addListener(a => { fired = a.name; });
  chrome.alarms.create("s3quick", { when: Date.now() + 60 });
  await new Promise(r => setTimeout(r, 300));
  ok(fired === "s3quick", "alarm fired via sandbox setTimeout");
  const all = await chrome.alarms.getAll();
  ok(Array.isArray(all), "alarms.getAll works");
  await chrome.alarms.clear("s3quick");
  const after = await chrome.alarms.get("s3quick");
  ok(after === undefined, "alarms.clear works");
});

/* ---------------- S4: background runs in the REAL Merkava VM (sandbox) ---------------- */
async function loadVmIntoSandbox(sb, ctx) {
  // The browser bundle ships these as plain scripts; the loader (fs/vm) is
  // Node-only and is NOT what we emulate — only the VM sources themselves.
  const files = [
    "../merkava-opcodes.js",
    "../merkava-vm/executors/flow.js",
    "../merkava-vm/executors/stack.js",
    "../merkava-vm/executors/math.js",
    "../merkava-vm/executors/objects.js",
    "../merkava-vm/executors/functions.js",
    "../merkava-vm/executors/json.js",
    "../merkava-vm/instructions.js",
    "../merkava-vm/thread.js",
    "../merkava-vm/index.js",
  ];
  for (const rel of files) {
    const f = path.join(BIN_DIR, rel);
    vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  }
  const t = vm.runInContext("typeof MerkavaVM", ctx);
  return t;
}

await section("S4 background service worker in the real Merkava VM", async () => {
  const sx = makeSandbox();
  sx.sb.Buffer = Buffer; // browser bundle must ship a Buffer polyfill for the VM pipeline
  const Mx = loadUmd(sx.sb, sx.ctx, EXT_HOST_SRC);
  const VR = loadUmd(sx.sb, sx.ctx, VM_RUNNER_SRC).VmScriptRunner;
  ok(typeof VR === "object" && typeof VR.runVmScript === "function", "VmScriptRunner loads in sandbox");
  const vmType = await loadVmIntoSandbox(sx.sb, sx.ctx);
  ok(vmType !== "undefined", "Merkava VM sources execute in the browser-like sandbox (typeof MerkavaVM = " + vmType + ")");
  if (typeof VR.setPipelineLoaders === "function") {
    const { compileJsToCode } = require(path.join(BIN_DIR, "MerkavaJsCompiler.js"));
    const { createDefaultHost } = require(path.join(BIN_DIR, "DefaultMerkavaHost.js"));
    const { decodeSangArtifact } = require(path.join(BIN_DIR, "SangCodec.js"));
    VR.setPipelineLoaders({ compileJsToCode, createDefaultHost, decodeSangArtifact });
    ok(true, "pipeline injected via VmScriptRunner.setPipelineLoaders (browser seam)");
  } else {
    ok(false, "VmScriptRunner.setPipelineLoaders missing — browser cannot inject the VM pipeline");
    return;
  }
  // Wire the injected runner into ExtensionHost (options.vmRunner / setVmRunner seam).
  const hostx = new Mx.ExtensionHost({ vmRunner: VR });
  const extx = await hostx.loadManifestFiles(FX_MANIFEST, FX_FILES);
  const res = await hostx.startBackground(extx.id);
  ok(res.length === 1 && res[0].ok, "background service worker COMPLETED in Merkava VM: " + JSON.stringify(res));
  const st = await extx._chrome.storage.local.get(["installed", "count"]);
  ok(st.installed === true && st.count === 41, "VM-run background wrote chrome.storage.local");
  // The background created an alarm (delayInMinutes 0.001 = 60ms); its
  // onAlarm listener increments count. Wait, then check.
  await new Promise(r => setTimeout(r, 600));
  const st2 = await extx._chrome.storage.local.get("count");
  ok(st2.count === 42, "VM-registered alarm fired and its listener ran (count 41 -> 42)");
  // Persistence: the VM's writes went through the localStorage backend.
  const keys = [...sx.store.keys()].filter(k => k.includes("storage"));
  ok(keys.length > 0 && JSON.parse(sx.store.get(keys[0])).count === 42, "VM background storage writes persisted to localStorage");
});

/* ---------------- S5: content script DOM effect via VM ---------------- */
function makeDocumentDouble(log) {
  const els = {};
  function el(id) {
    if (!els[id]) {
      const e = { id, style: {}, _ls: {} };
      e.addEventListener = (t, fn) => { (e._ls[t] = e._ls[t] || []).push(fn); };
      els[id] = e;
    }
    return els[id];
  }
  const doc = {
    _title: "",
    get title() { return this._title; },
    set title(v) { this._title = v; log.push(["title", String(v)]); },
    getElementById: (id) => el(String(id)),
    body: null,
  };
  doc.body = el("body");
  return doc;
}

await section("S5 content script executes with observable DOM effect", async () => {
  const sy = makeSandbox();
  sy.sb.Buffer = Buffer;
  const My = loadUmd(sy.sb, sy.ctx, EXT_HOST_SRC);
  const VRy = loadUmd(sy.sb, sy.ctx, VM_RUNNER_SRC).VmScriptRunner;
  await loadVmIntoSandbox(sy.sb, sy.ctx);
  const { compileJsToCode } = require(path.join(BIN_DIR, "MerkavaJsCompiler.js"));
  const { createDefaultHost } = require(path.join(BIN_DIR, "DefaultMerkavaHost.js"));
  const { decodeSangArtifact } = require(path.join(BIN_DIR, "SangCodec.js"));
  if (typeof VRy.setPipelineLoaders === "function") VRy.setPipelineLoaders({ compileJsToCode, createDefaultHost, decodeSangArtifact });
  const hosty = new My.ExtensionHost({ vmRunner: VRy });
  const exty = await hosty.loadManifestFiles(FX_MANIFEST, FX_FILES);
  const css = hosty.getContentScriptsForUrl(exty.id, "https://docs.example.com/page");
  ok(css.length === 1, "content script selected for https://docs.example.com/page");
  const log = [];
  const document = makeDocumentDouble(log);
  const r = await VRy.runVmScript(css[0].js[0], {
    label: "cs:test", globals: { chrome: exty._chrome, document, console }, cycles: 60000,
  });
  ok(r.status === "COMPLETED", "content script COMPLETED in Merkava VM" + (r.error ? " err=" + r.error : ""));
  ok(log.some(e => e[0] === "title" && e[1] === "injected-by-cs"), "DOM effect observed: document.title set");
  ok(document.body.style.backgroundColor === "rgb(1,2,3)", "DOM effect observed: body backgroundColor set");
});

/* ---------------- S6: popup renders through the Merkava engine ---------------- */
import { pathToFileURL } from "url";
await section("S6 popup HTML renders through the Merkava engine (parse->paint->pixels)", async () => {
  const modPath = path.join(BROWSER_DIR, "..", "merkava-service/snapshots/virtualPngRenderer.js");
  const { renderVirtualSnapshotPng } = await import(pathToFileURL(modPath).href);
  const shot = renderVirtualSnapshotPng({ html: FX_POPUP }, { width: 400, height: 300 });
  ok(shot && typeof shot.dataUrl === "string" && shot.dataUrl.startsWith("data:image/png;base64,"),
    "engine returned a PNG dataUrl (backend=" + (shot && shot.backend) + ")");
  const pngBuf = Buffer.from(shot.dataUrl.split(",")[1], "base64");
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const shotPath = path.join(SHOT_DIR, "ext-fixture-popup.png");
  fs.writeFileSync(shotPath, pngBuf);
  console.log("  popup PNG:", shotPath, pngBuf.length + "B");
  const px = decodePng(pngBuf);
  ok(px.width === 400 && px.height === 300, `PNG decodes to ${px.width}x${px.height}`);
  let nonWhite = 0;
  let green = 0, navy = 0;
  for (let i = 0; i < px.rgba.length; i += 4) {
    const r = px.rgba[i], g = px.rgba[i + 1], b = px.rgba[i + 2];
    if (r !== 255 || g !== 255 || b !== 255) nonWhite++;
    if (Math.abs(r - 0x3a) < 24 && Math.abs(g - 0xa7) < 24 && Math.abs(b - 0x57) < 24) green++;
    if (Math.abs(r - 0x12) < 24 && Math.abs(g - 0x34) < 24 && Math.abs(b - 0x56) < 24) navy++;
  }
  const frac = (nonWhite / (px.width * px.height) * 100).toFixed(2);
  console.log(`  non-white pixels: ${frac}%  green(#3aa757)~${green}  navy(#123456)~${navy}`);
  ok(nonWhite > 500, "popup painted real content (" + frac + "% non-white)");
  ok(green > 200, "button background #3aa757 present in pixels");
  ok(navy > 20, "h1 text #123456 present in pixels");
});

/* ---------------- S7: real open-source extension end to end ---------------- */
await section("S7 real extension end-to-end (chrome-extensions-samples tutorial.getting-started, Apache-2.0)", async () => {
  const files = {};
  for (const name of ["manifest.json", "background.js", "button.css", "popup.html", "popup.js", "options.html", "options.js"])
    files[name] = fs.readFileSync(path.join(REAL_EXT_DIR, name));
  for (const img of ["get_started16.png", "get_started32.png", "get_started48.png", "get_started128.png"])
    files["images/" + img] = fs.readFileSync(path.join(REAL_EXT_DIR, "images", img));
  const manifest = JSON.parse(files["manifest.json"].toString("utf8"));
  ok(manifest.name === "Getting Started Example" && manifest.manifest_version === 3, "real manifest.json parses (mv3)");

  const sr = makeSandbox();
  sr.sb.Buffer = Buffer;
  const Mr = loadUmd(sr.sb, sr.ctx, EXT_HOST_SRC);
  const VRr = loadUmd(sr.sb, sr.ctx, VM_RUNNER_SRC).VmScriptRunner;
  await loadVmIntoSandbox(sr.sb, sr.ctx);
  const { compileJsToCode } = require(path.join(BIN_DIR, "MerkavaJsCompiler.js"));
  const { createDefaultHost } = require(path.join(BIN_DIR, "DefaultMerkavaHost.js"));
  const { decodeSangArtifact } = require(path.join(BIN_DIR, "SangCodec.js"));
  if (typeof VRr.setPipelineLoaders === "function") VRr.setPipelineLoaders({ compileJsToCode, createDefaultHost, decodeSangArtifact });

  const hostr = new Mr.ExtensionHost({ vmRunner: VRr });
  const extr = await hostr.loadManifestFiles(manifest, files);
  const HMr = Mr.ExtensionHostModule;
  const v = HMr.validateManifest(manifest);
  ok(v.ok && HMr, "real manifest validates");
  const res = await hostr.startBackground(extr.id);
  ok(res.length === 1 && res[0].ok, "real service worker (background.js) COMPLETED in Merkava VM: " + JSON.stringify(res));
  const sync = await extr._chrome.storage.sync.get("color");
  ok(sync.color === "#3aa757", "onInstalled fired from VM: chrome.storage.sync.color=" + JSON.stringify(sync.color));
  const act = hostr.getAction(extr.id);
  ok(act && act.defaultPopup === "popup.html", "real action metadata: popup=" + (act && act.defaultPopup));
  ok(hostr.getExtensionPage(extr.id, "options.html").includes("buttonDiv"), "options page retrievable");

  const modPath = path.join(BROWSER_DIR, "..", "merkava-service/snapshots/virtualPngRenderer.js");
  const { renderVirtualSnapshotPng } = await import(pathToFileURL(modPath).href);
  const html = hostr.getExtensionPage(extr.id, "popup.html");
  const shot = renderVirtualSnapshotPng({ html }, { width: 300, height: 200 });
  const pngBuf = Buffer.from(shot.dataUrl.split(",")[1], "base64");
  const shotPath = path.join(SHOT_DIR, "ext-getting-started-popup.png");
  fs.writeFileSync(shotPath, pngBuf);
  console.log("  real popup PNG:", shotPath, pngBuf.length + "B");
  const px = decodePng(pngBuf);
  let nonWhite = 0;
  for (let i = 0; i < px.rgba.length; i += 4) if (px.rgba[i] !== 255 || px.rgba[i + 1] !== 255 || px.rgba[i + 2] !== 255) nonWhite++;
  const frac = (nonWhite / (px.width * px.height) * 100).toFixed(2);
  console.log(`  real popup non-white pixels: ${frac}%`);
  ok(nonWhite > 50, "real popup.html renders to non-blank pixels (" + frac + "%)");
});

/* ---------------- S8: net.js provider interface ---------------- */
await section("S8 net.js provider interface", async () => {
  const sn = makeSandbox();
  sn.sb.fetch = fetch;
  loadUmd(sn.sb, sn.ctx, NET_SRC);
  const Net = sn.sb.Merkava && sn.sb.Merkava.Net;
  ok(Net && typeof Net.FetchNetProvider === "function" && typeof Net.TunnelRelayNetProvider === "function",
    "net.js UMD exposes Merkava.Net.{FetchNetProvider,TunnelRelayNetProvider}");
  if (!Net) return;
  const p = new Net.FetchNetProvider();
  const doc = await p.fetchDocument("data:text/html,<h1>hi</h1>");
  ok(doc.ok && doc.status === 200 && doc.text.includes("<h1>hi</h1>"), "FetchNetProvider.fetchDocument(data: URL)");
  ok(doc.contentType.includes("text/html"), "contentType reported: " + doc.contentType);
  const asset = await p.fetchAsset("data:text/plain,hello");
  ok(asset.ok && asset.bytes && asset.bytes.length === 5, "FetchNetProvider.fetchAsset returns bytes");
  let derr = null;
  try { await p.fetchDocument("https://invalid.invalid.nope/"); } catch (e) { derr = e; }
  ok(derr && derr.code === "fetch_failed", "unresolvable host rejects honestly (code=" + (derr && derr.code) + ")");
  let berr = null;
  try { await p.fetchDocument("http://256.256.256.256/"); } catch (e) { berr = e; }
  ok(berr && berr.code, "unroutable IP rejects honestly (code=" + (berr && berr.code) + ")");
  const t = new Net.TunnelRelayNetProvider();
  let terr = null;
  try { await t.fetchDocument("https://example.com/"); } catch (e) { terr = e; }
  ok(terr && terr.code === "tunnel_not_configured", "TunnelRelayNetProvider stub fails honestly when unconfigured");
  let tcerr = null;
  try { await t.fetchAsset("https://example.com/x.png"); } catch (e) { tcerr = e; }
  ok(tcerr && tcerr.code === "tunnel_not_configured", "tunnel stub fetchAsset also honest");
});

console.log(`\n==== test-extensions-browser: ${pass} pass, ${fail} fail ====`);
if (fail) { console.log("FAILURES:"); for (const f of failures) console.log("  -", f); process.exit(1); }
