// B"H — test-extensions-host-seam.mjs
// Smoke-tests js/extensions-host.js (the window.MerkavaExtensions real host)
// in a browser-like vm sandbox: contract shape per js/extensions-ui.js,
// loadUnpacked with File-shaped objects, toggle/uninstall/onChanged,
// contentScriptsForUrl, and openPopup wiring with a stub document +
// injected popup renderer.
// Run: node test-extensions-host-seam.mjs
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";
import vm from "vm";

const require = createRequire(import.meta.url);
const HOME = os.homedir();
const APP = path.join(HOME, "workspace/mw-repo/geelooy/apps/merkava");
const BROWSER_DIR = path.join(HOME, "workspace/mw-repo/geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
  if (cond) pass++;
  else { fail++; failures.push(name); console.log("  FAIL:", name); }
}

const store = new Map();
function fakeFile(relPath, content) {
  const bytes = new TextEncoder().encode(content);
  return {
    name: relPath.split("/").pop(),
    webkitRelativePath: "FixtureExt/" + relPath,
    async arrayBuffer() { return bytes.buffer.slice(0); },
    async text() { return content; },
  };
}
const MANIFEST = {
  manifest_version: 3, name: "Seam Fixture", version: "2.1",
  description: "seam test",
  background: { service_worker: "bg.js" },
  action: { default_popup: "popup.html", default_title: "Seam" },
  content_scripts: [{ matches: ["*://*.example.com/*"], js: ["cs.js"] }],
};
const FILES = [
  fakeFile("manifest.json", JSON.stringify(MANIFEST)),
  fakeFile("bg.js", "chrome.storage.local.set({boot:1});"),
  fakeFile("cs.js", "document.title='x';"),
  fakeFile("popup.html", "<!doctype html><html><body><h1>Hi</h1></body></html>"),
];

// Minimal document stub good enough for openPopup's DOM writes.
function makeDocStub() {
  const els = {};
  function mkEl() {
    return {
      _html: "", hidden: true,
      set innerHTML(v) { this._html = String(v); },
      get innerHTML() { return this._html; },
      querySelector(sel) {
        if (sel === ".ep-head span") return { set textContent(v) { this._t = v; } };
        if (sel === ".ep-x") return { addEventListener() {} };
        if (sel === ".ep-body") return { appendChild(c) { this._canvas = c; } };
        return null;
      },
    };
  }
  const popupEl = mkEl();
  els["ext-popup"] = popupEl;
  let putCalls = 0;
  return {
    els, popupEl,
    getElementById(id) { return els[id] || null; },
    createElement(tag) {
      if (tag === "canvas") return { width: 0, height: 0, style: {}, getContext: () => ({ putImageData() { putCalls++; } }) };
      return mkEl();
    },
    get putCalls() { return putCalls; },
  };
}

const docStub = makeDocStub();
const sb = {
  console,
  setTimeout: (fn, ms, ...a) => setTimeout(fn, ms, ...a),
  clearTimeout, setInterval, clearInterval,
  URL, TextDecoder, TextEncoder,
  ImageData: class ImageData { constructor(d, w, h) { this.data = d; this.width = w; this.height = h; } },
  localStorage: {
    getItem(k) { const v = store.get(String(k)); return v === undefined ? null : v; },
    setItem(k, v) { store.set(String(k), String(v)); },
    removeItem(k) { store.delete(String(k)); },
    clear() { store.clear(); },
  },
  document: docStub,
  window: null,
};
sb.self = sb; sb.window = sb;
const ctx = vm.createContext(sb);
for (const f of ["ExtensionHost.js", "VmScriptRunner.js"]) {
  vm.runInContext(fs.readFileSync(path.join(BROWSER_DIR, f), "utf8"), ctx, { filename: f });
}
vm.runInContext(fs.readFileSync(path.join(APP, "js/extensions-host.js"), "utf8"), ctx, { filename: "extensions-host.js" });
const seam = sb.MerkavaExtensions;

ok(seam && seam.available === true, "seam installed with available=true");
for (const m of ["list", "get", "setEnabled", "uninstall", "loadUnpacked", "openPopup", "closePopup", "on", "off", "toggle", "onChanged"]) {
  ok(typeof seam[m] === "function", "seam." + m + " is a function");
}

let changed = 0;
const unsub = seam.onChanged(() => { changed++; });
const { id } = await seam.loadUnpacked(FILES);
ok(typeof id === "string" && id.length >= 8, "loadUnpacked -> {id}");
ok(changed >= 1, "onChanged fired on load");

const list = seam.list();
ok(list.length === 1, "list() has 1 extension");
const e0 = list[0];
ok(e0.id === id && e0.name === "Seam Fixture" && e0.version === "2.1" && e0.description === "seam test", "list() shape {id,name,version,description}");
ok(e0.enabled === true && e0.hasPopup === true, "list() {enabled, hasPopup}");
const g = seam.get(id);
ok(g && g.manifestVersion === 3 && g.popupPath === "popup.html", "get(id) metadata");

const cs = seam.contentScriptsForUrl("https://a.example.com/p");
ok(cs.length === 1 && cs[0].js[0].includes("document.title"), "contentScriptsForUrl routes by pattern");
ok(seam.contentScriptsForUrl("https://other.org/").length === 0, "contentScriptsForUrl empty off-pattern");

await seam.toggle(id);
ok(seam.get(id).enabled === false, "toggle disables");
ok(seam.list()[0].enabled === false, "list reflects disabled");
await seam.setEnabled(id, true);
ok(seam.get(id).enabled === true, "setEnabled re-enables");

// openPopup with injected renderer (stand-in for the engine worker).
seam._setPopupRenderer(async (html, dims) => {
  if (!html.includes("<h1>Hi</h1>")) throw new Error("renderer got wrong html");
  return { data: new Uint8ClampedArray(dims.width * dims.height * 4).fill(255), width: dims.width, height: dims.height };
});
const pr = await seam.openPopup(id, null);
ok(pr && pr.width === 400 && pr.height === 300, "openPopup rendered via injected renderer");
ok(docStub.popupEl.hidden === false, "openPopup unhid #ext-popup");
ok(docStub.popupEl.innerHTML.includes("ep-head"), "openPopup wrote popup chrome");
ok(docStub.putCalls === 1, "openPopup painted pixels to canvas (putImageData x1)");
seam.closePopup();
ok(docStub.popupEl.hidden === true && docStub.popupEl.innerHTML === "", "closePopup hides + clears");

unsub();
const c0 = changed;
await seam.uninstall(id);
ok(seam.list().length === 0, "uninstall removes");
ok(seam.get(id) === null, "get after uninstall -> null");
ok(changed === c0, "onChanged unsubscribe works");

// Registry persistence: metadata survives a "reload" (files don't — session-only, documented).
const { id: id2 } = await seam.loadUnpacked(FILES);
const sb2 = { console, localStorage: sb.localStorage, document: makeDocStub(), setTimeout: sb.setTimeout, clearTimeout, setInterval, clearInterval, URL, TextDecoder, TextEncoder, ImageData: sb.ImageData };
sb2.self = sb2; sb2.window = sb2;
const ctx2 = vm.createContext(sb2);
for (const f of ["ExtensionHost.js", "VmScriptRunner.js"]) vm.runInContext(fs.readFileSync(path.join(BROWSER_DIR, f), "utf8"), ctx2, { filename: f });
vm.runInContext(fs.readFileSync(path.join(APP, "js/extensions-host.js"), "utf8"), ctx2, { filename: "extensions-host.js" });
const seam2 = sb2.MerkavaExtensions;
const l2 = seam2.list();
ok(l2.length === 1 && l2.some(e => e.id === id2), "registry metadata persists across reload via localStorage");
ok(seam2.get(id2).filesPresent === false, "files correctly reported missing after reload (session-only, honest)");

console.log(`\n==== test-extensions-host-seam: ${pass} pass, ${fail} fail ====`);
if (fail) { console.log("FAILURES:", failures); process.exit(1); }
