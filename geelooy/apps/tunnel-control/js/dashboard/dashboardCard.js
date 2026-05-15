
// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";

/**
 * B"H
 * Builds one dashboard card.
 *
 * @param {string} key Pane key.
 * @param {object} meta Pane metadata.
 * @returns {HTMLButtonElement} Card.
 */
export function createDashboardCard(key, meta) {
  const card = h("button", {
    classes: ["awt-action-card"],
    attrs: {
      type: "button",
      "data-awt-navigate": key
    },
    children: [
      h("div", { classes: ["awt-action-icon"], text: meta.icon || "✦" }),
      h("div", {
        classes: ["awt-action-copy"],
        children: [
          h("strong", { text: meta.title || key }),
          h("span", { text: meta.desc || "Open this workspace." })
        ]
      })
    ]
  });

  card.addEventListener("click", event => {
    event.preventDefault();
    activatePane(key);
  });

  return card;
}
