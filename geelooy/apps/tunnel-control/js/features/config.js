
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

function readTools() {
  return {
    fsList: $("toolFsList").checked,
    fsTree: $("toolFsTree").checked,
    fsRead: $("toolFsRead").checked,
    fsWrite: $("toolFsWrite").checked,
    fsBulk: $("toolFsBulk").checked
  };
}

function applyConfig(config) {
  if (!config) return;

  $("rootPath").value = config.root || "";
  $("allowWrite").checked = !!config.allowWrite;
  $("allowSecrets").checked = !!config.allowSecrets;
  $("enableLocalHttpProxy").checked = !!config.enableLocalHttpProxy;
  $("toolFsList").checked = config.tools?.fsList !== false;
  $("toolFsTree").checked = config.tools?.fsTree !== false;
  $("toolFsRead").checked = config.tools?.fsRead !== false;
  $("toolFsWrite").checked = config.tools?.fsWrite !== false;
  $("toolFsBulk").checked = config.tools?.fsBulk !== false;

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
}
