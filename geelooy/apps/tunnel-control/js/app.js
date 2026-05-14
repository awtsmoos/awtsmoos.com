
// B"H

import { $ } from "./lib/dom.js";
import { log, error } from "./logger.js";
import { mountTabs } from "./ui/tabs.js";
import { mountCopyButtons } from "./ui/copy.js";
import { mountControlPanels } from "./ui/controlPanels.js";
import { refreshStatus, refreshDevice, refreshLogin } from "./features/status.js";
import { buildPrompt } from "./features/prompt.js";
import { mountExplorer } from "./features/explorer.js";
import { mountActions } from "./features/actions.js";
import { mountApiKeys } from "./features/apiKeys.js";
import { mountUsage } from "./features/usage.js";
import { mountConfig, loadConfig } from "./features/config.js";
import { mountRootPicker } from "./features/rootPicker.js";
import { mountChrome } from "./features/chrome.js";
import { state, rememberTunnelName, rememberProjectPath } from "./state/state.js";

function getTunnelName() {
  return $("tunnelName") ? $("tunnelName").value.trim() : "";
}

window.awtsGetTunnelName = getTunnelName;

function renderPrompt() {
  if (!$("promptBox")) return;

  $("promptBox").textContent = buildPrompt({
    tunnelName: getTunnelName(),
    projectPath: $("projectPath")?.value.trim() || ".",
    mode: $("promptMode")?.value || "general"
  });
}

async function refresh() {
  await refreshStatus(getTunnelName);
}

async function safeMount(name, fn) {
  try {
    log("mounting", name);
    await fn();
    log("mounted", name);
  } catch (e) {
    error("mount failed:", name, e);
  }
}

function syncUrlAndStorage() {
  const tunnelName = getTunnelName();

  if (!tunnelName) return;

  rememberTunnelName(tunnelName);

  const url = new URL(location.href);

  if (url.searchParams.get("tunnelName") !== tunnelName) {
    url.searchParams.set("tunnelName", tunnelName);
    history.replaceState(null, "", url.toString());
  }
}

async function main() {
  log("boot app.js v2100");

  if ($("tunnelName")) $("tunnelName").value = state.tunnelName || "";
  if ($("projectPath")) $("projectPath").value = state.projectPath || ".";

  $("tunnelName")?.addEventListener("input", () => {
    syncUrlAndStorage();
    renderPrompt();
    refreshDevice(getTunnelName);
  });

  $("projectPath")?.addEventListener("input", () => {
    rememberProjectPath($("projectPath").value);
    renderPrompt();
  });

  $("promptMode")?.addEventListener("change", renderPrompt);
  $("refreshBtn")?.addEventListener("click", refresh);
  $("refreshDeviceBtn")?.addEventListener("click", () => refreshDevice(getTunnelName));

  $("copyPromptBtn")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText($("promptBox").textContent);
  });

  await safeMount("tabs", () => mountTabs());
  await safeMount("controlPanels", () => mountControlPanels());
  await safeMount("copy", () => mountCopyButtons());
  await safeMount("config", () => mountConfig(getTunnelName));
  await safeMount("rootPicker", () => mountRootPicker(getTunnelName));
  await safeMount("explorer", () => mountExplorer());
  await safeMount("actions", () => mountActions(getTunnelName));
  await safeMount("apiKeys", () => mountApiKeys());
  await safeMount("usage", () => mountUsage());
  await safeMount("chrome", () => mountChrome(getTunnelName));

  renderPrompt();

  await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);

  try {
    if (getTunnelName()) await loadConfig(getTunnelName);
  } catch (e) {
    error("initial loadConfig failed", e);
  }

  setInterval(() => refreshDevice(getTunnelName), 5000);
  setInterval(refreshLogin, 30000);
}

main().catch(e => {
  document.body.innerHTML =
    "<pre style='padding:20px;color:white;background:#070913;white-space:pre-wrap'>B\\\"H\\nControl panel boot failed:\\n" +
    (e.stack || e.message || String(e)) +
    "</pre>";

  error("fatal app boot error", e);
});
