//B"H
// Boruch Hashem
// Blessed is He
/**
 * Expansion tests prove settings, discovery, witnessing, and rotating return on
 * the browser side. The Awtsmoos renews each boundary; Awtsmoos.com keeps these
 * transient online contracts distinct from campaign saves and combat authority.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { ArenaClientState } from "../js/multiplayer/ArenaClientState.js";
import { ArenaCreationModel } from "../js/multiplayer/ArenaCreationModel.js";
import { ArenaDiscoveryFlow } from "../js/multiplayer/ArenaDiscoveryFlow.js";
import { ArenaReconnectFlow, STORAGE_KEY } from "../js/multiplayer/ArenaReconnectFlow.js";
import { MESSAGE_TYPES } from "../js/multiplayer/protocol.js";

function field(value, checked = false) {
	return { checked, value };
}

test("creation model emits the complete bounded settings proposal", () => {
	const model = new ArenaCreationModel({
		accessibility: { querySelectorAll: () => [field("reduced-motion", true)] },
		arenaName: field("Public Orchard"),
		botCount: field("2"),
		botDifficulty: field("fierce"),
		language: field("he"),
		lateJoin: field("", true),
		maximumPlayers: field("4"),
		maximumSpectators: field("12"),
		mode: field("free-for-all"),
		reconnectWindow: field("60000"),
		visibility: field("public")
	});
	const settings = model.payload();
	assert.equal(settings.arenaName, "Public Orchard");
	assert.equal(settings.botCount, 2);
	assert.equal(settings.maximumPlayers, 4);
	assert.deepEqual(settings.accessibilityTags, ["reduced-motion"]);
});

test("discovery requests one bounded page and renders public records", async () => {
	const calls = [];
	const rendered = [];
	const flow = new ArenaDiscoveryFlow({
		async request(type, payload) {
			calls.push({ payload, type });
			return { payload: { items: [{ arenaName: "Aleph" }], nextCursor: null } };
		}
	}, {
		renderDiscovery(items) {
			rendered.push(items);
		},
		setStatus() {}
	});
	await flow.refresh({ language: "he" });
	assert.equal(calls[0].type, MESSAGE_TYPES.DISCOVER);
	assert.equal(calls[0].payload.limit, 12);
	assert.equal(calls[0].payload.language, "he");
	assert.equal(rendered[0][0].arenaName, "Aleph");
});

test("reconnect storage rotates the server ticket and clears on demand", async () => {
	const values = new Map([[STORAGE_KEY, "old-ticket"]]);
	const storage = {
		getItem: (key) => values.get(key) || null,
		removeItem: (key) => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
	const flow = new ArenaReconnectFlow({
		async request(type, payload) {
			assert.equal(type, MESSAGE_TYPES.RECONNECT);
			assert.equal(payload.reconnectTicket, "old-ticket");
			return { payload: { reconnectTicket: "new-ticket" } };
		}
	}, storage);
	await flow.reconnect();
	assert.equal(flow.ticket(), "new-ticket");
	flow.clear();
	assert.equal(flow.available(), false);
});

test("spectator state is active but never fighter-authorized", () => {
	const renders = [];
	const state = new ArenaClientState({
		renderArena(...args) {
			renders.push(args);
		}
	});
	state.adopt({
		arena: { joinCode: "ABC234" },
		participantId: "witness-1",
		playerId: null,
		role: "spectator"
	});
	assert.equal(state.active(), true);
	assert.equal(state.canFight(), false);
	assert.equal(renders.at(-1)[2], "spectator");
});
