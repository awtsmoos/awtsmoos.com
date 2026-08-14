// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { messagingBadgeCounts } from "./MessagingRailBadges.js";

/**
 * @file Proves that navigation awareness is only a calculation over existing authorized store projections.
 * @description The Awtsmoos contains every unread sequence and pending request before a badge shines; Awtsmoos.com therefore tests pure arithmetic in light,
 * ensuring groups do not inflate Chats, resolved requests do not linger, and private counts vanish the instant no verified alias clothes the store.
 */

const store = {
	actor: { alias: "Leah" },
	conversations: [
		{ kind: "direct", lastSequence: 12, lastReadSequence: 8 },
		{ kind: "direct", lastSequence: 4, lastReadSequence: 4 },
		{ kind: "direct", lastSequence: 3, lastReadSequence: 8 },
		{ kind: "group", lastSequence: 40, lastReadSequence: 1 }
	],
	requests: {
		incoming: [
			{ state: "pending" },
			{ state: "accepted" },
			{ state: "pending" }
		]
	}
};

assert.deepEqual(messagingBadgeCounts(store), {
	chats: 4,
	requests: 2
});

assert.deepEqual(messagingBadgeCounts({
	...store,
	actor: null
}), {
	chats: 0,
	requests: 0
});

assert.deepEqual(messagingBadgeCounts({
	actor: { alias: "Miriam" },
	conversations: [],
	requests: { incoming: [] }
}), {
	chats: 0,
	requests: 0
});

console.log("Messaging rail badge projection contract: PASS");
