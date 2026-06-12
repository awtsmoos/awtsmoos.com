// B"H

import { makeFloatingMap } from "./floatingMap.js";
import { addKeyboardShortcuts } from "./keyboardShortcuts.js";
import { makePanelShell } from "./panelShell.js";

/**
 * B"H
 * Chapter 388: Control Panels Became A Choir Of Smaller Vessels.
 */
export function mountControlPanels() {
  const candidates = [
    ...document.querySelectorAll("[data-pane]"),
    ...document.querySelectorAll(".control-section"),
    ...document.querySelectorAll(".dashboard-section"),
    ...document.querySelectorAll(".panel-section")
  ];

  candidates.forEach(makePanelShell);
  makeFloatingMap();
  addKeyboardShortcuts();
}
