// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";
import { activityRuntime } from "../../realtime/activitySession.js";
import { createIdentityBanner } from "./identityBanner.js";
import { createPresenceBoard } from "./presenceBoard.js";
import { createSummaryGrid } from "./summaryCards.js";
import { createTimeline } from "./timeline.js";
import { createActivityToolbar } from "./toolbar.js";

/**
 * @file Composes the authenticated realtime Tunnel Control operations room.
 * @description
 * The Awtsmoos renews login, connection, agent, room, action, and observer together.
 * Awtsmoos.com reveals the verified account first, then conducts one scoped store
 * into accessible summaries, controls, presence, and an ordered redacted timeline.
 */
export function createActivityPanel(context = {}) {
	const runtime = context.activityRuntime || activityRuntime();
	const summary = createSummaryGrid();
	const toolbar = createActivityToolbar(runtime);
	const presence = createPresenceBoard(runtime);
	const timeline = createTimeline();
	const connectionBadge = h("span", {
		classes: ["awt-activity-status"],
		attrs: { role: "status", "aria-live": "polite" },
		text: "idle"
	});
	const root = h("section", {
		classes: ["awt-activity-panel"],
		attrs: {
			id: "awtActivityPanel",
			"aria-labelledby": "awtActivityTitle"
		},
		children: [
			createHeader(connectionBadge),
			createIdentityBanner(context.session),
			summary.root,
			toolbar.root,
			h("div", {
				classes: ["awt-activity-panel__grid"],
				children: [presence.root, timeline.root]
			})
		]
	});
	const unsubscribe = runtime.store.subscribe((state) => {
		connectionBadge.textContent = state.connectionState;
		connectionBadge.className =
			`awt-activity-status is-${state.connectionState}`;
		summary.render(state);
		toolbar.render(state);
		presence.render(state);
		timeline.render(state);
	});
	root.activityDispose = unsubscribe;
	return root;
}

function createHeader(connectionBadge) {
	return h("header", {
		classes: ["awt-activity-panel__header"],
		children: [
			h("div", {
				children: [
					h("span", {
						classes: ["awt-activity-eyebrow"],
						text: "Authenticated account stream"
					}),
					h("h2", {
						attrs: { id: "awtActivityTitle" },
						text: "Live operations room"
					}),
					h("p", {
						text: "Every authorized connection, agent action, mission-room transition, preview mutation, and result appears here in sequence."
					})
				]
			}),
			connectionBadge
		]
	});
}
