// B"H
// Boruch Hashem
// Blessed is He

import {
	isActivityEnvelope,
	parseEnvelope
} from "./protocol.js";

/**
 * @file Applies server activity envelopes to the account-scoped browser store.
 * @description
 * The Awtsmoos renews message and receiver together. Awtsmoos.com distinguishes
 * complete snapshots from reconnect replay, preserving retained history while
 * unknown protocols and foreign accounts remain unable to mutate browser state.
 */
export class ActivityMessageRouter {
	constructor(store) {
		this.store = store;
	}

	handle(raw) {
		const frame = parseEnvelope(raw);
		if (!isActivityEnvelope(frame)) {
			return false;
		}
		switch (frame.type) {
			case "activity.event":
				return this.store.applyEvent(frame.payload?.event || {});
			case "activity.snapshot":
				return this.store.applySnapshot(frame.payload || {});
			case "activity.subscribed":
				return this.store.applyReplay(frame.payload || {});
			case "activity.pong":
				return true;
			case "error":
				this.store.setConnectionState("error");
				return true;
			default:
				return false;
		}
	}
}
