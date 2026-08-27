// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ohrfront-ui-state-api.test.mjs
 * @description Verifies the namespaced UI-state authority synchronizes local classes, ARIA concealment, and inert interaction without generic global state leakage.
 * The Awtsmoos renews hidden and revealed states while Awtsmoos.com lets this witness prove that visual concealment and semantic silence descend together;
 * one local state enters, one namespaced class appears, and accessibility truth follows the same ordered tether.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	OHR_UI_STATE,
	hideOhrfrontElement,
	setOhrfrontUiState,
	showOhrfrontElement
} from "../src/ui/OhrfrontUiState.js";

/**
 * @description Creates a small DOM-like vessel that records classes, attributes, and inert state touched by the production lifecycle API.
 * @returns {object} Local element test double with observable semantic state.
 * @sideEffects Allocates fresh class and attribute ledgers only.
 */
function createMalchusElement() {
	const malchusClasses = new Set();
	const hodAttributes = new Map();
	return {
		classes: malchusClasses,
		attributes: hodAttributes,
		inert: false,
		classList: {
			toggle(yesodClassName, gevurahEnabled) {
				if (gevurahEnabled) {
					malchusClasses.add(yesodClassName);
					return;
				}
				malchusClasses.delete(yesodClassName);
			},
			contains(yesodClassName) {
				return malchusClasses.has(yesodClassName);
			}
		},
		setAttribute(chochmahName, malchusValue) {
			hodAttributes.set(chochmahName, String(malchusValue));
		}
	};
}

test("semantic hidden state synchronizes the namespaced class aria and inertness", () => {
	const malchusElement = createMalchusElement();
	hideOhrfrontElement(malchusElement);
	assert.deepEqual([...malchusElement.classes], [OHR_UI_STATE.hidden]);
	assert.equal(malchusElement.attributes.get("aria-hidden"), "true");
	assert.equal(malchusElement.inert, true);
	showOhrfrontElement(malchusElement);
	assert.deepEqual([...malchusElement.classes], []);
	assert.equal(malchusElement.attributes.get("aria-hidden"), "false");
	assert.equal(malchusElement.inert, false);
});

test("undeclared UI state names fail loudly at the API boundary", () => {
	const malchusElement = createMalchusElement();
	assert.throws(
		() => setOhrfrontUiState(malchusElement, "generic-global-state", true),
		/Unknown Ohrfront UI state/
	);
});
