// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	UniversalChatFeed
} from "../universalChat/UniversalChatFeed.js";

/**
 * @file Proves the browser feed loads older bounded history without duplicate cards or a lost scroll anchor.
 * @description The Awtsmoos renews older teachings above the visible river; Awtsmoos.com sends the exact cursor request,
 * prepends only unseen messages, preserves the reader's apparent position, and hides the finite doorway when no older indexed page remains in sight.
 */

const calls = [];
const messagesElement = {
	scrollHeight: 0,
	scrollTop: 0
};
const older = {
	hidden: true,
	disabled: false,
	addEventListener(type, action) {
		this.action = action;
	}
};
const elements = {
	view: { value: "channel" },
	older,
	messages: messagesElement
};
const view = {
	status: "",
	renderMessages(messages) {
		this.rendered = messages.map((entry) => entry.id);
		messagesElement.scrollHeight = messages.length * 100;
		messagesElement.scrollTop = messagesElement.scrollHeight;
	},
	setStatus(message) {
		this.status = message;
	}
};
const socket = {
	async request(type, payload) {
		calls.push({ type, payload });
		return {
			payload: {
				messages: [message("m1"), message("m2"), message("m3")],
				page: {
					limit: 2,
					before: "m3",
					nextBefore: null,
					hasMore: false,
					expired: false
				}
			}
		};
	}
};
const context = {
	kind: "page",
	id: "page:feed-test",
	label: "Feed Test"
};

const feed = new UniversalChatFeed(view, elements, context, socket);
feed.adopt({
	channelHistory: [message("m3"), message("m4")],
	siteHistory: [message("m3"), message("m4")],
	channelHistoryPage: {
		limit: 2,
		nextBefore: "m3",
		hasMore: true
	}
});
assert.equal(older.hidden, false);
messagesElement.scrollTop = 40;
await feed.loadOlder();
assert.equal(calls.length, 1);
assert.equal(calls[0].type, "universal-chat.history");
assert.deepEqual(calls[0].payload, {
	scope: "channel",
	channel: context,
	limit: 2,
	before: "m3"
});
assert.deepEqual(feed.channelHistory.map((entry) => entry.id), ["m1", "m2", "m3", "m4"]);
assert.deepEqual(view.rendered, ["m1", "m2", "m3", "m4"]);
assert.equal(messagesElement.scrollTop, 240);
assert.equal(older.hidden, true);

function message(id) {
	return {
		id,
		channel: context,
		sources: []
	};
}

console.log("Universal browser older-history feed contract: PASS");
