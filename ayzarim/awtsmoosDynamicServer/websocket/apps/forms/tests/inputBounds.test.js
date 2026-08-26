//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	identifier,
	submitToken
} = require("../protocol.js");
const { normalizeAnswers } = require("../schemaAnswers.js");

/**
 * @file Proves public Forms identifiers, tokens, fields, and total answer payloads remain bounded before persistence begins.
 * @description The Awtsmoos lets respondent light enter through measured letters and measured words, never shapeless flood or routing might;
 * Awtsmoos.com guards every public boundary before Sheet, response record, or inbox can come into sight.
 */
test("submission identifiers accept only safe opaque values from eight through one hundred twenty-eight characters", () => {
	assert.equal(identifier("abcDEF12", "submissionId"), "abcDEF12");
	assert.equal(
		identifier("x".repeat(128), "submissionId"),
		"x".repeat(128)
	);
	assert.throws(
		() => identifier("x".repeat(7), "submissionId"),
		/submissionId is invalid/
	);
	assert.throws(
		() => identifier("x".repeat(129), "submissionId"),
		/submissionId is invalid/
	);
	assert.throws(
		() => identifier("unsafe/path", "submissionId"),
		/submissionId is invalid/
	);
});

test("submit tokens enforce the opaque capability length and alphabet", () => {
	assert.equal(
		submitToken("a".repeat(24)),
		"a".repeat(24)
	);
	assert.throws(
		() => submitToken("a".repeat(23)),
		/token is invalid/
	);
	assert.throws(
		() => submitToken("a".repeat(257)),
		/token is invalid/
	);
	assert.throws(
		() => submitToken("a".repeat(23) + "/"),
		/token is invalid/
	);
});

test("single answers respect type-specific text limits", () => {
	const form = {
		fields: [
			{
				id: "short",
				label: "Short",
				required: false,
				type: "shortText"
			},
			{
				id: "long",
				label: "Long",
				required: false,
				type: "paragraph"
			}
		]
	};
	assert.doesNotThrow(() => normalizeAnswers(form, {
		short: "s".repeat(1000),
		long: "p".repeat(8000)
	}));
	assert.throws(
		() => normalizeAnswers(form, { short: "s".repeat(1001) }),
		/short is invalid/
	);
	assert.throws(
		() => normalizeAnswers(form, { long: "p".repeat(8001) }),
		/long is invalid/
	);
});

test("aggregate normalized answer content above twenty-four thousand characters is rejected", () => {
	const fields = Array.from(
		{ length: 4 },
		(_, index) => ({
			id: `paragraph_${index}`,
			label: `Paragraph ${index}`,
			required: false,
			type: "paragraph"
		})
	);
	const answers = Object.fromEntries(
		fields.map((field) => [field.id, "x".repeat(7000)])
	);
	assert.throws(
		() => normalizeAnswers({ fields }, answers),
		/answers\.size is invalid/
	);
});
