
// B"H

const params = new URLSearchParams(location.search);

function readLocal(key, fallback = "") {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
  } catch (e) {}
}

const queryTunnelName = params.get("tunnelName") || "";
const storedTunnelName = readLocal("awtsmoos.tunnelName", "");
const tunnelName = queryTunnelName || storedTunnelName || "";

if (queryTunnelName) {
  writeLocal("awtsmoos.tunnelName", queryTunnelName);
}

export const state = {
  tunnelName,
  projectPath: readLocal("awtsmoos.projectPath", "."),
  explorerPath: readLocal("awtsmoos.explorerPath", ".")
};

export function rememberTunnelName(value) {
  state.tunnelName = String(value || "").trim();
  writeLocal("awtsmoos.tunnelName", state.tunnelName);
}

export function rememberProjectPath(value) {
  state.projectPath = String(value || ".").trim() || ".";
  writeLocal("awtsmoos.projectPath", state.projectPath);
}

export function rememberExplorerPath(value) {
  state.explorerPath = String(value || ".").trim() || ".";
  writeLocal("awtsmoos.explorerPath", state.explorerPath);
}
