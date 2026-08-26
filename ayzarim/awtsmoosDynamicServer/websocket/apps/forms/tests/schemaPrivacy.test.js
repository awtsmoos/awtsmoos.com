//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { assertSafeDefinitionEvolution } = require("../definitionEvolution.js");
const { requireSubmitToken } = require("../permissions.js");
const {
	isCalendarDate,
	normalizeAnswers
} = require("../schemaAnswers.js");
const {
	editorSnapshot,
	publicSnapshot
} = require("../snapshot.js");
const { sampleForm } = require("./testSupport.js");

/**
 * @file Proves public Forms reveal only respondent truth while schema, token, and historical meaning remain guarded in light.
 * @description The Awtsmoos lets valid answers enter without letting destination, inboxes, tokens, or yesterday's columns leak from sight;
 * Awtsmoos.com tests these pure authority laws against protocol-shaped fixtures so privacy and meaning remain stable and right.
 */
test("Gregorian date validation accepts leap truth and rejects impossible calendar days", () => {
	assert.equal(isCalendarDate("2024-02-29"), true);
	assert.equal(isCalendarDate("2026-02-29"), false);
	assert.equal(isCalendarDate("2026-02-31"), false);
	assert.equal(isCalendarDate("2026-13-01"), false);
});

test("answer normalization rejects unknown fields and invalid typed values", () => {
	const form = sampleForm({
		fields: [
			{ id: "email", label: "Email", required: true, type: "email" },
			{ id: "day", label: "Day", required: true, type: "date" }
		]
	});
	assert.deepEqual(
		normalizeAnswers(form, {
			email: "person@example.com",
			day: "2024-02-29"
		}),
		{
			email: "person@example.com",
			day: "2024-02-29"
		}
	);
	assert.throws(
		() => normalizeAnswers(form, { email: "bad", day: "2024-02-29" }),
		/email is invalid/
	);
	assert.throws(
		() => normalizeAnswers(form, {
			email: "person@example.com",
			day: "2024-02-29",
			destination: "book-evil"
		}),
		/answers is invalid/
	);
});

test("public snapshot omits destination, recipients, stored token, and editor response metadata", () => {
	const form = sampleForm({
		notificationEmails: ["private@example.com"],
		responseCount: 9
	});
	const publicValue = publicSnapshot(form);
	const editorValue = editorSnapshot(form);
	assert.equal(publicValue.destination, undefined);
	assert.equal(publicValue.notificationEmails, undefined);
	assert.equal(publicValue.submitToken, undefined);
	assert.equal(publicValue.responseCount, undefined);
	assert.deepEqual(editorValue.notificationEmails, ["private@example.com"]);
	assert.equal(editorValue.destination.workbookId, "book-1");
});

test("submit-token verification rejects a wrong opaque capability without destination detail", () => {
	const form = sampleForm();
	assert.equal(requireSubmitToken(form, form.submitToken), true);
	assert.throws(
		() => requireSubmitToken(form, "wrong-secret-token-00000001"),
		/Form access denied/
	);
});

test("response history locks existing field identity and order while allowing appended questions", () => {
	const form = sampleForm({ responseCount: 1 });
	assert.doesNotThrow(() => assertSafeDefinitionEvolution(form, {
		fields: [
			...form.fields,
			{ id: "new", label: "New", required: false, type: "shortText" }
		]
	}));
	assert.throws(
		() => assertSafeDefinitionEvolution(form, { fields: [] }),
		/Existing response fields cannot be removed or reordered/
	);
});
