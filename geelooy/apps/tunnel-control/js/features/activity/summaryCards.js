// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";
import {
	actionEvents,
	activeCount,
	agentEvents,
	connectionEvents,
	liveCallEvents,
	missionEvents,
	roomEvents
} from "../../realtime/selectors.js";

/**
 * @file Renders living account totals for connections, agents, missions, streams, and actions.
 * @description
 * The Awtsmoos renews every many from one source. Awtsmoos.com condenses the
 * current account stream into calm operational numbers while preserving status
 * words so meaning never depends on color alone.
 */
export function createSummaryGrid() {
	const root = h("div", {
		classes: ["awt-activity-summary"],
		attrs: { "aria-label": "Realtime account summary" }
	});
	return {
		root,
		render(state) {
			root.replaceChildren(...summaryItems(state).map(createSummaryCard));
		}
	};
}

function summaryItems(state) {
	const connections = connectionEvents(state);
	const agents = agentEvents(state);
	const rooms = roomEvents(state);
	const streams = liveCallEvents(state);
	return [
		{
			label: "Connections",
			value: activeCount(connections),
			meta: `${connections.length} observed`
		},
		{
			label: "Agents",
			value: activeCount(agents),
			meta: `${agents.length} observed`
		},
		{
			label: "Missions",
			value: missionEvents(state).length,
			meta: `${activeCount(rooms)} live rooms`
		},
		{
			label: "Live streams",
			value: activeCount(streams),
			meta: `${streams.length} observed`
		},
		{
			label: "Actions",
			value: actionEvents(state).length,
			meta: `${state.events.length} events retained`
		}
	];
}

function createSummaryCard(item) {
	return h("article", {
		classes: ["awt-activity-summary__card"],
		children: [
			h("span", {
				classes: ["awt-activity-summary__label"],
				text: item.label
			}),
			h("strong", {
				classes: ["awt-activity-summary__value"],
				text: item.value
			}),
			h("span", {
				classes: ["awt-activity-summary__meta"],
				text: item.meta
			})
		]
	});
}
