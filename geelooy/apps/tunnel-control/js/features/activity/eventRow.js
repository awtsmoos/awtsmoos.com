// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";

/**
 * @file Renders one bounded realtime activity event as an accessible timeline row.
 * @description
 * The Awtsmoos renews actor, action, and instant, while Awtsmoos.com gives their
 * finite testimony human scale: status, identity, time, summary, and expandable
 * redacted detail without exposing hidden credentials or raw filesystem content.
 */
export function createEventRow(event) {
	const details = h("details", {
		classes: ["awt-activity-event__details"],
		children: [
			h("summary", { text: detailLabel(event) }),
			h("pre", {
				classes: ["awt-activity-event__payload"],
				text: JSON.stringify(event.detail || {}, null, 2)
			})
		]
	});
	return h("article", {
		classes: [
			"awt-activity-event",
			`is-${safeClass(event.severity)}`,
			`is-${safeClass(event.state)}`
		],
		attrs: {
			"data-event-type": event.eventType,
			"data-sequence": event.sequence
		},
		children: [
			h("div", {
				classes: ["awt-activity-event__rail"],
				attrs: { "aria-hidden": "true" }
			}),
			h("div", {
				classes: ["awt-activity-event__body"],
				children: [
					h("div", {
						classes: ["awt-activity-event__meta"],
						children: [
							h("span", {
								classes: ["awt-activity-event__type"],
								text: event.eventType
							}),
							h("time", {
								attrs: { datetime: event.timestamp },
								text: formatTime(event.timestamp)
							})
						]
					}),
					h("h4", {
						classes: ["awt-activity-event__summary"],
						text: event.summary || event.eventType
					}),
					h("p", {
						classes: ["awt-activity-event__identity"],
						text: identityLine(event)
					}),
					details
				]
			})
		]
	});
}

function identityLine(event) {
	return [
		event.tunnelName && `Tunnel ${event.tunnelName}`,
		event.agentId && `Agent ${event.agentId}`,
		event.missionId && `Mission ${event.missionId}`,
		event.roomId && `Room ${event.roomId}`,
		event.actionId && `Action ${event.actionId}`
	].filter(Boolean).join(" · ") || "Account activity";
}

function detailLabel(event) {
	return event.truncated ? "Redacted details · bounded" : "Redacted details";
}

function formatTime(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "Unknown time"
		: date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		});
}

function safeClass(value) {
	return String(value || "unknown")
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-");
}
