// B"H

import { shouldWrap, textOf } from "./panelDetection.js";
import { readCollapsed } from "./panelStorage.js";
import { makeCollapseButton, makeFocusButton, makeToolbarTitle } from "./panelToolbar.js";

/**
 * B"H
 * Chapter 385: The Panel Shell Became A Small Mishkan.
 */
export function makePanelShell(el, index) {
  if (!shouldWrap(el)) return;

  const id = el.id || el.dataset.pane || "panel-" + index;
  const title = textOf(el, id);
  const collapsed = readCollapsed(id);

  el.dataset.awtPanelReady = "yes";
  el.classList.add("awt-section-shell");
  el.dataset.collapsed = collapsed ? "true" : "false";

  const body = document.createElement("div");
  body.className = "awt-section-body";
  while (el.firstChild) body.appendChild(el.firstChild);

  const toolbar = document.createElement("div");
  toolbar.className = "awt-section-toolbar";

  const actions = document.createElement("div");
  actions.className = "awt-section-actions";
  actions.append(makeFocusButton(el), makeCollapseButton(el, id, collapsed));

  toolbar.append(makeToolbarTitle(title), actions);
  el.append(toolbar, body);
}
