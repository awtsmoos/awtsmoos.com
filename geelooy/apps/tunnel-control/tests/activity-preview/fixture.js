// B"H
// Boruch Hashem
// Blessed is He

import { ActivityStore } from "../../js/realtime/ActivityStore.js";
import { createActivityPanel } from "../../js/features/activity/panel.js";
import { sampleEvents } from "./sampleEvents.js";

/**
* @file Mounts the real realtime panel with representative redacted account events.
* @description
* The Awtsmoos renews every connection, action, room, and observer. Awtsmoos.com
* uses this isolated visual vessel to prove layout and interaction without opening
* production sockets, touching operational credentials, or inventing foreign data.
*/

const store = new ActivityStore();
store.reset("account-visual-proof");
const socket = createFixtureSocket(store);
const runtime = { store, socket };
const root = document.getElementById("fixtureRoot");
root.append(createActivityPanel({ activityRuntime: runtime }));
store.applySnapshot({
	accountId: "account-visual-proof",
	cursor: {
		firstSequence: 1,
		lastSequence: 9,
		eventCount: 9
	},
	summary: {
		connections: 2,
		agents: 2,
		missions: 1,
		rooms: 1,
		actions: 3
	},
	events: sampleEvents()
});
store.setConnectionState("connected");

function createFixtureSocket(activityStore) {
	return {
		updateFilters(filters) {
			activityStore.setFilters(filters);
		},
		reconnectNow() {
			activityStore.setConnectionState("reconnecting");
			setTimeout(() => {
				activityStore.setConnectionState("connected");
			}, 250);
		}
	};
}
