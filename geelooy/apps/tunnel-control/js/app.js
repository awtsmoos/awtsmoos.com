
// B"H

import { $ } from "./lib/dom.js";
import { log, error } from "./logger.js";
import { mountTabs } from "./ui/tabs.js";
import { mountCopyButtons } from "./ui/copy.js";
import { mountFinalLayout } from "./ui/finalLayout.js";
import { refreshStatus, refreshDevice, refreshLogin } from "./features/status.js";
import { buildPrompt } from "./features/prompt.js";
import { mountExplorer } from "./features/explorer.js";
import { mountActions } from "./features/actions.js";
import { mountApiKeys } from "./features/apiKeys.js";
import { mountUsage } from "./features/usage.js";
import { mountConfig, loadConfig } from "./features/config.js";
import { mountRootPicker } from "./features/rootPicker.js";
import { state, rememberTunnelName, rememberProjectPath } from "./state/state.js";

async function maybeMountChrome(getTunnelName) {
  try {
    const mod = await import("./features/chrome.js");
    if (mod.mountChrome) await mod.mountChrome(getTunnelName);
  } catch (e) {
    console.warn("[AwtsmoosTunnelControl] Chrome feature not mounted:", e.message);
  }
}

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
  window.dispatchEvent(new CustomEvent("awtsmoos:status-refresh"));
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
  log("boot app.js final layout v2400");

  if ($("tunnelName")) $("tunnelName").value = state.tunnelName || new URL(location.href).searchParams.get("tunnelName") || "";
  if ($("projectPath")) $("projectPath").value = state.projectPath || ".";

  await safeMount("tabs", () => mountTabs());
  await safeMount("copy", () => mountCopyButtons());
  await safeMount("finalLayout-initial", () => mountFinalLayout());

  $("tunnelName")?.addEventListener("input", () => {
    syncUrlAndStorage();
    renderPrompt();
    refreshDevice(getTunnelName);
    window.dispatchEvent(new CustomEvent("awtsmoos:status-refresh"));
  });

  $("projectPath")?.addEventListener("input", () => {
    rememberProjectPath($("projectPath").value);
    renderPrompt();
  });

  $("promptMode")?.addEventListener("change", renderPrompt);
  $("refreshBtn")?.addEventListener("click", refresh);
  $("refreshDeviceBtn")?.addEventListener("click", async () => {
    await refreshDevice(getTunnelName);
    window.dispatchEvent(new CustomEvent("awtsmoos:status-refresh"));
  });

  $("copyPromptBtn")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText($("promptBox").textContent);
  });

  await safeMount("config", () => mountConfig(getTunnelName));
  await safeMount("rootPicker", () => mountRootPicker(getTunnelName));
  await safeMount("explorer", () => mountExplorer());
  await safeMount("actions", () => mountActions(getTunnelName));
  await safeMount("apiKeys", () => mountApiKeys());
  await safeMount("usage", () => mountUsage());
  await safeMount("chrome", () => maybeMountChrome(getTunnelName));

  renderPrompt();

  await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);

  await safeMount("finalLayout-after-status", () => mountFinalLayout());

  try {
    if (getTunnelName()) await loadConfig(getTunnelName);
  } catch (e) {
    error("initial loadConfig failed", e);
  }

  setInterval(async () => {
    await refreshDevice(getTunnelName);
    window.dispatchEvent(new CustomEvent("awtsmoos:status-refresh"));
  }, 5000);

  setInterval(async () => {
    await refreshLogin();
    window.dispatchEvent(new CustomEvent("awtsmoos:status-refresh"));
  }, 30000);
}

main().catch(e => {
  document.body.innerHTML =
    "<pre style='padding:20px;color:white;background:#070913;white-space:pre-wrap'>B\\\"H\\nControl panel boot failed:\\n" +
    (e.stack || e.message || String(e)) +
    "</pre>";

  error("fatal app boot error", e);
});
