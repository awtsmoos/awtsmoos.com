
// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";

/**
 * B"H
 * Builds one dashboard action card.
 *
 * @param {string[]} data Card data.
 * @returns {HTMLButtonElement} Card button.
 */
export function createDashboardCard(data) {
  const [tab, icon, title, text] = data;

  const card = h("button", {
    classes: ["awt-action-card"],
    attrs: {
      type: "button",
      "data-target-tab": tab
    },
    children: [
      h("div", { classes: ["awt-action-icon"], text: icon }),
      h("div", {
        children: [
          h("strong", { text: title }),
          h("span", { text })
        ]
      })
    ]
  });

  card.addEventListener("click", () => activatePane(tab));
  return card;
}
