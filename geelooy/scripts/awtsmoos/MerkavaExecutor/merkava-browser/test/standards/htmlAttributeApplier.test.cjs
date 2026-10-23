//B"H
//Boruch Hashem
//Blessed is He

/**
 * Awtsmoos.com gives each attribute its rightful place;
 * no duplicate steals the first light or changes its face.
 * Certify fallback and optimized HTML attribute publication.
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const { applyHtmlAttributes } = require("../../standards/html/HtmlTreeSupport.js");

/** Returns first-wins tokens with collision-prone attribute names. */
function createAttributeTokens() {
	return [
		{ name: "id", value: "first" },
		{ name: "id", value: "second" },
		{ name: "__proto__", value: "prototype-safe" },
		{ name: "constructor", value: "constructor-safe" },
		{ name: "constructor", value: "discarded" }
	];
}

test("fallback keeps first HTML attributes and prototype-safe keys", () => {
	const observed = [];
	const element = {
		setAttribute(name, value) {
			observed.push({ name, value });
		}
	};
	applyHtmlAttributes(element, createAttributeTokens());
	assert.deepEqual(observed, [
		{ name: "id", value: "first" },
		{ name: "__proto__", value: "prototype-safe" },
		{ name: "constructor", value: "constructor-safe" }
	]);
});

test("optimized parsed attributes receive only first values", () => {
	let observed = null;
	const element = {
		__setParsedAttributes(attributes) {
			observed = attributes;
		},
		setAttribute() {
			assert.fail("optimized path must not call setAttribute");
		}
	};
	applyHtmlAttributes(element, createAttributeTokens());
	assert.equal(observed.length, 3);
	assert.deepEqual(observed.map(attribute => attribute.value), [
		"first", "prototype-safe", "constructor-safe"
	]);
});

test("absent or empty attributes have no side effects", () => {
	const element = {
		setAttribute() {
			assert.fail("empty attributes must not mutate elements");
		}
	};
	applyHtmlAttributes(element, undefined);
	applyHtmlAttributes(element, []);
});
