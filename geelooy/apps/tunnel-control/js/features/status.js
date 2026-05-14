
// B"H

import { jsonText } from "../lib/dom.js";
import { tunnelStatus } from "../api/tunnel.js";
import { controlMe, devices } from "../api/control.js";

export async function refreshStatus() {
  const [raw, identity, deviceInfo] = await Promise.all([
    tunnelStatus(),
    controlMe(),
    devices()
  ]);

  jsonText("identityBox", identity);
  jsonText("statusBox", {
    rawTunnel: raw,
    accountDevices: deviceInfo
  });
}
