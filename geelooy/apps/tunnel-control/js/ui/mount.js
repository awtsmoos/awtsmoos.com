
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
let autoLoadCount = 0;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function mountAll() {
  qsa("[data-go]").forEach(x => x.onclick = () => switchPane(x.dataset.go));

  $("tunnelName").oninput = () => {
    localStorage.setItem("awtTunnelName", tunnelName());
    localStorage.setItem("awtsmoos.tunnelName", tunnelName());

    if ($("miniTunnel")) {
      $("miniTunnel").textContent = tunnelName() || "No tunnel selected";
    }

    autoLoadConfig();
  };

  $("refreshBtn").onclick = refresh;
  $("loginBtn").onclick = () => location.href = "/login/?next=" + encodeURIComponent(location.href);
  $("logoutBtn").onclick = () => location.href = "/logout?next=" + encodeURIComponent(location.href);

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

  mountRootPicker();
  mountChrome();
  mountExplorer();
  mountTerminal();
  mountPrompt();
  mountKeys();

  refresh().then(autoLoadConfig);
  setInterval(refresh, 7000);
}

function checked(id, fallback = true) {
  const el = $(id);
  return el ? !!el.checked : fallback;
}

function setChecked(id, value) {
  const el = $(id);
  if (!el) return;
  el.checked = value !== false;
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
  $("configSaveStatus").textContent = "Saving " + reason + "...";
  configTimer = setTimeout(() => saveConfigNow(reason), 250);
}

async function saveConfigNow(reason = "save") {
  clearTimeout(configTimer);
  $("configSaveStatus").textContent = "Saving...";
  const got = await callFs(payloadFromUi());
  show("configOut", got);

  if (got.ok) {
    $("configSaveStatus").textContent = "Saved instantly: " + reason;
    applyConfig(got.config || {});
  } else {
    $("configSaveStatus").textContent = "Save failed: " + humanError(got);
  }

  return got;
}

async function autoLoadConfig() {
  for (let i = 0; i < 18; i++) {
    autoLoadCount++;
    const got = await loadConfig({ silent: i > 0, auto: true });

    if (got && got.ok) return got;

    $("configSaveStatus").textContent = "Waiting for tunnel config... retry " + (i + 1);
    await wait(Math.min(800 + i * 250, 4000));
  }

  return null;
}

async function loadConfig(options = {}) {
  loadingConfig = true;

  if (!options.silent) {
    $("configSaveStatus").textContent = "Loading config...";
  }

  const got = await callFs({ action: "configGet" });
  show("configOut", got);

  if (got.ok) {
    applyConfig(got.config || {});
    $("configSaveStatus").textContent = "Config loaded. Switches are live.";
  } else if (!options.silent || options.manual) {
    $("configSaveStatus").textContent = "Config load failed: " + humanError(got);
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

  if ($("miniKey")) $("miniKey").textContent = localStorage.getItem("awtTunnelApiKey") ? "Saved" : "Not needed";
}

async function refresh() {
  try {
    const got = await fetch("/api/tunnel/control/my-device", {
      credentials: "include",
      headers: { Accept: "application/json" }
    }).then(r => r.json());

    show("statusBox", got);
    show("miniStatus", got);

    if (got.tunnelName && !$("tunnelName").value) $("tunnelName").value = got.tunnelName;

    $("miniTunnel").textContent = tunnelName() || got.tunnelName || "No tunnel selected";
    $("miniAgent").textContent = got.ok ? "Connected" : "Not connected";
    $("miniLogin").textContent = got.identity?.userId || got.identity?.email || "Logged in";
  } catch (e) {
    show("statusBox", { ok: false, error: e.message });
  }
}
