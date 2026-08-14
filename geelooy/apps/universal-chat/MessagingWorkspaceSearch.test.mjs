// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	MessagingWorkspaceSearch,
	workspaceSearchSummary
} from "./MessagingWorkspaceSearch.js";

/**
 * @file Proves loaded-workspace search can never become an invisible cross-section filter and keeps its bounded scope human-readable.
 * @description The Awtsmoos knows every item without filtering, while Awtsmoos.com proves that finite search remains inside the presently loaded lawful vessel in light;
 * section changes restore every rendered item without stealing focus, Escape clears in place, and feedback counts only what this local workspace can actually see.
 */

class FakeInput extends EventTarget {
	constructor() {
		super();
		this.value = "";
		this.focusCount = 0;
	}

	focus() {
		this.focusCount += 1;
	}
}

const input = new FakeInput();
const clearButton = new EventTarget();
clearButton.hidden = true;
const feedback = { hidden: true, textContent: "" };
const nodes = [
	{ textContent: "Torah source", hidden: false },
	{ textContent: "Private chat", hidden: false },
	{ textContent: "Torah activity", hidden: false }
];
const root = new EventTarget();
root.querySelectorAll = () => nodes;
const shell = { root };
const search = new MessagingWorkspaceSearch(input, clearButton, feedback, shell);

input.value = "torah";
input.dispatchEvent(new Event("input"));
assert.deepEqual(nodes.map((node) => node.hidden), [false, true, false]);
assert.equal(clearButton.hidden, false);
assert.equal(feedback.hidden, false);
assert.equal(feedback.textContent, "2 matches in the currently loaded workspace.");

root.dispatchEvent(new Event("messaging-section-selected"));
assert.equal(input.value, "");
assert.deepEqual(nodes.map((node) => node.hidden), [false, false, false]);
assert.equal(feedback.hidden, true);
assert.equal(input.focusCount, 0);

input.value = "missing";
input.dispatchEvent(new Event("input"));
assert.equal(feedback.textContent, "No matches in the currently loaded workspace.");
const escape = new Event("keydown", { cancelable: true });
Object.defineProperty(escape, "key", { value: "Escape" });
input.dispatchEvent(escape);
assert.equal(input.value, "");
assert.equal(input.focusCount, 1);
assert.equal(escape.defaultPrevented, true);

assert.equal(workspaceSearchSummary(1), "1 match in the currently loaded workspace.");
assert.equal(workspaceSearchSummary(3), "3 matches in the currently loaded workspace.");
void search;

console.log("Messaging loaded-workspace search scope contract: PASS");
