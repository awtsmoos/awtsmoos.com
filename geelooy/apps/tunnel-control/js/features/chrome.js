// B"H
import { h, area, out, $ } from "../ui/dom.js";
import { callFs, show, humanError } from "../ui/api.js";

const DB_NAME = "awtsmoosTunnelControl";
const STORE = "settings";
const safeValue = id => $(id)?.value || "";
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };

function openDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key, fallback = "") {
  try {
    const db = await openDb();
    return await new Promise(resolve => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? localStorage.getItem("awt:" + key) ?? fallback);
      req.onerror = () => resolve(localStorage.getItem("awt:" + key) ?? fallback);
    });
  } catch (_) {
    return localStorage.getItem("awt:" + key) ?? fallback;
  }
}

async function idbSet(key, value) {
  localStorage.setItem("awt:" + key, String(value ?? ""));
  try {
    const db = await openDb();
    await new Promise(resolve => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(String(value ?? ""), key);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch (_) {}
}

function field(id, label, attrs = {}, wide = "") {
  return h("label", { className: "chrome-field " + wide }, [h("span", { text: label }), h("input", { id, ...attrs })]);
}
function btn(id, text, primary = false) { return h("button", { id, text, className: primary ? "primary" : "" }); }

export function chrome() {
  return h("section", { className: "pane", data: { pane: "chrome" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Chrome" }),
      h("h2", { text: "Browser control lab" }),
      h("p", { text: "Launch Chrome, navigate, evaluate JavaScript, and see clean result cards instead of raw JSON." })
    ]),
    h("article", { className: "panel chrome-panel stack" }, [
      h("div", { className: "chrome-grid" }, [
        field("chromePath", "Chrome / Edge / Brave executable", {}, "span-9"),
        field("chromePort", "Port", { type: "number", value: "9222" }, "span-3")
      ]),
      h("div", { className: "button-row" }, [btn("chromeFindBtn", "Find Chrome"), btn("chromeManualBtn", "Choose manually"), btn("chromeLaunchBtn", "Launch / Connect", true), btn("chromeStatusBtn", "Status")]),
      h("div", { id: "chromeStatusCard", className: "notice", text: "Loading saved Chrome path..." }),
      h("div", { id: "chromeCandidates", className: "candidate-list hidden" })
    ]),
    h("article", { className: "panel chrome-panel stack" }, [
      field("chromeUrl", "URL", { value: "https://awtsmoos.com" }, "span-12"),
      h("div", { className: "button-row" }, [btn("chromeNavigateBtn", "Navigate", true), btn("chromeEvalBtn", "Evaluate title")])
    ]),
    h("article", { className: "panel chrome-panel stack" }, [
      h("div", { className: "chrome-grid" }, [
        field("chromeSelector", "Selector", { value: "body" }, "span-6"),
        field("chromeText", "Text", {}, "span-6"),
        field("chromeExpression", "JS expression", { value: "document.title" }, "span-12")
      ]),
      area("chromeScript", "Script JSON", "[{\"type\":\"goto\",\"url\":\"https://awtsmoos.com\"},{\"type\":\"eval\",\"expression\":\"document.title\"}]"),
      h("div", { className: "button-row" }, [btn("chromeWaitBtn", "Wait"), btn("chromeClickBtn", "Click"), btn("chromeTypeBtn", "Type"), btn("chromeRunScriptBtn", "Run script")])
    ]),
    h("div", { id: "chromeResult", className: "result-card hidden" }),
    h("details", {}, [h("summary", { text: "Raw Chrome response" }), out("chromeOut")])
  ]);
}

export async function mountChrome() {
  await restoreChrome();
  [["chromeFindBtn", "chromeFind"], ["chromeLaunchBtn", "chromeLaunch"], ["chromeStatusBtn", "chromeStatus"], ["chromeNavigateBtn", "chromeNavigate"], ["chromeWaitBtn", "chromeWaitForSelector"], ["chromeClickBtn", "chromeClick"], ["chromeTypeBtn", "chromeType"], ["chromeEvalBtn", "chromeEval"], ["chromeRunScriptBtn", "chromeRunScript"]].forEach(([id, action]) => {
    const el = $(id); if (el) el.onclick = () => run(action);
  });
  const manual = $("chromeManualBtn"); if (manual) manual.onclick = () => openCandidates();
  const path = $("chromePath"); if (path) path.onchange = saveChrome;
  const port = $("chromePort"); if (port) port.onchange = saveChrome;
  if (path && !path.value) run("chromeFind");
  else if (path) setText("chromeStatusCard", "Remembered Chrome path: " + path.value);
}

async function restoreChrome() {
  const path = $("chromePath");
  const port = $("chromePort");
  if (path) path.value = await idbGet("chromePath", localStorage.getItem("awtChromePath") || "");
  if (port) port.value = await idbGet("chromePort", localStorage.getItem("awtChromePort") || "9222");
}

async function saveChrome() {
  const path = safeValue("chromePath").trim();
  const port = (safeValue("chromePort") || "9222").trim() || "9222";
  localStorage.setItem("awtChromePath", path);
  localStorage.setItem("awtChromePort", port);
  await idbSet("chromePath", path);
  await idbSet("chromePort", port);
}

function resultHeader(got, title) {
  const ok = got && got.ok !== false;
  return h("div", { className: "result-head" }, [h("div", {}, [h("p", { className: "eyebrow", text: "Chrome" }), h("h3", { text: title })]), h("span", { className: "status-pill " + (ok ? "good" : "bad"), text: ok ? "Success" : "Failed" })]);
}
function kv(label, value) { return h("div", { className: "kv" }, [h("span", { text: label }), h("b", { text: value === undefined || value === null || value === "" ? "-" : String(value) })]); }
function block(title, text, kind = "") { return h("div", { className: "output-block " + kind }, [h("div", { className: "output-title", text: title }), h("pre", { text: typeof text === "string" ? text : JSON.stringify(text, null, 2) })]); }

function renderChromeResult(got) {
  const host = $("chromeResult"); if (!host) return;
  const ok = got && got.ok !== false;
  const value = got?.result?.value ?? got?.value ?? got?.title ?? got?.content ?? got?.message ?? got?.error ?? got;
  host.className = "result-card " + (ok ? "good" : "bad");
  host.replaceChildren(
    resultHeader(got, got?.action || "Chrome action"),
    h("div", { className: "kv-grid" }, [kv("Action", got?.action), kv("Port", got?.port || safeValue("chromePort")), kv("Path", got?.chromePath || safeValue("chromePath")), kv("URL", got?.url || safeValue("chromeUrl")), kv("Selector", got?.selector || safeValue("chromeSelector"))]),
    block("Result", typeof value === "string" ? value : JSON.stringify(value, null, 2), ok ? "stdout" : "stderr")
  );
  host.classList.remove("hidden");
}

function renderCandidates(list = []) {
  const host = $("chromeCandidates"); if (!host) return;
  const items = list.map(x => typeof x === "string" ? { path: x } : x).filter(x => x.path);
  host.classList.toggle("hidden", !items.length);
  host.replaceChildren(...items.map(item => h("div", { className: "candidate" }, [h("code", { text: item.path }), h("button", { text: "Use", on: { click: async () => { const path = $("chromePath"); if (path) path.value = item.path; await saveChrome(); setText("chromeStatusCard", "Selected and remembered: " + item.path); } } })])));
}

function openCandidates() {
  const host = $("chromeCandidates"); if (!host) return;
  host.classList.remove("hidden");
  if (!host.children.length) renderCandidates(["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"]);
}

function chromeStatusText(got) {
  if (got?.action === "chromeFind") return got.found ? "Found and remembered: " + got.chromePath : "Could not find Chrome automatically. " + humanError(got);
  if (got?.ok) return (got.action || "Chrome action") + " succeeded.";
  return (got?.action || "Chrome action") + " failed: " + humanError(got);
}

async function run(action) {
  await saveChrome();
  setText("chromeStatusCard", "Working: " + action + "...");
  let script = [];
  try { script = JSON.parse(safeValue("chromeScript") || "[]"); } catch (_) { script = []; }
  const got = await callFs({ action, chromePath: safeValue("chromePath"), port: safeValue("chromePort") || "9222", url: safeValue("chromeUrl"), selector: safeValue("chromeSelector"), text: safeValue("chromeText"), expression: safeValue("chromeExpression") || "document.title", script });
  if (got.chromePath) { const path = $("chromePath"); if (path) path.value = got.chromePath; await saveChrome(); }
  if (got.candidates || got.existing) renderCandidates(got.existing || got.candidates);
  setText("chromeStatusCard", chromeStatusText(got));
  show("chromeOut", got);
  renderChromeResult(got);
}
