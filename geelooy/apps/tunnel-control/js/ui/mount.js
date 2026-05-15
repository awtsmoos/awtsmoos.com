
// B"H
import { $, qsa } from "./dom.js";
import { callFs, show, tunnelName } from "./api.js";
import { refreshStatus } from "./status.js";
import { mountRootPicker } from "../features/rootPicker.js";
import { mountChrome } from "../features/chrome.js";
import { mountExplorer } from "../features/explorer.js";
import { mountTerminal } from "../features/terminal.js";
import { mountPrompt } from "../features/prompt.js";
import { switchPane } from "./tabs.js";

export function mountAll() {
  qsa("[data-go]").forEach(x => x.onclick = () => switchPane(x.dataset.go));

  $("tunnelName").oninput = () => {
    localStorage.setItem("awtTunnelName", tunnelName());
    localStorage.setItem("awtsmoos.tunnelName", tunnelName());
    if ($("miniTunnel")) $("miniTunnel").textContent = tunnelName() || "No tunnel selected";
  };

  $("refreshBtn").onclick = () => refreshStatus(tunnelName);
  $("loginBtn").onclick = () => location.href = "/login?next=" + encodeURIComponent(location.href);
  $("logoutBtn").onclick = () => location.href = "/logout?next=" + encodeURIComponent(location.href);

  $("loadConfigBtn").onclick = async () => show("configOut", await callFs({ action: "configGet" }));
  $("saveConfigBtn").onclick = async () => show("configOut", await callFs({
    action: "configSet",
    root: $("rootPath").value
  }));
  $("openRootBtn").onclick = async () => show("configOut", await callFs({
    action: "openRoot",
    absolutePath: $("rootPath").value
  }));
  $("rootsBtn").onclick = async () => show("configOut", await callFs({ action: "roots" }));

  mountRootPicker();
  mountChrome();
  mountExplorer();
  mountTerminal();
  mountPrompt();

  refreshStatus(tunnelName);
  setInterval(() => refreshStatus(tunnelName), 7000);
}
