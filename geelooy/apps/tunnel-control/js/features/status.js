
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

function identityHtml(login) {
  if (!login.ok) {
    return [
      "<strong>Not logged in.</strong>",
      "<span>Open the login page, then refresh this dashboard.</span>"
    ].join("<br>");
  }

  const user =
    login.user?.userId ||
    login.user?.identity?.userId ||
    login.control?.identity?.userId ||
    login.oauthStart?.user?.userId ||
    "unknown";

  const source = login.control?.ok ? "session/control API" : "oauth start check";

  return [
    "<strong>Logged in as: " + user + "</strong>",
    "<span>Detected by: " + source + "</span>"
  ].join("<br>");
}

function deviceHtml(oneDevice) {
  if (!oneDevice.ok) {
    return "<strong>Could not check tunnel.</strong><br><span>" + (oneDevice.error || "Unknown error") + "</span>";
  }

  if (!oneDevice.connected) {
    return "<strong>Agent offline for this tunnel.</strong><br><span>Run the install/restart command again.</span>";
  }

  const d = oneDevice.device || {};

  return [
    "<strong>Agent connected.</strong>",
    "<span>Root: " + (d.root || "unknown") + "</span>",
    "<span>Writes: " + (d.allowWrite ? "enabled" : "disabled") + "</span>"
  ].join("<br>");
}

export async function refreshLogin() {
  try {
    const login = await detectLogin();

    jsonText("identityBox", login);
    $("identitySummary").innerHTML = identityHtml(login);

    setPill(
      "authPill",
      "authText",
      login.ok,
      login.ok ? "Logged in" : "Not logged in"
    );

    $("miniLogin").textContent = login.ok ? "Logged in" : "No session";

    return login;
  } catch (e) {
    $("identitySummary").innerHTML = "<strong>Login check failed.</strong><br><span>" + e.message + "</span>";
    jsonText("identityBox", { ok: false, error: e.message, stack: e.stack });
    setPill("authPill", "authText", false, "Login check failed");
    $("miniLogin").textContent = "Error";
  }
}

export async function refreshDevice(getTunnelName) {
  const tunnelName = getTunnelName();

  try {
    const oneDevice = await device(tunnelName);

    jsonText("deviceBox", oneDevice);
    jsonText("miniStatus", oneDevice);
    $("deviceSummary").innerHTML = deviceHtml(oneDevice);

    setPill(
      "connectionPill",
      "connectionText",
      !!oneDevice.connected,
      oneDevice.connected ? "Connected" : "Agent offline"
    );

    $("miniAgent").textContent = oneDevice.connected ? "Connected" : "Offline";

    return oneDevice;
  } catch (e) {
    $("deviceSummary").innerHTML = "<strong>Device check failed.</strong><br><span>" + e.message + "</span>";
    jsonText("deviceBox", { ok: false, error: e.message, stack: e.stack });
    jsonText("miniStatus", { ok: false, error: e.message });
    setPill("connectionPill", "connectionText", false, "Agent check failed");
    $("miniAgent").textContent = "Error";
  }
}

export async function refreshStatus(getTunnelName) {
  await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);
}
