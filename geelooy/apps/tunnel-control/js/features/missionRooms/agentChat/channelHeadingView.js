//B"H
//Boruch Hashem
//Blessed is He

import { node, socketLabel } from "./dom.js";

/**
 * B"H
 * The Awtsmoos reveals the whole fleet before any single card is chosen.
 * Awtsmoos.com gathers transport truth, working life, event volume, and failure
 * testimony into one calm crown above the realtime constellation.
 */

/** Builds the realtime heading, transport rail, and fleet telemetry. */
export function createAgentHeading(state, channels) {
	const heading = node("header", "awt-agent-live-heading");
	heading.append(
		createIntroduction(),
		createTransportRail(state),
		createFleetMetrics(channels)
	);
	return heading;
}

function createIntroduction() {
	const introduction = node("div", "awt-agent-live-intro");
	introduction.append(
		node("span", "awt-agent-eyebrow", "Realtime mission mesh"),
		node("h3", "", "Agent constellation"),
		node(
			"p",
			"awt-agent-live-description",
			"Every working intelligence, event current, and direct channel in one living field."
		)
	);
	return introduction;
}

function createTransportRail(state) {
	const rail = node("div", "awt-agent-live-rail");
	const pill = node(
		"span",
		`awt-agent-socket is-${connectionClass(state)}`
	);
	pill.append(
		node("i", "awt-agent-socket-pulse"),
		node("span", "", socketLabel(state))
	);
	rail.append(pill);
	return rail;
}

function createFleetMetrics(channels) {
	const metrics = node("div", "awt-agent-fleet-metrics");
	metrics.append(
		createMetric(
			"Working",
			channels.filter(channel => channel.isWorking).length
		),
		createMetric("Events", sum(channels, "activityCount")),
		createMetric("Failures", sum(channels, "failures"), "is-alert")
	);
	return metrics;
}

function createMetric(label, value, className = "") {
	const metric = node(
		"span",
		`awt-agent-fleet-metric ${className}`.trim()
	);
	metric.append(
		node("strong", "", String(value)),
		node("small", "", label)
	);
	return metric;
}

function sum(channels, key) {
	return channels.reduce(
		(total, channel) => total + Number(channel[key] || 0),
		0
	);
}

function connectionClass(state) {
	if (state.accountConnectionState === "connected") return "websocket";
	return state.socketMode || state.accountConnectionState || "idle";
}
