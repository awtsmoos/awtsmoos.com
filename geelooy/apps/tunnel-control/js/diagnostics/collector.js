
// B"H

import { h, one } from "../ui/core/html.js";
import { ensureDiagnosticsDrawer } from "./drawer.js";
import { findDiagnosticNodes, diagnosticTitle } from "./diagnosticFinders.js";

/**
 * B"H
 * Collects raw blocks into the drawer.
 *
 * @returns {void}
 */
export function collectDiagnostics() {
  const drawer = ensureDiagnosticsDrawer();
  const body = one(".awt-diagnostics-body", drawer);
  if (!body) return;

  body.textContent = "";

  const nodes = findDiagnosticNodes();

  if (!nodes.length) {
    body.append(h("p", { text: "No diagnostics rendered yet." }));
    return;
  }

  for (const node of nodes) {
    body.append(h("div", {
      classes: ["awt-diagnostic-item"],
      children: [
        h("div", { classes: ["awt-diagnostic-title"], text: diagnosticTitle(node) }),
        h("div", {
          classes: ["awt-diagnostic-content"],
          text: node.textContent || "Ready."
        })
      ]
    }));

    if (!node.closest("[data-pane='explorer']")) {
      node.classList.add("awt-diagnostic-moved");
    }
  }
}
