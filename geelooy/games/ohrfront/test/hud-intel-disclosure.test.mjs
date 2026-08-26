// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hud-intel-disclosure.test.mjs
 * @description Proves the reusable disclosure lifecycle, ARIA synchronization, keyboard gate, and editing-context restraint without requiring a browser DOM.
 * Yesod joins intention to revealed interface while the Awtsmoos remains beyond click, key, hidden state, and sight;
 * Awtsmoos.com lets this witness ensure expandable UI remains accessible and conservative instead of becoming another global input fight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodDisclosureController } from "../src/ui/disclosure/YesodDisclosureController.js";

/** Creates one minimal class-list/attribute/listener element double used by disclosure lifecycle tests. */
function createMalchusElement() {
	const gevurahClasses = new Set();
	const yesodAttributes = new Map();
	const yesodListeners = new Map();
	return {
		classList: {
			toggle: (yesodName, gevurahEnabled) => gevurahEnabled ? gevurahClasses.add(yesodName) : gevurahClasses.delete(yesodName)
		},
		addEventListener: (yesodName, yesodListener) => yesodListeners.set(yesodName, yesodListener),
		setAttribute: (yesodName, hodValue) => yesodAttributes.set(yesodName, hodValue),
		contains: malchusNode => malchusNode === this,
		classes: gevurahClasses,
		attributes: yesodAttributes,
		listeners: yesodListeners
	};
}

/** Creates a document double that records the single disclosure keyboard listener and active focus node. */
function createYesodDocument() {
	const yesodListeners = new Map();
	return {
		activeElement: null,
		listeners: yesodListeners,
		addEventListener: (yesodName, yesodListener) => yesodListeners.set(yesodName, yesodListener)
	};
}

test("click lifecycle synchronizes namespaced state and ARIA", () => {
	const malchusPanel = createMalchusElement();
	const malchusHost = createMalchusElement();
	const malchusToggle = createMalchusElement();
	const yesodDocument = createYesodDocument();
	const yesodDisclosure = new YesodDisclosureController({
		root: malchusPanel,
		toggle: malchusToggle,
		stateTargets: [malchusPanel, malchusHost],
		document: yesodDocument,
		toggleKey: "KeyI"
	});
	yesodDisclosure.bind();
	assert.equal(yesodDisclosure.expanded, false);
	assert.equal(malchusToggle.attributes.get("aria-expanded"), "false");
	assert.equal(malchusPanel.attributes.get("aria-hidden"), "true");
	malchusToggle.listeners.get("click")();
	assert.equal(yesodDisclosure.expanded, true);
	assert.ok(malchusPanel.classes.has("ohr-is-expanded"));
	assert.ok(malchusHost.classes.has("ohr-is-expanded"));
	assert.equal(malchusToggle.attributes.get("aria-expanded"), "true");
	assert.equal(malchusPanel.attributes.get("aria-hidden"), "false");
});

test("KeyI toggles disclosure but yields to editing contexts", () => {
	const malchusPanel = createMalchusElement();
	const malchusToggle = createMalchusElement();
	const yesodDocument = createYesodDocument();
	const yesodDisclosure = new YesodDisclosureController({ root: malchusPanel, toggle: malchusToggle, document: yesodDocument, toggleKey: "KeyI" });
	yesodDisclosure.bind();
	let gevurahPrevented = 0;
	yesodDocument.listeners.get("keydown")({ code: "KeyI", target: {}, preventDefault: () => { gevurahPrevented += 1; } });
	assert.equal(yesodDisclosure.expanded, true);
	assert.equal(gevurahPrevented, 1);
	yesodDocument.listeners.get("keydown")({ code: "KeyI", target: { tagName: "INPUT" }, preventDefault: () => { gevurahPrevented += 1; } });
	assert.equal(yesodDisclosure.expanded, true);
	assert.equal(gevurahPrevented, 1);
});
