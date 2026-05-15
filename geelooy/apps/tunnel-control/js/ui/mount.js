
// B"H
import { $, qsa } from "./dom.js";
import { callFs, show, tunnelName } from "./api.js";
import { mountRootPicker } from "../features/rootPicker.js";
import { mountChrome } from "../features/chrome.js";
import { mountExplorer } from "../features/explorer.js";
import { mountTerminal } from "../features/terminal.js";
import { mountPrompt } from "../features/prompt.js";
import { mountKeys } from "../features/keys.js";
import { switchPane } from "./tabs.js";

export function mountAll() {
  qsa("[data-go]").forEach(x => x.onclick = () => switchPane(x.dataset.go));

  $("tunnelName").oninput = () => {
    localStorage.setItem("awtTunnelName", tunnelName());
    if ($("miniTunnel")) $("miniTunnel").textContent = tunnelName() || "No tunnel selected";
  };

  $("refreshBtn").onclick = refresh;
  $("loginBtn").onclick = () => location.href = "/login/?next=" + encodeURIComponent(location.href);
  $("logoutBtn").onclick = () => location.href = "/logout?next=" + encodeURIComponent(location.href);

  $("loadConfigBtn").onclick = async () => show("configOut", await callFs({ action: "configGet" }));
  $("saveConfigBtn").onclick = saveConfig;
  $("openRootBtn").onclick = async () => show("configOut", await callFs({ action: "openRoot" }));
  $("rootsBtn").onclick = async () => show("configOut", await callFs({ action: "roots" }));

  mountRootPicker();
  mountChrome();
  mountExplorer();
  mountTerminal();
  mountPrompt();
  mountKeys();
  refresh();
}

async function saveConfig() {
  const tools = {
    fsList: true,
    fsTree: true,
    fsRead: true,
    fsWrite: !!$("toolFsWrite")?.checked,
    fsBulk: true,
    command: !!$("toolCommand")?.checked,
    chrome: !!$("toolChrome")?.checked
  };

  const got = await callFs({
    action: "configSet",
    root: $("rootPath").value,
    allowWrite: !!$("allowWrite")?.checked,
    allowSecrets: !!$("allowSecrets")?.checked,
    allowCommands: !!$("allowCommands")?.checked,
    tools,
    commandConfig: { enabled: !!$("allowCommands")?.checked }
  });

  show("configOut", got);
}

async function refresh() {
  try {
    const got = await fetch("/api/tunnel/control/my-device", { credentials: "include" }).then(r => r.json());
    show("statusBox", got);
    show("miniStatus", got);
    if (got.tunnelName && !$("tunnelName").value) $("tunnelName").value = got.tunnelName;
    $("miniTunnel").textContent = tunnelName() || got.tunnelName || "No tunnel selected";
    $("miniAgent").textContent = got.ok ? "Connected" : "Not connected";
    $("miniLogin").textContent = got.identity?.userId || got.identity?.email || "Checking";
  } catch (e) {
    show("statusBox", { ok: false, error: e.message });
  }
}
