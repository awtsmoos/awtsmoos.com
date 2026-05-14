
// B"H

import { $ } from "./lib/dom.js";
import { log, error } from "./logger.js";
import { mountTabs } from "./ui/tabs.js";
import { mountCopyButtons } from "./ui/copy.js";
import { refreshStatus, refreshDevice, refreshLogin } from "./features/status.js";
import { buildPrompt } from "./features/prompt.js";
import { mountExplorer } from "./features/explorer.js";
import { mountActions } from "./features/actions.js";
import { mountApiKeys } from "./features/apiKeys.js";
import { mountUsage } from "./features/usage.js";
import { mountTerminal } from "./features/terminal.js";
import { mountChrome } from "./features/chrome.js";
import { mountConfig, loadConfig } from "./features/config.js";
import { mountRootPicker } from "./features/rootPicker.js";
import { state } from "./state/state.js";

function getTunnelName() {
  return $("tunnelName").value.trim();
}

window.awtsGetTunnelName = getTunnelName;

function renderPrompt() {
  const box = $("promptBox");
  if (!box) return;

  box.textContent = buildPrompt({
    tunnelName: getTunnelName(),
    projectPath: $("projectPath").value.trim() || ".",
    mode: $("promptMode").value
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

async function main() {
  log("boot app.js");

  $("tunnelName").value = state.tunnelName || new URLSearchParams(location.search).get("tunnelName") || "";
  $("projectPath").value = state.projectPath || ".";

  $("tunnelName").addEventListener("input", () => {
    renderPrompt();
    refreshDevice(getTunnelName);
  });

  $("projectPath").addEventListener("input", renderPrompt);
  $("promptMode").addEventListener("change", renderPrompt);
  $("refreshBtn").addEventListener("click", refresh);
  $("refreshDeviceBtn").addEventListener("click", () => refreshDevice(getTunnelName));

  $("copyPromptBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("promptBox").textContent);
  });

  await safeMount("tabs", () => mountTabs());
  await safeMount("copy", () => mountCopyButtons());
  await safeMount("config", () => mountConfig(getTunnelName));
  await safeMount("rootPicker", () => mountRootPicker(getTunnelName));
  await safeMount("explorer", () => mountExplorer());
  await safeMount("actions", () => mountActions(getTunnelName));
  await safeMount("apiKeys", () => mountApiKeys());
  await safeMount("usage", () => mountUsage());
  await safeMount("terminal", () => mountTerminal(getTunnelName));
  await safeMount("chrome", () => mountChrome(getTunnelName));

  renderPrompt();

  await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);

  try {
    await loadConfig(getTunnelName);
  } catch (e) {
    error("initial loadConfig failed", e);
  }

  setInterval(() => refreshDevice(getTunnelName), 5000);
  setInterval(refreshLogin, 30000);
}

main().catch(e => {
  document.body.innerHTML = "<pre style='padding:20px;color:white;background:#070913;white-space:pre-wrap'>B\"H\nControl panel boot failed:\n" + e.stack + "</pre>";
  error("fatal app boot error", e);
});
