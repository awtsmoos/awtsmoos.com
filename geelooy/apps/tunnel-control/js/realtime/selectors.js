// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives live connections, agents, rooms, streams, actions, and timelines.
 * @description
 * The Awtsmoos renews every event while Awtsmoos.com gathers finite traces into
 * present-tense operational views. Derivation stays pure, account-scoped, and unable
 * to invent authority or mutate the ordered events received from the server.
 */

export function filteredEvents(state) {
	return state.events.filter((event) => {
		return Object.entries(state.filters || {}).every(([key, value]) => {
			return !value || filterValue(event, key) === value;
		});
	});
}

export function latestBy(events, key, predicate = () => true) {
	return latestByValue(
		events,
		(event) => event[key],
		predicate
	);
}

export function latestByValue(events, resolver, predicate = () => true) {
	const latest = new Map();
	for (const event of events) {
		const identity = resolver(event);
		if (!identity || !predicate(event)) {
			continue;
		}
		latest.set(identity, event);
	}
	return [...latest.values()].sort((left, right) => {
		return Date.parse(right.timestamp) - Date.parse(left.timestamp);
	});
}

export function connectionEvents(state) {
	return latestBy(state.events, "connectionId", (event) => {
		return event.eventType.startsWith("connection.");
	});
}

export function agentEvents(state) {
	return latestBy(state.events, "agentId");
}

export function missionEvents(state) {
	return latestBy(state.events, "missionId");
}

export function roomEvents(state) {
	return latestBy(state.events, "roomId", (event) => {
		return event.eventType.startsWith("room.");
	});
}

export function liveCallEvents(state) {
	return latestByValue(
		state.events,
		(event) => event.detail?.streamId,
		(event) => event.eventType.startsWith("live_call.stream_")
	).map((event) => ({
		...event,
		streamId: event.detail?.streamId || "",
		conversationId: event.detail?.conversationId || ""
	}));
}

export function actionEvents(state) {
	return latestBy(state.events, "actionId", (event) => {
		return event.eventType.startsWith("action.");
	});
}

export function activeCount(events, offlineStates = [
	"offline",
	"left",
	"replaced",
	"closed"
]) {
	return events.filter((event) => {
		return !offlineStates.includes(String(event.state || "").toLowerCase());
	}).length;
}

export function eventKinds(events) {
	return [...new Set(events.map((event) => event.eventType).filter(Boolean))]
		.sort();
}

function filterValue(event, key) {
	return event[key] ?? event.detail?.[key] ?? "";
}
