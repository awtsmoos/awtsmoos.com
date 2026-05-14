
// B"H

import { buildGptText, copyElementText } from "./commands.js";
import { fetchTunnelStatus, formatStatus } from "./status.js";

/**
 * B"H
 * Wires tab buttons to command panels.
 *
 * @returns {void}
 */
export function mountTabs() {
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panes = [...document.querySelectorAll("[data-pane]")];

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;

      for (const one of tabs) {
        one.classList.toggle("active", one === tab);
      }

      for (const pane of panes) {
        pane.classList.toggle("active", pane.dataset.pane === id);
      }
    });
  }
}

/**
 * B"H
 * Wires all copy buttons.
 *
 * @returns {void}
 */
export function mountCopyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      await copyElementText(target);
      const old = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => button.textContent = old, 900);
    });
  }
}

/**
 * B"H
 * Keeps the Custom GPT setup text synced with inputs.
 *
 * @returns {void}
 */
export function mountGptText() {
  const tunnelName = document.getElementById("tunnelName");
  const projectPath = document.getElementById("projectPath");
  const output = document.getElementById("gptText");

  const render = () => {
    output.textContent = buildGptText(tunnelName.value, projectPath.value);
  };

  tunnelName.addEventListener("input", render);
  projectPath.addEventListener("input", render);
  render();
}

/**
 * B"H
 * Mounts status refresh behavior.
 *
 * @returns {void}
 */
export function mountStatus() {
  const box = document.getElementById("statusBox");
  const button = document.getElementById("refreshStatus");

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
