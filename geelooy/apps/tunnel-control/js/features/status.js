
// B"H

import { $, jsonText } from "../lib/dom.js";
import { controlMe, device } from "../api/control.js";

function setConnection(connected) {
  const pill = $("connectionPill");
  pill.classList.toggle("connected", !!connected);
  pill.classList.toggle("warning", !connected);
  $("connectionText").textContent = connected ? "Connected" : "Not connected";
}

/**
 * B"H
 * Refreshes only identity and the current tunnel's connection.
 */
export async function refreshStatus(getTunnelName) {
  const tunnelName = getTunnelName();

  const [identity, oneDevice] = await Promise.all([
    controlMe(),
    device(tunnelName)
  ]);

  jsonText("identityBox", identity);
  jsonText("deviceBox", oneDevice);
  setConnection(!!oneDevice.connected);
}
