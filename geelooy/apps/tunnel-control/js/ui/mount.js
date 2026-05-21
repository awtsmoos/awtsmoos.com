
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
import { createLiveTunnelMesh } from "../platform/liveTunnelMesh.js";
import { createLiveTunnelMesh } from "../platform/liveTunnelMesh.js";

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
      refresh().then(autoLoadConfig);
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

    qsa("[data-instant-config]").forEach(box => box.onchange = () => queueConfigSave("permission changed"));

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
  createLiveTunnelMesh({ readTunnel: tunnelName, onSnapshot: applyLiveTunnelSnapshot }).start();
}

function safe(name, fn) {
  try { return fn(); }
  catch (e) {
    console.error("B'H control mount failed:", name, e);
    setStatusBadges("bad", "Login: UI error", "Agent: UI error");
    show("statusBox", { ok: false, where: name, error: e.message, stack: e.stack });
  }
}

function safeMount(name, fn) {
  try {
    const got = fn();
    if (got && typeof got.catch === "function") {
      got.catch(e => show("statusBox", { ok: false, where: name, error: e.message, stack: e.stack }));
    }
  } catch (e) {
    show("statusBox", { ok: false, where: name, error: e.message, stack: e.stack });
  }
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setBadge(id, kind, text) {
  const el = $(id);
  if (!el) return;

  el.classList.remove("good", "warn", "bad");
  if (kind) el.classList.add(kind);
  el.textContent = text;
}

function setStatusBadges(kind, loginText, agentText) {
  setBadge("authPill", kind, loginText);
  setBadge("agentPill", kind, agentText);
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
    continuationPrompt: $("continuationPrompt")?.value || "",
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
  if ($("continuationPrompt")) $("continuationPrompt").value = config.continuationPrompt || "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.";

  setText("miniKey", localStorage.getItem("awtTunnelApiKey") ? "Saved" : "Not needed");
}

function applyLiveTunnelSnapshot(snapshot) {
  if (!snapshot || snapshot.ok === false) return;
  const selected = (snapshot.devices || []).find(x => x.tunnelName === tunnelName()) || (snapshot.devices || [])[0];
  if (selected?.tunnelName && !tunnelName()) $("tunnelName").value = selected.tunnelName;
  if (selected?.tunnelName) setText("miniTunnel", selected.tunnelName);
  if (selected) setText("miniAgent", selected.connected === false ? "Offline" : "Connected live");
}

function applyLiveTunnelSnapshot(snapshot) {
  if (!snapshot || snapshot.ok === false) return;
  const selected = (snapshot.devices || []).find(x => x.tunnelName === tunnelName()) || (snapshot.devices || [])[0];
  if (selected?.tunnelName && !tunnelName()) $("tunnelName").value = selected.tunnelName;
  if (selected?.tunnelName) setText("miniTunnel", selected.tunnelName);
  if (selected) setText("miniAgent", selected.connected === false ? "Offline" : "Connected live");
}

function myDeviceUrl() {
  const u = new URL("/api/tunnel/control/my-device", location.origin);
  const t = tunnelName();
  if (t) u.searchParams.set("tunnelName", t);
  return u.toString();
}

function pickTunnelFromMultiple(got) {
  const t = tunnelName();
  if (!t || !Array.isArray(got.tunnels)) return null;
  return got.tunnels.find(x => x.tunnelName === t) || null;
}

async function refresh() {
  try {
    setText("miniAgent", "Checking...");
    setText("miniLogin", "Checking...");
    setStatusBadges("warn", "Login: checking", "Agent: checking");

    const got = await fetch(myDeviceUrl(), {
      credentials: "include",
      headers: { Accept: "application/json" }
    }).then(r => r.json());

    show("statusBox", got);
    show("miniStatus", got);

    if (got.tunnelName && !$("tunnelName").value) $("tunnelName").value = got.tunnelName;

    const identity = got.identity || {};
    const user = identity.userId || identity.email || "";
    const selected = got.device || pickTunnelFromMultiple(got);
    const agentGood = !!selected?.connected || !!got.ok;

    setText("miniTunnel", tunnelName() || got.tunnelName || selected?.tunnelName || "No tunnel selected");
    setText("miniLogin", user || "Login unknown");
    setText("miniAgent", agentGood ? "Connected" : (got.error || "Not connected"));

    setBadge("authPill", user ? "good" : "bad", user ? "Login: " + user : "Login: needed");

    if (agentGood) {
      setBadge("agentPill", "good", "Agent: connected");
    } else if (got.error === "multiple_tunnels_connected") {
      setBadge("agentPill", "warn", "Agent: pick tunnel");
    } else {
      setBadge("agentPill", "bad", "Agent: " + (got.error || "offline"));
    }
  } catch (e) {
    setText("miniAgent", "Refresh failed");
    setText("miniLogin", "Unknown");
    setStatusBadges("bad", "Login: unknown", "Agent: refresh failed");
    show("statusBox", { ok: false, error: e.message, stack: e.stack });
  }
}
