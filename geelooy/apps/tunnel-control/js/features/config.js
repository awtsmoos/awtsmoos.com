
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
    fsBulk: $("toolFsBulk").checked
  };
}

function setChecked(id, value) {
  $(id).checked = !!value;
}

function applyConfig(config) {
  if (!config) return;

  $("rootPath").value = config.root || "";
  setChecked("allowWrite", !!config.allowWrite);
  setChecked("allowSecrets", !!config.allowSecrets);
  setChecked("enableLocalHttpProxy", !!config.enableLocalHttpProxy);

  setChecked("toolFsList", config.tools?.fsList !== false);
  setChecked("toolFsTree", config.tools?.fsTree !== false);
  setChecked("toolFsRead", config.tools?.fsRead !== false);
  setChecked("toolFsWrite", config.tools?.fsWrite !== false);
  setChecked("toolFsBulk", config.tools?.fsBulk !== false);

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
    enableLocalHttpProxy: $("enableLocalHttpProxy").checked,
    tools: readTools()
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

export function mountConfig(getTunnelName) {
  $("loadConfigBtn").onclick = () => loadConfig(getTunnelName);
  $("saveConfigBtn").onclick = () => saveConfig(getTunnelName);
  $("rootsBtn").onclick = () => loadRoots(getTunnelName);

  $("useRepoRootBtn").onclick = () => {
    $("rootPath").value = "C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\BH\\awtsmoos.com";
  };

  $("applyRootToExplorerBtn").onclick = () => {
    $("explorerPath").value = ".";
  };
}
