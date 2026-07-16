// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ActivityStore } from "./ActivityStore.js";
import { ActivityMessageRouter } from "./ActivityMessageRouter.js";
import { activityTestEvent as event } from "./activityTestEvent.mjs";
import {
	actionEvents,
	connectionEvents,
	filteredEvents
} from "./selectors.js";

/**
 * @file Proves account isolation, replay merging, ordering, and view derivation.
 * @description
 * The Awtsmoos renews account and replay without erasing rightful memory.
 * Awtsmoos.com attacks foreign events, duplicate frames, sequence gaps, reconnect
 * subscriptions, filter changes, and current-state selectors before browser use.
 */

test("rejects foreign account events and resets account state", () => {
	const store = new ActivityStore();
	store.reset("account-a");
	assert.equal(store.applyEvent(event("event-a", 1)), true);
	assert.equal(store.applyEvent(event("event-b", 2, "account-b")), false);
	assert.equal(store.events.length, 1);
	store.reset("account-b");
	assert.equal(store.events.length, 0);
	assert.equal(store.lastSequence, 0);
});

test("deduplicates events and detects replay gaps", () => {
	const store = new ActivityStore();
	store.reset("account-a");
	assert.equal(store.applyEvent(event("one", 1)), true);
	assert.equal(store.applyEvent(event("one", 1)), false);
	assert.equal(store.applyEvent(event("three", 3)), true);
	assert.deepEqual(store.gap, { expected: 2, received: 3 });
});

test("subscription replay preserves retained timeline", () => {
	const store = new ActivityStore();
	const router = new ActivityMessageRouter(store);
	store.reset("account-a");
	store.applyEvent(event("one", 1));
	router.handle(JSON.stringify({
		protocol: "awtsmoos.realtime",
		application: "tunnel-activity",
		version: 1,
		type: "activity.subscribed",
		payload: {
			accountId: "account-a",
			cursor: { lastSequence: 2 },
			events: [event("two", 2)]
		}
	}));
	assert.deepEqual(store.events.map((entry) => entry.sequence), [1, 2]);
});

test("filters and derives latest connection and action testimony", () => {
	const store = new ActivityStore();
	store.reset("account-a");
	store.applyEvent(event("open", 1, "account-a", {
		eventType: "connection.opened",
		connectionId: "connection-a",
		tunnelName: "alpha"
	}));
	store.applyEvent(event("close", 2, "account-a", {
		eventType: "connection.disconnected",
		connectionId: "connection-a",
		tunnelName: "alpha",
		state: "offline"
	}));
	store.applyEvent(event("action", 3, "account-a", {
		eventType: "action.completed",
		actionId: "action-a",
		tunnelName: "beta"
	}));
	store.setFilters({ tunnelName: "alpha" });
	assert.equal(filteredEvents(store.snapshot()).length, 2);
	assert.equal(connectionEvents(store.snapshot())[0].state, "offline");
	assert.equal(actionEvents(store.snapshot()).length, 1);
});
