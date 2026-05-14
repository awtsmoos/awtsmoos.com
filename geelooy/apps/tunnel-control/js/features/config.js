
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";
import { saveLocalSetting } from "../state/storage.js";

function readTools() {
  return {
    fsList: $("toolFsList").checked,
    fsTree: $("toolFsTree").checked,
    fsRead: $("toolFsRead").checked,
    fsWrite: $("toolFsWrite").checked,
    fsBulk: $("toolFsBulk").checked,
    command: $("toolCommand").checked,
    chrome: $("toolChrome").checked,
    httpProxy: $("enableLocalHttpProxy").checked
  };
}

function setChecked(id, value) {
  $(id).checked = value !== false;
}

function applyConfig(config) {
  if (!config) return;

  $("rootPath").value = config.root || "";
  setChecked("allowWrite", config.allowWrite);
  $("allowSecrets").checked = !!config.allowSecrets;
  $("allowCommands").checked = !!config.allowCommands;
  setChecked("enableLocalHttpProxy", config.enableLocalHttpProxy);

  setChecked("toolFsList", config.tools?.fsList);
  setChecked("toolFsTree", config.tools?.fsTree);
  setChecked("toolFsRead", config.tools?.fsRead);
  setChecked("toolFsWrite", config.tools?.fsWrite);
  setChecked("toolFsBulk", config.tools?.fsBulk);
  $("toolCommand").checked = !!config.tools?.command;
  $("toolChrome").checked = !!config.tools?.chrome;

  if (config.chrome?.path) document.getElementById("chromePath").value = config.chrome.path;
  if (config.chrome?.port) document.getElementById("chromePort").value = config.chrome.port;
  if (config.command?.defaultShell) document.getElementById("commandShell").value = config.command.defaultShell;
  if (config.command?.timeoutMs) document.getElementById("commandTimeout").value = config.command.timeoutMs;

  renderRoots(config.roots || [], config.home);
}

function renderRoots(roots, home) {
  const box = $("quickRoots");
  box.innerHTML = "";

  const all = [...roots];

  if (home && !all.includes(home)) all.push(home);

  for (const root of all) {
    const btn = document.createElement("button");
    btn.className = "quick-root";
    btn.textContent = root;
    btn.onclick = () => $("rootPath").value = root;
    box.appendChild(btn);
  }
}

export async function loadConfig(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "configGet" });
  applyConfig(got.config);
  jsonText("configOut", got);

  if (got.config) {
    await saveLocalSetting("lastConfig:" + getTunnelName(), got.config);
  }

  return got;
}

export async function saveConfig(getTunnelName) {
  const got = await callFs(getTunnelName(), {
    action: "configSet",
    root: $("rootPath").value,
    allowWrite: $("allowWrite").checked,
    allowSecrets: $("allowSecrets").checked,
    allowCommands: $("allowCommands").checked,
    enableLocalHttpProxy: $("enableLocalHttpProxy").checked,
    tools: readTools(),
    commandConfig: {
      enabled: $("allowCommands").checked,
      defaultShell: document.getElementById("commandShell")?.value || "powershell",
      timeoutMs: Number(document.getElementById("commandTimeout")?.value || 20000)
    },
    chrome: {
      enabled: $("toolChrome").checked,
      port: Number(document.getElementById("chromePort")?.value || 9222),
      path: document.getElementById("chromePath")?.value || ""
    }
  });

  applyConfig(got.config);
  jsonText("configOut", got);

  if (got.config) {
    await saveLocalSetting("lastConfig:" + getTunnelName(), got.config);
  }

  return got;
}

export async function loadRoots(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "roots" });
  jsonText("configOut", got);
  renderRoots(got.roots || [], got.home);
}

export async function openRoot(getTunnelName) {
  const got = await callFs(getTunnelName(), {
    action: "openRoot",
    root: $("rootPath").value
  });
  jsonText("configOut", got);
}

export function mountConfig(getTunnelName) {
  $("loadConfigBtn").onclick = () => loadConfig(getTunnelName);
  $("saveConfigBtn").onclick = () => saveConfig(getTunnelName);
  $("rootsBtn").onclick = () => loadRoots(getTunnelName);
  $("openRootBtn").onclick = () => openRoot(getTunnelName);

  $("useRepoRootBtn").onclick = () => {
    $("rootPath").value = "C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\BH\\awtsmoos.com";
  };

  $("applyRootToExplorerBtn").onclick = () => {
    $("explorerPath").value = ".";
  };
}
