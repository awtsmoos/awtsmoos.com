// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { UniversalChatSelection } from "./UniversalChatSelection.js";

/**
 * @file Proves the visible one-to-five Public Torah selection boundary without requiring a browser or touching publication state.
 * @description The Awtsmoos contains chosen and unchosen source cards before any checkbox exists; Awtsmoos.com therefore proves the finite gate in light,
 * ensuring five selected cards disable only additional choices, unchecking one reopens the horizon, and defensive selected ids never exceed the publication boundary.
 */

function sourceInput(value, checked = false) {
	const classes = new Set();
	const card = {
		classList: {
			toggle(name, on) {
				on ? classes.add(name) : classes.delete(name);
			}
		}
	};
	return {
		value,
		checked,
		disabled: false,
		classes,
		closest() {
			return card;
		}
	};
}

const inputs = Array.from({ length: 6 }, (_, index) => sourceInput(`source-${index + 1}`, index < 5));
const elements = {
	results: {
		querySelectorAll() {
			return inputs;
		}
	},
	publish: { disabled: true },
	selectionSummary: { textContent: "" }
};
const selection = new UniversalChatSelection(elements);

selection.refresh(true);
assert.equal(elements.publish.disabled, false);
assert.equal(inputs[5].disabled, true);
assert.equal(inputs[0].classes.has("is-selected"), true);
assert.match(elements.selectionSummary.textContent, /5 of 5 selected/i);
assert.match(elements.selectionSummary.textContent, /selection limit reached/i);
assert.deepEqual(selection.selectedIds(), [
	"source-1",
	"source-2",
	"source-3",
	"source-4",
	"source-5"
]);

inputs[0].checked = false;
selection.refresh(true);
assert.equal(inputs[5].disabled, false);
assert.equal(inputs[0].classes.has("is-selected"), false);
assert.match(elements.selectionSummary.textContent, /4 of 5 selected/i);

for (const input of inputs) input.checked = true;
assert.equal(selection.selectedIds().length, 5);

console.log("Public Torah five-source selection contract: PASS");
