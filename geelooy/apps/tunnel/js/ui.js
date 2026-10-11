// B"H

import { buildGptText, copyElementText } from "./commands.js";
import { fetchTunnelStatus, formatStatus } from "./status.js";

/**
 * B"H
 * Chapter 97: The Tunnel Console Bowed To The Vessel Actually Present.
 *
 * The Awtsmoos reveals the current DOM, not a remembered panel from an older
 * build. Optional controls are therefore mounted only when their elements are
 * present. This is the tunnel app itself, so guarding its console is within the
 * approved vessel.
 */

/**
 * Wires tab buttons to command panels.
 *
 * @returns {void}
 */
export function mountTabs() {
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panes = [...document.querySelectorAll("[data-pane]")];

  for (const tab of tabs) {
    tab.addEventListener("click", () => activateTab(tab, tabs, panes));
  }
}

/**
 * Wires all copy buttons with existing targets.
 *
 * @returns {void}
 */
export function mountCopyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;
      await copyElementText(target);
      flashButton(button, "Copied", 900);
    });
  }
}

/**
 * Keeps the legacy Custom GPT setup text synced when that panel exists.
 *
 * @returns {void}
 */
export function mountGptText() {
  const tunnelName = document.getElementById("tunnelName");
  const projectPath = document.getElementById("projectPath");
  const output = document.getElementById("gptText");
  if (!tunnelName || !projectPath || !output) return;

  const render = () => {
    output.textContent = buildGptText(tunnelName.value, projectPath.value);
  };

  tunnelName.addEventListener("input", render);
  projectPath.addEventListener("input", render);
  render();
}

/**
 * Mounts status refresh behavior when the status panel exists.
 * Also drives the topbar connection pill and the footer status line.
 *
 * @returns {void}
 */
export function mountStatus() {
  const box = document.getElementById("statusBox");
  const button = document.getElementById("refreshStatus");
  if (!box || !button) return;

  const setConn = (ok, detail) => {
    const dot = document.getElementById("connDot");
    const text = document.getElementById("connText");
    const footDot = document.getElementById("footDot");
    const footConn = document.getElementById("footConn");
    const footDetail = document.getElementById("footDetail");
    if (dot) { dot.classList.toggle("on", ok); dot.classList.toggle("off", !ok); }
    if (text) text.textContent = ok ? "Server reachable" : "Server unreachable";
    if (footDot) { footDot.classList.toggle("on", ok); footDot.classList.toggle("off", !ok); }
    if (footConn) footConn.textContent = ok ? "Connected" : "Offline";
    if (footDetail && detail) footDetail.textContent = detail;
  };

  const refresh = async () => {
    box.textContent = "Checking tunnel server...";
    try {
      const status = formatStatus(await fetchTunnelStatus());
      box.textContent = status;
      const firstLine = String(status).split("\n")[0] || "";
      setConn(true, firstLine.slice(0, 90));
    } catch (e) {
      box.textContent = e.stack || e.message;
      setConn(false);
    }
  };

  button.addEventListener("click", refresh);
  refresh();
}

/**
 * Mounts the mission board preview: open missions across every project,
 * fetched through the tunnel relay when a tunnel name is known.
 *
 * @returns {void}
 */
export function mountMissions() {
  const preview = document.getElementById("missionPreview");
  const button = document.getElementById("refreshMissions");
  if (!preview) return;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const renderRows = (missions) => {
    if (!missions || !missions.length) {
      preview.innerHTML = '<div class="mission-row"><span class="t">No open missions right now.</span><span class="pill idle">open</span></div>';
      return;
    }
    preview.innerHTML = missions.slice(0, 5).map((m) => (
      '<div class="mission-row"><span class="t">' + esc(m.title || m.missionId) + '</span>' +
      '<span class="pill ' + (m.status === "open" ? "idle" : "good") + '">' + esc(m.status || "open") + "</span></div>"
    )).join("");
  };

  const load = async () => {
    preview.innerHTML = '<div class="mission-row"><span class="t">Loading missions…</span></div>';
    const name = (localStorage.getItem("awtsmoos.tunnelName") || "").trim();
    if (!name) {
      preview.innerHTML = '<div class="mission-row"><span class="t">Name your tunnel on the mission board page to preview missions here.</span></div>';
      return;
    }
    try {
      const res = await fetch("/api/tunnel/control/fs/" + encodeURIComponent(name), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "missionMarketplaceList" })
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || ("http_" + res.status));
      renderRows(data.result || data.missions || []);
    } catch (e) {
      preview.innerHTML = '<div class="mission-row"><span class="t">Could not reach the mission board (' + esc(e.message) + ").</span></div>";
    }
  };

  if (button) button.addEventListener("click", load);
  load();
}

/**
 * @param {HTMLElement} tab
 * @param {HTMLElement[]} tabs
 * @param {HTMLElement[]} panes
 * @returns {void}
 */
function activateTab(tab, tabs, panes) {
  const id = tab.dataset.tab;
  for (const one of tabs) one.classList.toggle("active", one === tab);
  for (const pane of panes) pane.classList.toggle("active", pane.dataset.pane === id);
}

/**
 * @param {HTMLElement} button
 * @param {string} text
 * @param {number} ms
 * @returns {void}
 */
function flashButton(button, text, ms) {
  const old = button.textContent;
  button.textContent = text;
  setTimeout(() => button.textContent = old, ms);
}
