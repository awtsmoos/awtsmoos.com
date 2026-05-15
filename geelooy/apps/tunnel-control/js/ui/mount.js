
// B"H
import { $, qsa } from "./dom.js";
import { callFs, show, tunnelName } from "./api.js";
import { mountRootPicker } from "../features/rootPicker.js";
import { mountChrome } from "../features/chrome.js";
import { mountExplorer } from "../features/explorer.js";
import { mountTerminal } from "../features/terminal.js";
import { mountPrompt } from "../features/prompt.js";
import { switchPane } from "./tabs.js";

export function mountAll() {
  qsa("[data-go]").forEach(x => x.onclick = () => switchPane(x.dataset.go));
  $("tunnelName").oninput = () => localStorage.setItem("awtTunnelName", tunnelName());
  $("refreshBtn").onclick = refresh;
  $("loginBtn").onclick = () => location.href = "/login?next=" + encodeURIComponent(location.href);
  $("logoutBtn").onclick = () => location.href = "/logout?next=" + encodeURIComponent(location.href);
  $("loadConfigBtn").onclick = async () => show("configOut", await callFs({ action: "configGet" }));
  $("saveConfigBtn").onclick = async () => show("configOut", await callFs({ action: "configSet", content: JSON.stringify({ root: $("rootPath").value }) }));
  $("openRootBtn").onclick = async () => show("configOut", await callFs({ action: "openRoot", absolutePath: $("rootPath").value }));
  $("rootsBtn").onclick = async () => show("configOut", await callFs({ action: "roots" }));
  mountRootPicker();
  mountChrome();
  mountExplorer();
  mountTerminal();
  mountPrompt();
  refresh();
}

async function refresh() {
  try {
    const status = await fetch("/api/tunnel/status").then(r => r.json());
    show("statusBox", status);
    show("miniStatus", status);
    $("miniTunnel").textContent = tunnelName() || "No tunnel selected";
    $("miniAgent").textContent = JSON.stringify(status).includes(tunnelName()) ? "Found" : "Checking";
  } catch (e) {
    show("statusBox", { ok: false, error: e.message });
  }
}
