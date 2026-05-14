
// B"H

import { $, jsonText } from "../lib/dom.js";
import { device } from "../api/control.js";
import { detectLogin } from "../api/auth.js";

function setPill(id, textId, good, text) {
  const pill = $(id);
  pill.classList.toggle("connected", !!good);
  pill.classList.toggle("warning", !good);
  $(textId).textContent = text;
}

export async function refreshStatus(getTunnelName) {
  const tunnelName = getTunnelName();

  const [login, oneDevice] = await Promise.all([
    detectLogin(),
    device(tunnelName)
  ]);

  jsonText("identityBox", login);
  jsonText("deviceBox", oneDevice);
  jsonText("miniStatus", oneDevice);

  setPill(
    "authPill",
    "authText",
    login.ok,
    login.ok ? "Logged in" : "Not logged in"
  );

  setPill(
    "connectionPill",
    "connectionText",
    !!oneDevice.connected,
    oneDevice.connected ? "Connected" : "Agent offline"
  );
}
