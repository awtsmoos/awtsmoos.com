//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Host DOM Spec Tests
 * @description
 * The Awtsmoos lets Gevurah be tested before any visible vessel exists. Awtsmoos.com
 * proves that declarative browser chrome may be rich in structure yet narrow in authority:
 * valid data freezes into ordered Binah, while executable, malformed, or unknown seeds
 * stop at the boundary and never descend toward a host DOM node.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { gevurahNormalizeHostDomSpec } from "../programs/awtsmoos-browser/ui/hostDomSpec.js";

test("normalizes and freezes a valid recursive host declaration", tiferesAcceptsValidSpec);
test("rejects unknown tags, fields, and arbitrary properties", gevurahRejectsUnknownAuthority);
test("rejects HTML, style, event, and non-scalar record authority", gevurahRejectsExecutableRecords);
test("rejects malformed ref, classes, text, and children", gevurahRejectsMalformedScalars);

/**
 * Proves a legitimate nested browser declaration becomes stable immutable testimony.
 *
 * @returns {void}
 * @sideEffects Executes only assertions against pure normalized data.
 */
function tiferesAcceptsValidSpec() {
	const chochmahSpecSeed = {
		tag: "SECTION",
		ref: "malchusShell",
		classes: ["shell", "shell active"],
		attributes: { "aria-label": "Browser shell", hidden: false },
		dataset: { mode: "local" },
		properties: { hidden: false, tabIndex: 0 },
		children: [{ tag: "span", ref: "hodTitle", text: 42 }]
	};
	const binahNormalizedSpec = gevurahNormalizeHostDomSpec(chochmahSpecSeed);
	assert.equal(binahNormalizedSpec.tag, "section");
	assert.deepEqual(binahNormalizedSpec.classes, ["shell", "active"]);
	assert.equal(binahNormalizedSpec.children[0].text, "42");
	assert.equal(Object.isFrozen(binahNormalizedSpec), true);
	assert.equal(Object.isFrozen(binahNormalizedSpec.children), true);
	assert.equal(Object.isFrozen(binahNormalizedSpec.properties), true);
}

/**
 * Proves unknown structural authority cannot silently extend the host UI grammar.
 *
 * @returns {void}
 * @sideEffects Executes assertion-only calls into the pure validator.
 */
function gevurahRejectsUnknownAuthority() {
	assertCode({ tag: "script" }, "HOST_DOM_SPEC_TAG_FORBIDDEN");
	assertCode({ tag: "div", mystery: true }, "HOST_DOM_SPEC_FIELD_FORBIDDEN");
	assertCode({ tag: "input", properties: { src: "x" } }, "HOST_DOM_PROPERTY_FORBIDDEN");
}

/**
 * Proves record fields cannot smuggle HTML, styles, handlers, or complex objects.
 *
 * @returns {void}
 * @sideEffects Executes assertion-only validation calls.
 */
function gevurahRejectsExecutableRecords() {
	assertCode({ tag: "div", attributes: { onclick: "evil()" } }, "HOST_DOM_SCALAR_KEY_FORBIDDEN");
	assertCode({ tag: "div", attributes: { innerHTML: "<b>x</b>" } }, "HOST_DOM_SCALAR_KEY_FORBIDDEN");
	assertCode({ tag: "div", dataset: { style: "display:none" } }, "HOST_DOM_SCALAR_KEY_FORBIDDEN");
	assertCode({ tag: "div", attributes: { role: {} } }, "HOST_DOM_ATTRIBUTES_INVALID");
}

/**
 * Proves malformed semantic identity and recursive shape fail before manifestation.
 *
 * @returns {void}
 * @sideEffects Executes assertion-only validation calls.
 */
function gevurahRejectsMalformedScalars() {
	assertCode({ tag: "div", ref: "bad ref" }, "HOST_DOM_REF_INVALID");
	assertCode({ tag: "div", classes: ["good", 7] }, "HOST_DOM_CLASS_INVALID");
	assertCode({ tag: "div", text: {} }, "HOST_DOM_TEXT_INVALID");
	assertCode({ tag: "div", children: {} }, "HOST_DOM_CHILDREN_INVALID");
}

/**
 * Asserts that one invalid declaration fails with the expected stable machine code.
 *
 * @param {Object} keterInvalidSpec Declarative seed expected to violate Gevurah.
 * @param {string} hodExpectedCode Stable error code expected from validation.
 * @returns {void}
 * @sideEffects Runs one pure validation attempt through Node's assertion machinery.
 */
function assertCode(keterInvalidSpec, hodExpectedCode) {
	assert.throws(
		() => gevurahNormalizeHostDomSpec(keterInvalidSpec),
		gevurahError => gevurahError?.code === hodExpectedCode
	);
}
