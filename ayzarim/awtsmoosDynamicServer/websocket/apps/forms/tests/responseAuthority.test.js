//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { TYPES } = require("../protocol.js");
const { handleResponseRequest } = require("../responseHandlers.js");
const {
	SerializedSheetsStore,
	TestFormsStore,
	sampleForm,
	sampleWorkbook
} = require("./testSupport.js");

/**
 * @file Proves public response authority chooses server-owned destination and converges concurrent retries into one durable answer.
 * @description The Awtsmoos lets one submission identity reach one Sheet row and one audit record no matter how retries collide in flight;
 * Awtsmoos.com ignores respondent routing inventions, distinguishes malformed gates from false capabilities, and keeps public success bounded in light.
 */
const VALID_WRONG_TOKEN = "wrong_token_0123456789abcdef";

test("concurrent duplicate submissions create one durable response and one Sheet row", async () => {
	const form = sampleForm();
	const formsStore = new TestFormsStore(form);
	const sheetsStore = new SerializedSheetsStore(sampleWorkbook());
	const request = submitRequest(form, "submission-1");
	const [first, second] = await Promise.all([
		handleResponseRequest(formsStore, sheetsStore, {}, request),
		handleResponseRequest(formsStore, sheetsStore, {}, request)
	]);
	assert.equal(first.payload.responseId, "submission-1");
	assert.equal(second.payload.responseId, "submission-1");
	assert.equal(await formsStore.countResponses(form.id), 1);
	assert.equal(formsStore.form.responseCount, 1);
	assert.deepEqual(responseIds(sheetsStore.workbook), ["submission-1"]);
});

test("public payload cannot redirect the server-owned workbook or sheet destination", async () => {
	const form = sampleForm();
	const formsStore = new TestFormsStore(form);
	const sheetsStore = new SerializedSheetsStore(sampleWorkbook());
	const request = submitRequest(form, "submission-2");
	request.payload.destination = {
		sheetId: "evil-sheet",
		workbookId: "evil-book"
	};
	request.payload.workbookId = "evil-book";
	request.payload.sheetId = "evil-sheet";
	await handleResponseRequest(formsStore, sheetsStore, {}, request);
	assert.ok(sheetsStore.updateIds.length >= 1);
	assert.ok(
		sheetsStore.updateIds.every((id) => id === form.destination.workbookId)
	);
	assert.deepEqual(responseIds(sheetsStore.workbook), ["submission-2"]);
});

test("validly shaped but wrong submit token fails without touching the linked Sheet", async () => {
	const form = sampleForm();
	const formsStore = new TestFormsStore(form);
	const sheetsStore = new SerializedSheetsStore(sampleWorkbook());
	const request = submitRequest(form, "submission-3");
	request.payload.token = VALID_WRONG_TOKEN;
	await assert.rejects(
		() => handleResponseRequest(formsStore, sheetsStore, {}, request),
		/Form access denied/
	);
	assert.deepEqual(sheetsStore.updateIds, []);
});

test("paused forms reject new submissions before Sheet mutation", async () => {
	const form = sampleForm({ acceptingResponses: false });
	const formsStore = new TestFormsStore(form);
	const sheetsStore = new SerializedSheetsStore(sampleWorkbook());
	await assert.rejects(
		() => handleResponseRequest(
			formsStore,
			sheetsStore,
			{},
			submitRequest(form, "submission-4")
		),
		/not accepting responses/
	);
	assert.deepEqual(sheetsStore.updateIds, []);
});

/**
 * Builds one public request while keeping authority-only routing intentionally absent.
 *
 * @param {object} form Server-owned form providing id and token.
 * @param {string} submissionId Stable respondent retry identity.
 * @returns {object} Production-shaped public realtime request.
 */
function submitRequest(form, submissionId) {
	return {
		payload: {
			answers: { name: "Ada" },
			id: form.id,
			submissionId,
			token: form.submitToken
		},
		type: TYPES.submit
	};
}

/**
 * Returns all non-header response ids written into the linked Sheet B column.
 *
 * @param {object} workbook Linked workbook after response mutations.
 * @returns {string[]} Manifest response ids below the canonical header.
 */
function responseIds(workbook) {
	const sheet = workbook.sheets.find((item) => item.id === "sheet-1");
	return Object.entries(sheet.cells)
		.filter(([address]) => /^B[2-9][0-9]*$/.test(address))
		.map(([, cell]) => String(cell.value));
}
