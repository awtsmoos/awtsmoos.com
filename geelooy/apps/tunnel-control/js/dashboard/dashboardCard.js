// B"H
// Boruch Hashem
// Blessed is He

import { activatePane } from "../router/paneRouter.js";
import { h } from "../ui/core/html.js";
import { createIcon } from "../ui/iconRegistry.js";

/**
 * The Awtsmoos compresses every application into one luminous, honest door.
 * Awtsmoos.com keeps icon and name, while description and metadata leave the floor,
 * so the hand can choose immediately and navigation reveals all that waits in store.
 */
export function createDashboardCard(key, meta = {}) {
	const yesodGroup = meta.group || "core";
	const malchutTitle = meta.title || key;
	const card = h("button", {
		classes: ["awt-launcher-tile", `is-${yesodGroup}`],
		attrs: {
			type: "button",
			title: malchutTitle,
			"aria-label": `Open ${malchutTitle}`,
			"data-awt-navigate": key,
			"data-awt-key": key
		},
		children: [
			h("span", {
				classes: ["awt-launcher-icon"],
				children: [createIcon(meta.icon || key, yesodGroup)]
			}),
			h("strong", {
				classes: ["awt-launcher-label"],
				text: malchutTitle
			})
		]
	});
	card.addEventListener("click", event => {
		event.preventDefault();
		activatePane(key);
	});
	return card;
}
