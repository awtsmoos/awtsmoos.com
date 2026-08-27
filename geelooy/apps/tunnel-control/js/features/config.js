// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";
import { saveLocalSetting } from "../state/storage.js";

function el(id) { return document.getElementById(id); }
function checked(id, fallback = false) { const node = el(id); return node ? !!node.checked : fallback; }
function setChecked(id, value, defaultTrue = true) { const node = el(id); if (node) node.checked = defaultTrue ? value !== false : !!value; }
function setValue(id, value) { const node = el(id); if (node) node.value = value === undefined || value === null ? "" : String(value); }

/**
 * B"H
 * Chapter: The browser learned the git-hygiene switches.
 */
function readTools() {
  return { fsList: checked("toolFsList", true), fsTree: checked("toolFsTree", true), fsRead: checked("toolFsRead", true), fsWrite: checked("toolFsWrite", false), fsBulk: checked("toolFsBulk", true), command: checked("toolCommand", false), chrome: checked("toolChrome", false), httpProxy: checked("enableLocalHttpProxy", true) };
}

function readGitHygiene() {
  return { autoUpdateGitignore: checked("gitAutoUpdateGitignore", true), ignoreAwtsmoosTemp: checked("gitIgnoreAwtsmoosTemp", true), ignoreAiThoughts: checked("gitIgnoreAiThoughts", false) };
}

function renderRoots(roots = [], home = "") {
  const box = el("quickRoots");
  if (!box) return;
  box.innerHTML = "";
  const all = [...roots];
  if (home && !all.includes(home)) all.push(home);
  for (const root of all) {
    const btn = document.createElement("button");
    btn.className = "quick-root";
    btn.type = "button";
    btn.textContent = root;
    btn.onclick = () => setValue("rootPath", root);
    box.appendChild(btn);
  }
}

function applyConfig(config) {
  if (!config) return;
  setValue("rootPath", config.root || "");
  setChecked("allowWrite", config.allowWrite, false);
  setChecked("allowSecrets", config.allowSecrets, false);
  setChecked("allowCommands", config.allowCommands, false);
  setChecked("enableLocalHttpProxy", config.enableLocalHttpProxy, true);
  setChecked("toolFsList", config.tools?.fsList, true);
  setChecked("toolFsTree", config.tools?.fsTree, true);
  setChecked("toolFsRead", config.tools?.fsRead, true);
  setChecked("toolFsWrite", config.tools?.fsWrite, true);
  setChecked("toolFsBulk", config.tools?.fsBulk, true);
  setChecked("toolCommand", config.tools?.command, false);
  setChecked("toolChrome", config.tools?.chrome, false);
  setChecked("gitAutoUpdateGitignore", config.gitHygiene?.autoUpdateGitignore, true);
  setChecked("gitIgnoreAwtsmoosTemp", config.gitHygiene?.ignoreAwtsmoosTemp, true);
  setChecked("gitIgnoreAiThoughts", config.gitHygiene?.ignoreAiThoughts, false);
  if (config.chrome?.path) setValue("chromePath", config.chrome.path);
  if (config.chrome?.port) setValue("chromePort", config.chrome.port);
  if (config.command?.defaultShell) setValue("commandShell", config.command.defaultShell);
  if (config.command?.timeoutMs) setValue("commandTimeout", config.command.timeoutMs);
  setValue("continuationPrompt", config.continuationPrompt || "Keep going. First give me a list of all remaining things needed to make this complete, then do them one by one with real verification. At the end, call finishAndContinue if anything remains, otherwise call the conclude/final-summary step.");
  renderRoots(config.roots || [], config.home);
}

export async function loadConfig(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "configGet" });
  applyConfig(got.config);
  if ($("configOut")) jsonText("configOut", got);
  if (got.config) await saveLocalSetting("lastConfig:" + getTunnelName(), got.config);
  return got;
}

export async function saveConfig(getTunnelName) {
  const got = await callFs(getTunnelName(), {
    action: "configSet",
    root: el("rootPath")?.value || "",
    allowWrite: checked("allowWrite"),
    allowSecrets: checked("allowSecrets"),
    allowCommands: checked("allowCommands"),
    enableLocalHttpProxy: checked("enableLocalHttpProxy", true),
    continuationPrompt: el("continuationPrompt")?.value || "",
    tools: readTools(),
    gitHygiene: readGitHygiene(),
    commandConfig: { enabled: checked("allowCommands"), defaultShell: el("commandShell")?.value || "powershell", timeoutMs: Number(el("commandTimeout")?.value || 20000) },
    chrome: { enabled: checked("toolChrome"), port: Number(el("chromePort")?.value || 9222), path: el("chromePath")?.value || "" }
  });
  applyConfig(got.config);
  if ($("configOut")) jsonText("configOut", got);
  if (got.config) await saveLocalSetting("lastConfig:" + getTunnelName(), got.config);
  return got;
}

export async function loadRoots(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "roots" });
  if ($("configOut")) jsonText("configOut", got);
  renderRoots(got.roots || [], got.home);
  return got;
}

export async function openRoot(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "openRoot", root: el("rootPath")?.value || "" });
  if ($("configOut")) jsonText("configOut", got);
  return got;
}

export function mountConfig(getTunnelName) {
  if ($("loadConfigBtn")) $("loadConfigBtn").onclick = () => loadConfig(getTunnelName);
  if ($("saveConfigBtn")) $("saveConfigBtn").onclick = () => saveConfig(getTunnelName);
  if ($("rootsBtn")) $("rootsBtn").onclick = () => loadRoots(getTunnelName);
  if ($("openRootBtn")) $("openRootBtn").onclick = () => openRoot(getTunnelName);
  if ($("useRepoRootBtn")) $("useRepoRootBtn").onclick = () => setValue("rootPath", "C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\BH\\awtsmoos.com");
  if ($("applyRootToExplorerBtn")) $("applyRootToExplorerBtn").onclick = () => setValue("explorerPath", ".");
}
