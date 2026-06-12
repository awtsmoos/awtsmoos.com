// B"H

import { button, el } from "./dom.js";
import { baseActions } from "./actions.js";

/**
 * B"H
 * Chapter 399: Quick Actions Became A Bright Rail.
 */
export function mountQuickActions(root) {
  const ids = ["refresh", "open:explorer", "open:terminal", "open:chrome", "mission"];
  const actions = baseActions().filter(action => ids.includes(action.id));
  const nodes = actions.map(action => {
    const node = button(action.label.replace("Open ", ""), ["awt-quick-action"]);
    node.onclick = action.run;
    return node;
  });
  root.append(el("section", { classes: ["awt-quick-actions"], children: nodes }));
}
