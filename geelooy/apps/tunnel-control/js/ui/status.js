
// B"H
import { $ } from "./dom.js";
import { callFs, show } from "./api.js";

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = String(value ?? "");
}

function setBadge(id, kind, text) {
  const el = $(id);
  if (!el) return;
  el.classList.remove("good", "warn", "bad");
  el.classList.add(kind);
  el.textContent = text;
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: false, error: "non_json_response", status: res.status, text }; }
}

function tunnelFromDevice(got) {
  return got?.tunnelName || got?.device?.tunnelName || got?.tunnel?.tunnelName ||
    got?.device?.name || got?.tunnel?.name || got?.name || "";
}

function userFromMe(got) {
  return got?.identity?.userId || got?.identity?.email || got?.user?.email ||
    got?.user?.username || got?.userId || got?.email || "";
}

function rememberTunnel(name) {
  if (!name) return;
  if ($("tunnelName") && !$("tunnelName").value) $("tunnelName").value = name;
  localStorage.setItem("awtTunnelName", name);
  localStorage.setItem("awtsmoos.tunnelName", name);
  setText("miniTunnel", name);
}

async function loadConfigLabel(name) {
  if (!name) return "no tunnel";
  const got = await callFs({ action: "configGet" }).catch(e => ({ ok: false, error: e.message }));
  if (got?.config?.root) return got.config.root;
  if (got?.ok) return "connected";
  return got?.message || got?.error || "connected, config not loaded";
}

export async function refreshStatus(getTunnelName) {
  setText("miniAgent", "Checking...");
  setText("miniLogin", "Checking...");
  setBadge("agentPill", "warn", "Agent: checking");
  setBadge("authPill", "warn", "Login: checking");

  const me = await getJson("/api/tunnel/control/me").catch(e => ({ ok: false, error: e.message }));
  const dev = await getJson("/api/tunnel/control/my-device").catch(e => ({ ok: false, error: e.message }));

  const user = userFromMe(me);
  if (me && me.ok !== false && user) {
    setText("miniLogin", user);
    setBadge("authPill", "good", "Login: logged in");
  } else {
    setText("miniLogin", "Not logged in");
    setBadge("authPill", "bad", "Login: needed");
  }

  const discovered = tunnelFromDevice(dev);
  rememberTunnel(getTunnelName() || discovered);

  const name = getTunnelName() || discovered;
  const connected = dev && dev.ok !== false && dev.connected !== false && !!name;
  if (connected) {
    const root = await loadConfigLabel(name);
    setText("miniAgent", "Connected");
    setBadge("agentPill", "good", "Agent: connected");
    setText("deviceSummary", "Agent connected: " + name + "\nRoot: " + root);
  } else {
    setText("miniAgent", "Offline");
    setBadge("agentPill", "bad", "Agent: offline");
    setText("deviceSummary", "Agent not connected. Run install/restart, then Refresh.");
  }

  show("miniStatus", { me, device: dev, tunnelName: name });
  show("statusBox", { me, device: dev, tunnelName: name });
}
