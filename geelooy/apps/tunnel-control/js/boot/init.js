// B"H

import { log, error } from "../logger.js";
import { refreshLogin, refreshDevice } from "../features/status.js";
import { devices } from "../api/control.js";
import { loadConfig } from "../features/config.js";
import { resolveSession } from "../session/sessionClient.js";
import { showLoginGate } from "../session/loginGate.js";
import { resolveActiveTunnel } from "../tunnels/tunnelResolver.js";
import { showNoTunnelView } from "../tunnels/noTunnelView.js";
import { wireInputs } from "./wireInputs.js";
import { renderPrompt } from "./renderPrompt.js";
import { mountLegacyFeatures } from "./mountLegacyFeatures.js";
import { mountShell } from "../shell/mountShell.js";
import { mountUiRepair } from "./repairUi.js";
import { bindNavigationButtons } from "../router/bindNavigation.js";
import { createActiveWorkspaceRuntime } from "../runtime/activeWorkspaceRuntime.js";
import { mountPointerField } from "../interactions/pointerField.js";
import { mountCardTilt } from "../interactions/cardTilt.js";
import { getProjectPath, getTunnelName } from "./bootAccessors.js";
import { hydrateFields, hydratePermissionClasses } from "./bootHydrate.js";
import { hydrateRuntimeMesh } from "./bootRuntimeMesh.js";
import { showFatalBootError } from "./bootFatal.js";

/**
 * B"H
 * Chapter 410: The rail returned to nothing, and the road could breathe.
 *
 * The Awtsmoos writes the control room as one open field. Beauty remains in
 * light, motion, cards, and readable order; no fixed side palace mounts over
 * the work, and no diagnostic river steals the scroll from the main path.
 */
export async function startTunnelControl() {
  try {
    log("boot modular control center v3301 no side rails");
    const session = await resolveSession();
    if (!session.loggedIn) return showLoginGate();
    const tunnel = await resolveActiveTunnel();
    if (!tunnel.ok) return showNoTunnelView();
    hydrateFields(tunnel);
    hydratePermissionClasses(tunnel);
    const localRuntime = createActiveWorkspaceRuntime({
      tunnel,
      activeRoot: tunnel.root,
      authState: session,
      workspaceMode: "runtime-os"
    });
    const discoveredDevices = await discoverDevices();
    const runtime = hydrateRuntimeMesh(localRuntime, discoveredDevices);
    window.awtsGetTunnelName = getTunnelName;
    wireInputs(getTunnelName);
    await mountLegacyFeatures(getTunnelName);
    renderPrompt(getTunnelName);
    mountShell({ session, runtime, getTunnelName, getProjectPath });
    mountPointerField();
    mountCardTilt();
    bindNavigationButtons();
    mountUiRepair(getTunnelName);
    await refreshInitialStatus();
    await loadInitialConfig();
    mountPolling();
  } catch (e) {
    showFatalBootError(e);
    error("fatal app boot error", e);
  }
}

async function discoverDevices() {
  try { return await devices(); }
  catch (e) { error("devices discovery failed", e); return null; }
}

async function refreshInitialStatus() {
  await Promise.allSettled([refreshLogin(), refreshDevice(getTunnelName)]);
}

async function loadInitialConfig() {
  try { await loadConfig(getTunnelName); }
  catch (e) { error("initial loadConfig failed", e); }
}

function mountPolling() {
  setInterval(() => refreshDevice(getTunnelName), 5000);
  setInterval(refreshLogin, 30000);
}
