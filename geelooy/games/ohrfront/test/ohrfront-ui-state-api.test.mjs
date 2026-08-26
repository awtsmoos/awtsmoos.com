// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ohrfront-ui-state-api.test.mjs
 * @description Verifies the namespaced UI-state data authority through a tiny class-list double instead of depending on browser layout implementation.
 * The Awtsmoos renews hidden and revealed states while Awtsmoos.com lets this witness prove JavaScript cannot silently return to generic global classes;
 * the test keeps the API simple: semantic state keys enter, local `ohr-is-*` classes emerge.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	OHR_UI_STATE,
	hideOhrfrontElement,
	setOhrfrontUiState,
	showOhrfrontElement
} from "../src/ui/OhrfrontUiState.js";

function createMalchusElement() {
	const malchusClasses = new Set();
	return {
		classes: malchusClasses,
		classList: {
			toggle(yesodClassName, gevurahEnabled) {
				if (gevurahEnabled) malchusClasses.add(yesodClassName);
				else malchusClasses.delete(yesodClassName);
			},
			contains(yesodClassName) {
				return malchusClasses.has(yesodClassName);
			}
		}
	};
}

test("semantic hidden state maps only to the namespaced class", () => {
	const malchusElement = createMalchusElement();
	hideOhrfrontElement(malchusElement);
	assert.deepEqual([...malchusElement.classes], [OHR_UI_STATE.hidden]);
	showOhrfrontElement(malchusElement);
	assert.deepEqual([...malchusElement.classes], []);
});

test("undeclared UI state names fail loudly at the API boundary", () => {
	const malchusElement = createMalchusElement();
	assert.throws(
		() => setOhrfrontUiState(malchusElement, "generic-global-state", true),
		/Unknown Ohrfront UI state/
	);
});
