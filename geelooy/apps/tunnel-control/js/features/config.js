
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";
import { saveLocalSetting } from "../state/storage.js";

/**
 * B"H
 * Gets an element safely.
 *
 * @param {string} id Element id.
 * @returns {HTMLElement|null} Element.
 */
function el(id) {
  return document.getElementById(id);
}

/**
 * B"H
 * Reads a checkbox safely.
 *
 * @param {string} id Checkbox id.
 * @param {boolean} fallback Fallback value.
 * @returns {boolean} Checked value.
 */
function checked(id, fallback = false) {
  const node = el(id);
  return node ? !!node.checked : fallback;
}

/**
 * B"H
 * Sets a checkbox safely.
 *
 * @param {string} id Checkbox id.
 * @param {unknown} value Value.
 * @param {boolean} defaultTrue Whether missing config defaults true.
 * @returns {void}
 */
function setChecked(id, value, defaultTrue = true) {
  const node = el(id);
  if (!node) return;
  node.checked = defaultTrue ? value !== false : !!value;
}

/**
 * B"H
 * Sets a form value safely.
 *
 * @param {string} id Element id.
 * @param {unknown} value Value.
 * @returns {void}
 */
function setValue(id, value) {
  const node = el(id);
  if (!node) return;
  node.value = value === undefined || value === null ? "" : String(value);
}

/**
 * B"H
 * Reads config tool checkboxes.
 *
 * @returns {object} Tools config.
 */
function readTools() {
  return {
    fsList: checked("toolFsList", true),
    fsTree: checked("toolFsTree", true),
    fsRead: checked("toolFsRead", true),
    fsWrite: checked("toolFsWrite", false),
    fsBulk: checked("toolFsBulk", true),
    command: checked("toolCommand", false),
    chrome: checked("toolChrome", false),
    httpProxy: checked("enableLocalHttpProxy", true)
  };
}

/**
 * B"H
 * Renders quick root buttons if the quick root box exists.
 *
 * @param {string[]} roots Root paths.
 * @param {string} home Home path.
 * @returns {void}
 */
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

/**
 * B"H
 * Applies returned config without crashing if UI nodes moved.
 *
 * @param {object} config Config.
 * @returns {void}
 */
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

  if (config.chrome?.path) setValue("chromePath", config.chrome.path);
  if (config.chrome?.port) setValue("chromePort", config.chrome.port);
  if (config.command?.defaultShell) setValue("commandShell", config.command.defaultShell);
  if (config.command?.timeoutMs) setValue("commandTimeout", config.command.timeoutMs);
  setValue("continuationPrompt", config.continuationPrompt || "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.");
  setValue("continuationPrompt", config.continuationPrompt || "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.");

  renderRoots(config.roots || [], config.home);
}

/**
 * B"H
 * Loads config.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<object>} Response.
 */
export async function loadConfig(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "configGet" });
  applyConfig(got.config);

  if ($("configOut")) jsonText("configOut", got);

  if (got.config) {
    await saveLocalSetting("lastConfig:" + getTunnelName(), got.config);
  }

  return got;
}

/**
 * B"H
 * Saves config.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<object>} Response.
 */
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
    commandConfig: {
      enabled: checked("allowCommands"),
      defaultShell: el("commandShell")?.value || "powershell",
      timeoutMs: Number(el("commandTimeout")?.value || 20000)
    },
    chrome: {
      enabled: checked("toolChrome"),
      port: Number(el("chromePort")?.value || 9222),
      path: el("chromePath")?.value || ""
    }
  });

  applyConfig(got.config);
  if ($("configOut")) jsonText("configOut", got);

  if (got.config) {
    await saveLocalSetting("lastConfig:" + getTunnelName(), got.config);
  }

  return got;
}

/**
 * B"H
 * Loads root shortcuts.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<object>} Response.
 */
export async function loadRoots(getTunnelName) {
  const got = await callFs(getTunnelName(), { action: "roots" });
  if ($("configOut")) jsonText("configOut", got);
  renderRoots(got.roots || [], got.home);
  return got;
}

/**
 * B"H
 * Opens selected root.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<object>} Response.
 */
export async function openRoot(getTunnelName) {
  const got = await callFs(getTunnelName(), {
    action: "openRoot",
    root: el("rootPath")?.value || ""
  });

  if ($("configOut")) jsonText("configOut", got);
  return got;
}

/**
 * B"H
 * Mounts config controls safely.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
export function mountConfig(getTunnelName) {
  if ($("loadConfigBtn")) $("loadConfigBtn").onclick = () => loadConfig(getTunnelName);
  if ($("saveConfigBtn")) $("saveConfigBtn").onclick = () => saveConfig(getTunnelName);
  if ($("rootsBtn")) $("rootsBtn").onclick = () => loadRoots(getTunnelName);
  if ($("openRootBtn")) $("openRootBtn").onclick = () => openRoot(getTunnelName);

  if ($("useRepoRootBtn")) {
    $("useRepoRootBtn").onclick = () => {
      setValue("rootPath", "C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\BH\\awtsmoos.com");
    };
  }

  if ($("applyRootToExplorerBtn")) {
    $("applyRootToExplorerBtn").onclick = () => {
      setValue("explorerPath", ".");
    };
  }
}
