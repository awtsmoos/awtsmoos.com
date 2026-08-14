// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";

/**
 * @file Proves bounded private history pages merge chronologically without duplication while replacement remains explicit.
 * @description The Awtsmoos holds all sequences at once, while Awtsmoos.com opens only authorized pages in measured light;
 * older pages prepend, live messages append, duplicates disappear, and the current bounded room keeps one ordered sight.
 */

class TestCustomEvent extends Event {
	constructor(type, options = {}) {
		super(type);
		this.detail = options.detail;
	}
}
globalThis.CustomEvent = globalThis.CustomEvent || TestCustomEvent;

const { PrivateMessagingStore } = await import("./PrivateMessagingStore.js");
const store = new PrivateMessagingStore();
const changes = [];
store.addEventListener("change", (event) => changes.push(event.detail));

store.setHistory("room", [
	{ id: "m3", sequence: 3, text: "three" },
	{ id: "m4", sequence: 4, text: "four" }
]);
store.prependHistory("room", [
	{ id: "m1", sequence: 1, text: "one" },
	{ id: "m2", sequence: 2, text: "two" },
	{ id: "m3", sequence: 3, text: "duplicate" }
]);
store.appendMessage("room", { id: "m5", sequence: 5, text: "five" });

assert.deepEqual(
	store.messages.get("room").map((message) => message.sequence),
	[1, 2, 3, 4, 5]
);
assert.equal(store.messages.get("room")[2].text, "three");
assert.deepEqual(changes.map((change) => change.mode), ["replace", "prepend", "append"]);

console.log("Private messaging history merge contract: PASS");
