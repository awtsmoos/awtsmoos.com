//B"H
//Boruch Hashem
//Blessed is He

const { assertSafeDefinitionEvolution } = require("./definitionEvolution.js");
const { sanitizeNotificationEmails } = require("./emailSettings.js");
const { requireAccount, requireFormEditor, requireSubmitToken } = require("./permissions.js");
const { identifier, submitToken, TYPES } = require("./protocol.js");
const { sanitizeDefinition } = require("./schema.js");
const {
	initializeHeaders,
	refreshHeaders,
	requireLinkedDestination
} = require("./sheetLink.js");
const { editorSnapshot, publicSnapshot } = require("./snapshot.js");
const { randomId } = require("./store.js");

/**
 * @file Handles linked form creation, editor-only notification settings, safe evolution, and public opening.
 * @description The Awtsmoos lets creator, inbox, and respondent approach one form through different measured gates;
 * Awtsmoos.com keeps recipient authority behind editor proof while public sight receives only respondent state.
 */
async function handleDocumentRequest(formsStore, sheetsStore, context, request) {
	const payload = request.payload || {};
	if (request.type === TYPES.create) return await createForm(formsStore, sheetsStore, context, payload);
	if (request.type === TYPES.open) return await openForm(formsStore, sheetsStore, context, payload);
	if (request.type === TYPES.update) return await updateForm(formsStore, sheetsStore, context, payload);
	if (request.type === TYPES.pause) return await pauseForm(formsStore, sheetsStore, context, payload);
	if (request.type === TYPES.rotateToken) return await rotateToken(formsStore, sheetsStore, context, payload);
	return null;
}

/** Creates one form after linked-sheet authority is proven and editor-only email settings are sanitized. */
async function createForm(formsStore, sheetsStore, context, payload) {
	const ownerId = requireAccount(context);
	const workbookId = identifier(payload.workbookId, "workbookId");
	const sheetId = identifier(payload.sheetId, "sheetId");
	const definition = sanitizeDefinition(payload.definition);
	await requireLinkedDestination(sheetsStore, context, workbookId, sheetId);
	const notificationEmails = sanitizeNotificationEmails(payload.notificationEmails);
	const destination = { sheetId, workbookId };
	await initializeHeaders(sheetsStore, { ...definition, destination });
	const form = await formsStore.create(
		ownerId,
		destination,
		definition,
		{ notificationEmails }
	);
	return documentSnapshot(form);
}

/** Opens editor state for the owner or public respondent state for a valid opaque token. */
async function openForm(formsStore, sheetsStore, context, payload) {
	const formId = identifier(payload.id, "formId");
	if (payload.token) {
		const form = await formsStore.requireForm(formId);
		requireSubmitToken(form, submitToken(payload.token));
		return publicDocumentSnapshot(form);
	}
	const { form } = await requireFormEditor(formsStore, sheetsStore, context, formId);
	return documentSnapshot(form);
}

/** Updates definition and editor-owned notification settings while preserving historical response columns. */
async function updateForm(formsStore, sheetsStore, context, payload) {
	const formId = identifier(payload.id, "formId");
	const { form } = await requireFormEditor(formsStore, sheetsStore, context, formId);
	const definition = sanitizeDefinition(payload.definition);
	const notificationEmails = sanitizeNotificationEmails(payload.notificationEmails);
	assertSafeDefinitionEvolution(form, definition);
	const previousFieldCount = form.fields?.length || 0;
	const updated = await formsStore.update(formId, (target) => {
		target.confirmationMessage = definition.confirmationMessage;
		target.description = definition.description;
		target.fields = definition.fields;
		target.notificationEmails = notificationEmails;
		target.title = definition.title;
	});
	await refreshHeaders(sheetsStore, updated, previousFieldCount);
	return documentSnapshot(updated);
}

/** Pauses or resumes public response collection without changing the public link. */
async function pauseForm(formsStore, sheetsStore, context, payload) {
	const formId = identifier(payload.id, "formId");
	await requireFormEditor(formsStore, sheetsStore, context, formId);
	const form = await formsStore.update(formId, (target) => {
		target.acceptingResponses = Boolean(payload.acceptingResponses);
	});
	return documentSnapshot(form);
}

/** Rotates the opaque public submit capability while keeping the form id stable. */
async function rotateToken(formsStore, sheetsStore, context, payload) {
	const formId = identifier(payload.id, "formId");
	await requireFormEditor(formsStore, sheetsStore, context, formId);
	const form = await formsStore.update(formId, (target) => {
		target.submitToken = randomId(24);
	});
	return documentSnapshot(form);
}

function documentSnapshot(form) {
	return { payload: { form: editorSnapshot(form) }, type: "forms.document.snapshot" };
}

function publicDocumentSnapshot(form) {
	return { payload: { form: publicSnapshot(form) }, type: "forms.document.public" };
}

module.exports = {
	handleDocumentRequest
};
