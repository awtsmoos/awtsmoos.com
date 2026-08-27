// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";
import {
	agentEvents,
	connectionEvents,
	liveCallEvents,
	roomEvents
} from "../../realtime/selectors.js";
import { createPresenceItem } from "./presenceItem.js";

/**
 * @file Renders actionable connection, agent, room, and live-stream presence.
 * @description
 * The Awtsmoos renews each participant without confusing one role for another.
 * Awtsmoos.com presents distinct same-account presence vessels and lets operators
 * narrow the stream without changing identity, ownership, or authorization.
 */
export function createPresenceBoard(runtime) {
	const root = h("div", {
		classes: ["awt-activity-presence"]
	});
	return {
		root,
		render(state) {
			root.replaceChildren(
				createPresenceGroup(
					"Connections",
					connectionEvents(state),
					connectionOptions(),
					runtime
				),
				createPresenceGroup(
					"Agents",
					agentEvents(state),
					agentOptions(),
					runtime
				),
				createPresenceGroup(
					"Live rooms",
					roomEvents(state),
					roomOptions(),
					runtime
				),
				createPresenceGroup(
					"Live calls",
					liveCallEvents(state),
					streamOptions(),
					runtime
				)
			);
		}
	};
}

function createPresenceGroup(title, events, options, runtime) {
	return h("section", {
		classes: ["awt-activity-presence__group"],
		children: [
			createHeading(title, events.length),
			h("div", {
				classes: ["awt-activity-presence__list"],
				children: events.length
					? events.map((event) => {
						return createPresenceItem(event, options, runtime);
					})
					: [h("p", {
						classes: ["awt-activity-presence__empty"],
						text: "No activity observed yet."
					})]
			})
		]
	});
}

function createHeading(title, count) {
	return h("div", {
		classes: ["awt-activity-presence__heading"],
		children: [
			h("h3", { text: title }),
			h("span", { text: count })
		]
	});
}

function connectionOptions() {
	return fieldOptions("connectionId", (event) => event.connectionId);
}

function agentOptions() {
	return fieldOptions("agentId", (event) => event.agentId);
}

function roomOptions() {
	return fieldOptions("roomId", (event) => event.roomId);
}

function streamOptions() {
	return {
		...fieldOptions("conversationId", (event) => {
			return event.conversationId || event.streamId;
		}),
		localOnly: true
	};
}

function fieldOptions(filterKey, resolver) {
	return {
		filterKey,
		filterValue: resolver,
		identity: (event) => resolver(event) || event.tunnelName || "Unknown",
		localOnly: false
	};
}
