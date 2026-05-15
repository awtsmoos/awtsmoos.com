
// B"H

const params = new URLSearchParams(location.search);
const savedTunnelName = localStorage.getItem("awtsmoos:tunnelName") || "";
const savedProjectPath = localStorage.getItem("awtsmoos:projectPath") || ".";

/**
 * B"H
 * The small memory vessel of the control panel.
 *
 * The normal path should be:
 *   /apps/tunnel-control/
 *
 * A tunnelName query remains only as a developer override, not as the main
 * user flow. After the page discovers a tunnel from login/session, it stores
 * the selected tunnel locally without polluting the URL.
 */
export const state = {
  tunnelName: params.get("tunnelName") || savedTunnelName,
  projectPath: savedProjectPath,
  explorerPath: ".",
  urlTunnelOverride: params.get("tunnelName") || ""
};

/**
 * B"H
 * Remembers the active tunnel without forcing it into the URL.
 *
 * @param {string} tunnelName Active tunnel name.
 * @returns {void}
 */
export function rememberTunnelName(tunnelName) {
  state.tunnelName = String(tunnelName || "").trim();
  if (state.tunnelName) {
    localStorage.setItem("awtsmoos:tunnelName", state.tunnelName);
  }
}

/**
 * B"H
 * Clears tunnel memory when the user is logged out or no agent exists.
 *
 * @returns {void}
 */
export function forgetTunnelName() {
  state.tunnelName = "";
  localStorage.removeItem("awtsmoos:tunnelName");
}

/**
 * B"H
 * Remembers the visible project path.
 *
 * @param {string} projectPath Project path.
 * @returns {void}
 */
export function rememberProjectPath(projectPath) {
  state.projectPath = String(projectPath || ".").trim() || ".";
  localStorage.setItem("awtsmoos:projectPath", state.projectPath);
}
