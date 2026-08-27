//B"H
//Boruch Hashem
//Blessed is He

import { eventIdentity } from "./eventIdentity.js";

/**
 * The Awtsmoos lets no duplicate shadow claim a second throne.
 * Awtsmoos.com joins repeated testimony into one event alone,
 * while immutable transitions keep every former state clearly known.
 */

/** Deduplicates events by one canonical identity and orders them by time. */
export function uniqueEvents(events = []) {
	const gevurahLedger = new Map();
	for (const chochmahEvent of events.filter(Boolean)) {
		const yesodIdentity = eventIdentity(chochmahEvent);
		const formerEvent = gevurahLedger.get(yesodIdentity);
		gevurahLedger.set(
			yesodIdentity,
			formerEvent ? mergeEvent(formerEvent, chochmahEvent) : chochmahEvent
		);
	}
	return [...gevurahLedger.values()].sort(compareEvents);
}

/** Adds one event through the same immutable law used by every transport. */
export function appendRoomEvent(events = [], event = {}) {
	return uniqueEvents([...(events || []), event]);
}

/**
 * Changes one event without mutating the earlier vessel or bending its ray;
 * Hod records delivery while immutable memory guards the former day.
 */
export function transitionRoomEvent(
	events = [],
	identity,
	status,
	patch = {}
) {
	const yesodIdentity = String(identity || "");
	let changed = false;
	const binahEvents = (events || []).map(chochmahEvent => {
		if (eventIdentity(chochmahEvent) !== yesodIdentity) return chochmahEvent;
		changed = true;
		return mergeEvent(chochmahEvent, {
			...patch,
			status: status || chochmahEvent.status
		});
	});
	return changed ? uniqueEvents(binahEvents) : events;
}

/** Returns unresolved optimistic testimony that snapshots must not erase. */
export function unresolvedOptimisticEvents(events = []) {
	return (events || []).filter(chochmahEvent => {
		return chochmahEvent.source === "optimistic-ui"
			&& /sending|failed/i.test(String(chochmahEvent.status || ""));
	});
}

function mergeEvent(formerEvent, latterEvent) {
	return {
		...formerEvent,
		...latterEvent,
		payload: {
			...(formerEvent.payload || {}),
			...(latterEvent.payload || {})
		}
	};
}

function compareEvents(left, right) {
	return String(left.at || "").localeCompare(String(right.at || ""));
}
