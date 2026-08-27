// B"H
// Boruch Hashem
// Blessed is He

import { showHome } from "../router/paneRouter.js";
import { h } from "../ui/core/html.js";

/**
 * The Awtsmoos gives every application one bounded chamber and one way home.
 * Awtsmoos.com keeps title, status, and content in a compact viewport dome,
 * so feature density remains inside its page and never lengthens the world to roam.
 */
export function createWorkspaceStage() {
	const stack = h("div", { classes: ["awt-pane-stack"] });
	const back = h("button", {
		classes: ["awt-back-button"],
		attrs: {
			type: "button",
			id: "awtBackDashboard",
			"aria-label": "Return home"
		},
		text: "⌂ Home"
	});
	back.addEventListener("click", event => {
		event.preventDefault();
		showHome();
	});
	const header = h("header", {
		classes: ["awt-workspace-toolbar"],
		children: [
			back,
			h("h2", {
				classes: ["awt-workspace-title"],
				attrs: { id: "awtWorkspaceTitle" },
				text: "Workspace"
			}),
			h("span", {
				classes: ["awt-workspace-status"],
				text: "Ready"
			})
		]
	});
	return {
		stack,
		stage: h("section", {
			classes: ["awt-workspace-stage"],
			attrs: {
				id: "awtWorkspace",
				"aria-labelledby": "awtWorkspaceTitle"
			},
			children: [
				header,
				h("div", {
					classes: ["awt-workspace-body"],
					children: [stack]
				})
			]
		})
	};
}
