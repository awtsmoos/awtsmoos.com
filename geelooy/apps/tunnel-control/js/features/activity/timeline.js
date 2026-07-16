// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";
import {
	filteredEvents
} from "../../realtime/selectors.js";
import { createEventRow } from "./eventRow.js";

/**
 * @file Renders the ordered filtered account activity timeline.
 * @description
 * The Awtsmoos renews every instant without disorder. Awtsmoos.com presents the
 * newest bounded events in sequence, announces replay gaps, and pauses rendering
 * without pausing ingestion so operators can inspect while reality continues.
 */
export function createTimeline() {
	const status = h("p", {
		classes: ["awt-activity-timeline__status"],
		attrs: { role: "status", "aria-live": "polite" }
	});
	const list = h("div", {
		classes: ["awt-activity-timeline__list"],
		attrs: { role: "feed", "aria-busy": "false" }
	});
	const root = h("section", {
		classes: ["awt-activity-timeline"],
		attrs: { "aria-labelledby": "awtActivityTimelineTitle" },
		children: [
			h("div", {
				classes: ["awt-activity-timeline__header"],
				children: [
					h("div", {
						children: [
							h("span", {
								classes: ["awt-activity-eyebrow"],
								text: "Account event stream"
							}),
							h("h3", {
								attrs: { id: "awtActivityTimelineTitle" },
								text: "Live action timeline"
							})
						]
					}),
					status
				]
			}),
			list
		]
	});
	return {
		root,
		render(state) {
			status.textContent = statusText(state);
			if (state.paused) {
				return;
			}
			const events = filteredEvents(state).slice(-200).reverse();
			list.replaceChildren(...renderEvents(events, state));
		}
	};
}

function renderEvents(events, state) {
	const rows = [];
	if (state.gap) {
		rows.push(h("p", {
			classes: ["awt-activity-timeline__gap"],
			attrs: { role: "alert" },
			text: `Replay gap detected: expected ${state.gap.expected}, received ${state.gap.received}. Reconnect to refresh.`
		}));
	}
	if (!events.length) {
		rows.push(h("p", {
			classes: ["awt-activity-timeline__empty"],
			text: "Waiting for the first authorized connection or action event."
		}));
		return rows;
	}
	return rows.concat(events.map(createEventRow));
}

function statusText(state) {
	const paused = state.paused ? " · rendering paused" : "";
	return `${state.connectionState} · sequence ${state.lastSequence}${paused}`;
}
