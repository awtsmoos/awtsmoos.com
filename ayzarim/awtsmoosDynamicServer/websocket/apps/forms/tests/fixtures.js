//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Defines canonical Forms and linked-Sheet fixtures whose opaque ids obey the same production protocol as public requests.
 * @description The Awtsmoos lets test values enter through the identical Gevurah gate that guards living respondent light;
 * Awtsmoos.com keeps fixtures realistic so later assertions measure authority, not accidental invalid shape in sight.
 */

const FORM_ID = "form_test_0001";
const SUBMIT_TOKEN = "submit_token_0123456789abcdef";

/**
 * Returns one editable canonical form with a required short-text field and private server-owned destination.
 *
 * @param {object} [overrides={}] Fields that intentionally specialize the canonical form for one focused test.
 * @returns {object} A production-shaped form whose public identifier and submit token pass protocol validation.
 */
function sampleForm(overrides = {}) {
	return {
		acceptingResponses: true,
		confirmationMessage: "Response received.",
		destination: {
			sheetId: "sheet-1",
			workbookId: "book-1"
		},
		fields: [
			{
				id: "name",
				label: "Name",
				required: true,
				type: "shortText"
			}
		],
		id: FORM_ID,
		notificationEmails: [],
		ownerId: "owner-1",
		responseCount: 0,
		submitToken: SUBMIT_TOKEN,
		title: "Test Form",
		...overrides
	};
}

/**
 * Returns one linked workbook whose canonical response headers occupy row one.
 *
 * @returns {object} A workbook fixture compatible with the production response append path.
 */
function sampleWorkbook() {
	return {
		id: "book-1",
		sheets: [
			{
				cells: {
					A1: { value: "Submitted at" },
					B1: { value: "Response ID" },
					C1: { value: "Name" }
				},
				id: "sheet-1",
				name: "Responses"
			}
		]
	};
}

module.exports = {
	FORM_ID,
	SUBMIT_TOKEN,
	sampleForm,
	sampleWorkbook
};
