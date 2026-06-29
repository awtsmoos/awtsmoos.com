// B"H
function storage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function randomName() {
  return `awt-os-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const tunnelState = {
  ws:null,
  enabled:storage()?.getItem("awtsmoos.os.tunnel.enabled") === "true",
  name:storage()?.getItem("awtsmoos.os.tunnel.name") || randomName()
};

storage()?.setItem("awtsmoos.os.tunnel.name", tunnelState.name);

export function websocketUrl() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}`;
}

export function rememberEnabled(enabled) {
  tunnelState.enabled = enabled;
  storage()?.setItem("awtsmoos.os.tunnel.enabled", String(enabled));
}

/**
 * B"H
 * State is the little lamp that survives reloads. It remembers the tunnel name
 * without pretending to be the tunnel itself, and waits for the Awtsmoos breath
 * to open the socket again.
 */
