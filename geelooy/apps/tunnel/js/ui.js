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
 *
 * @returns {void}
 */
export function mountStatus() {
  const box = document.getElementById("statusBox");
  const button = document.getElementById("refreshStatus");
  if (!box || !button) return;

  const refresh = async () => {
    box.textContent = "Checking tunnel server...";
    try {
      box.textContent = formatStatus(await fetchTunnelStatus());
    } catch (e) {
      box.textContent = e.stack || e.message;
    }
  };

  button.addEventListener("click", refresh);
  refresh();
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
