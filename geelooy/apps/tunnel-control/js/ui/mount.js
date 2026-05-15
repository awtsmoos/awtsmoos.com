
// B"H
import { $, qsa } from "./dom.js";
import { callFs, show, tunnelName, humanError } from "./api.js";
import { mountRootPicker } from "../features/rootPicker.js";
import { mountChrome } from "../features/chrome.js";
import { mountExplorer } from "../features/explorer.js";
import { mountTerminal } from "../features/terminal.js";
import { mountPrompt } from "../features/prompt.js";
import { mountKeys } from "../features/keys.js";
import { switchPane } from "./tabs.js";

let configTimer = null;
let loadingConfig = false;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function mountAll() {
  safe("tabs", () => qsa("[data-go]").forEach(x => x.onclick = () => switchPane(x.dataset.go)));

  safe("tunnel input", () => {
    $("tunnelName").oninput = () => {
      localStorage.setItem("awtTunnelName", tunnelName());
      localStorage.setItem("awtsmoos.tunnelName", tunnelName());
      setText("miniTunnel", tunnelName() || "No tunnel selected");
      autoLoadConfig();
    };
  });

  safe("top buttons", () => {
    $("refreshBtn").onclick = () => refresh().then(autoLoadConfig);
    $("loginBtn").onclick = () => location.href = "/login/?next=" + encodeURIComponent(location.href);
    $("logoutBtn").onclick = () => location.href = "/logout?next=" + encodeURIComponent(location.href);
  });

  safe("setup buttons", () => {
    $("loadConfigBtn").onclick = () => loadConfig({ manual: true });
    $("saveConfigBtn").onclick = () => saveConfigNow("manual");
    $("openRootBtn").onclick = async () => show("configOut", await callFs({ action: "openRoot" }));
    $("rootsBtn").onclick = async () => show("configOut", await callFs({ action: "roots" }));

    qsa("[data-instant-config]").forEach(box => {
      box.onchange = () => queueConfigSave("permission changed");
    });

    $("rootPath").onchange = () => queueConfigSave("root changed");
    $("rootPath").onkeydown = e => {
      if (e.key === "Enter") queueConfigSave("root enter");
    };
  });

  safeMount("root picker", mountRootPicker);
  safeMount("chrome", mountChrome);
  safeMount("explorer", mountExplorer);
  safeMount("terminal", mountTerminal);
  safeMount("prompt", mountPrompt);
  safeMount("keys", mountKeys);

  refresh().then(autoLoadConfig);
  setInterval(refresh, 7000);
}

function safe(name, fn) {
  try { return fn(); }
  catch (e) {
    console.error("B'H control mount failed:", name, e);
    setText("miniAgent", "UI error");
    setText("miniLogin", "UI error");
    show("statusBox", { ok: false, where: name, error: e.message, stack: e.stack });
  }
}

function safeMount(name, fn) {
  try {
    const got = fn();
    if (got && typeof got.catch === "function") {
      got.catch(e => {
        console.error("B'H async mount failed:", name, e);
        show("statusBox", { ok: false, where: name, error: e.message, stack: e.stack });
      });
    }
  } catch (e) {
    console.error("B'H mount failed:", name, e);
    show("statusBox", { ok: false, where: name, error: e.message, stack: e.stack });
  }
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function checked(id, fallback = true) {
  const el = $(id);
  return el ? !!el.checked : fallback;
}

function setChecked(id, value) {
  const el = $(id);
  if (el) el.checked = value !== false;
}

function toolsFromUi() {
  return {
    fsList: true,
    fsTree: true,
    fsRead: checked("toolFsRead"),
    fsWrite: checked("toolFsWrite"),
    fsBulk: checked("toolFsBulk"),
    command: checked("toolCommand"),
    nodeScript: checked("toolNodeScript"),
    chrome: checked("toolChrome"),
    browser: checked("toolChrome")
  };
}

function payloadFromUi() {
  return {
    action: "configSet",
    root: $("rootPath").value,
    allowWrite: checked("allowWrite"),
    allowSecrets: checked("allowSecrets"),
    allowCommands: checked("allowCommands"),
    enableLocalHttpProxy: checked("enableLocalHttpProxy"),
    tools: toolsFromUi(),
    commandConfig: {
      enabled: checked("allowCommands") && checked("toolCommand"),
      allowNodeScript: checked("allowCommands") && checked("toolNodeScript")
    },
    chrome: { enabled: checked("toolChrome") }
  };
}

function queueConfigSave(reason) {
  if (loadingConfig) return;
  clearTimeout(configTimer);
  setText("configSaveStatus", "Saving " + reason + "...");
  configTimer = setTimeout(() => saveConfigNow(reason), 250);
}

async function saveConfigNow(reason = "save") {
  clearTimeout(configTimer);
  setText("configSaveStatus", "Saving...");
  const got = await callFs(payloadFromUi());
  show("configOut", got);

  if (got.ok) {
    setText("configSaveStatus", "Saved instantly: " + reason);
    applyConfig(got.config || {});
  } else {
    setText("configSaveStatus", "Save failed: " + humanError(got));
  }

  return got;
}

async function autoLoadConfig() {
  for (let i = 0; i < 18; i++) {
    const got = await loadConfig({ silent: i > 0, auto: true });
    if (got && got.ok) return got;
    setText("configSaveStatus", "Waiting for tunnel config... retry " + (i + 1));
    await wait(Math.min(800 + i * 250, 4000));
  }
  return null;
}

async function loadConfig(options = {}) {
  loadingConfig = true;
  if (!options.silent) setText("configSaveStatus", "Loading config...");

  const got = await callFs({ action: "configGet" });
  show("configOut", got);

  if (got.ok) {
    applyConfig(got.config || {});
    setText("configSaveStatus", "Config loaded. Switches are live.");
  } else if (!options.silent || options.manual) {
    setText("configSaveStatus", "Config load failed: " + humanError(got));
  }

  loadingConfig = false;
  return got;
}

function applyConfig(config) {
  if (config.root && $("rootPath")) $("rootPath").value = config.root;

  setChecked("allowWrite", config.allowWrite);
  setChecked("allowSecrets", config.allowSecrets);
  setChecked("allowCommands", config.allowCommands);
  setChecked("enableLocalHttpProxy", config.enableLocalHttpProxy);

  const tools = config.tools || {};
  setChecked("toolFsRead", tools.fsRead);
  setChecked("toolFsWrite", tools.fsWrite);
  setChecked("toolFsBulk", tools.fsBulk);
  setChecked("toolCommand", tools.command);
  setChecked("toolNodeScript", tools.nodeScript);
  setChecked("toolChrome", tools.chrome !== false && tools.browser !== false);

  setText("miniKey", localStorage.getItem("awtTunnelApiKey") ? "Saved" : "Not needed");
}

async function refresh() {
  try {
    setText("miniAgent", "Checking...");
    setText("miniLogin", "Checking...");

    const got = await fetch("/api/tunnel/control/my-device", {
      credentials: "include",
      headers: { Accept: "application/json" }
    }).then(r => r.json());

    show("statusBox", got);
    show("miniStatus", got);

    if (got.tunnelName && !$("tunnelName").value) $("tunnelName").value = got.tunnelName;

    setText("miniTunnel", tunnelName() || got.tunnelName || "No tunnel selected");
    setText("miniAgent", got.ok ? "Connected" : (got.error || "Not connected"));
    setText("miniLogin", got.identity?.userId || got.identity?.email || (got.ok ? "Logged in" : "Login needed"));
  } catch (e) {
    setText("miniAgent", "Refresh failed");
    setText("miniLogin", "Unknown");
    show("statusBox", { ok: false, error: e.message, stack: e.stack });
  }
}
