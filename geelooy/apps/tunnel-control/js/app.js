// B"H

import { $ } from "./lib/dom.js";
import { mountTabs } from "./ui/tabs.js";
import { mountCopyButtons } from "./ui/copy.js";
import { refreshStatus, refreshDevice, refreshLogin } from "./features/status.js";
import { buildPrompt } from "./features/prompt.js";
import { mountExplorer } from "./features/explorer.js";
import { mountActions } from "./features/actions.js";
import { mountApiKeys } from "./features/apiKeys.js";
import { mountUsage } from "./features/usage.js";
import { mountConfig, loadConfig } from "./features/config.js";
import { mountRootPicker } from "./features/rootPicker.js";
import { state } from "./state/state.js";

function getTunnelName() {
  return $("tunnelName").value.trim();
}

window.awtsGetTunnelName = getTunnelName;

function renderPrompt() {
  $("promptBox").textContent = buildPrompt({
    tunnelName: getTunnelName(),
    projectPath: $("projectPath").value.trim() || ".",
    mode: $("promptMode").value
  });
}

async function refresh() {
  await refreshStatus(getTunnelName);
}

async function main() {
  $("tunnelName").value = state.tunnelName;
  $("projectPath").value = state.projectPath;

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

  mountTabs();
  mountCopyButtons();
  mountConfig(getTunnelName);
  mountRootPicker(getTunnelName);
  mountExplorer();
  mountActions(getTunnelName);
  mountApiKeys();
  mountUsage();

  renderPrompt();

  await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);

  try {
    await loadConfig(getTunnelName);
  } catch (e) {}

  setInterval(() => refreshDevice(getTunnelName), 5000);
  setInterval(refreshLogin, 30000);
}

main();