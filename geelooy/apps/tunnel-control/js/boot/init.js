
// B"H

import { $ } from "../lib/dom.js";
import { log, error } from "../logger.js";
import { state, rememberTunnelName, rememberProjectPath } from "../state/state.js";
import { refreshLogin, refreshDevice } from "../features/status.js";
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
import { mountChrome } from "../features/chrome.js";

/**
 * B"H
 * Reads the active tunnel field.
 *
 * @returns {string} Tunnel name.
 */
function getTunnelName() {
  return $("tunnelName") ? $("tunnelName").value.trim() : state.tunnelName;
}

/**
 * B"H
 * Reads the project path field.
 *
 * @returns {string} Project path.
 */
function getProjectPath() {
  return $("projectPath")?.value.trim() || state.projectPath || ".";
}

/**
 * B"H
 * Hydrates old fields from resolved state.
 *
 * @param {object} tunnel Resolved tunnel.
 * @returns {void}
 */
function hydrateFields(tunnel) {
  rememberTunnelName(tunnel.tunnelName);
  rememberProjectPath(tunnel.root || state.projectPath || ".");

  if ($("tunnelName")) $("tunnelName").value = state.tunnelName;
  if ($("projectPath")) $("projectPath").value = state.projectPath;
}

/**
 * B"H
 * Marks body with permission classes.
 *
 * @param {object} tunnel Resolved tunnel.
 * @returns {void}
 */
function hydratePermissionClasses(tunnel) {
  const p = tunnel.permissions || {};

  document.body.classList.toggle("awt-can-write", !!p.allowWrite);
  document.body.classList.toggle("awt-can-command", !!p.allowCommands);
  document.body.classList.toggle("awt-can-browser", !!p.allowBrowser);
}

/**
 * B"H
 * Starts the whole control panel.
 *
 * @returns {Promise<void>} Resolves after boot.
 */
export async function startTunnelControl() {
  try {
    log("boot modular control center v3300");

    const session = await resolveSession();

    if (!session.loggedIn) {
      showLoginGate();
      return;
    }

    const tunnel = await resolveActiveTunnel();

    if (!tunnel.ok) {
      showNoTunnelView();
      return;
    }

    hydrateFields(tunnel);
    hydratePermissionClasses(tunnel);

    window.awtsGetTunnelName = getTunnelName;

    wireInputs(getTunnelName);
    await mountLegacyFeatures(getTunnelName);

    renderPrompt(getTunnelName);

    mountShell({ session, getTunnelName, getProjectPath });

    /*
     * B"H
     * Chrome must be mounted again after mountShell(), because the shell
     * creates the real data-pane="chrome" page by moving controls.
     */
    mountChrome(getTunnelName);

    bindNavigationButtons();
    mountUiRepair(getTunnelName);

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
  } catch (e) {
    document.body.innerHTML =
      "<pre>B\\\"H\\nControl panel boot failed:\\n" +
      (e.stack || e.message || String(e)) +
      "</pre>";

    error("fatal app boot error", e);
  }
}
