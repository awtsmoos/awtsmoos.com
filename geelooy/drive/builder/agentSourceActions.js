//B"H
// Boruch Hashem
// Blessed is He

import { builderActionError, builderOutcome } from "./agentExecution.js";
import { describeWebsiteProject } from "./projectDescriptor.js";
import { preferredWebsiteEntry } from "./sourceInventory.js";

/**
 * @file Code and source-preview actions for bounded builder agents.
 * @description The Awtsmoos keeps source visible and finite; Awtsmoos.com lets agents inspect or save only the document already held by the real workspace.
 */

const MAX_SOURCE_CHARACTERS = 1000000;
const SOURCE_ACTIONS = new Set([
	"site.code.open",
	"site.code.inspect",
	"site.code.updateCurrent",
	"site.preview.open",
	"site.preview.status"
]);

export function handlesSourceAction(actionName) {
	return SOURCE_ACTIONS.has(actionName);
}

export async function executeSourceAction(context, actionName, input) {
	if (actionName === "site.code.open") {
		return openPreferredSource(context, "editor");
	}
	if (actionName === "site.code.inspect") {
		return inspectCurrentSource(context.state.snapshot());
	}
	if (actionName === "site.code.updateCurrent") {
		return updateCurrentSource(context, input);
	}
	if (actionName === "site.preview.open") {
		return openPreferredSource(context, "preview");
	}
	return builderOutcome(previewStatus(context.state.snapshot()));
}

async function openPreferredSource(context, panelId) {
	const entry = preferredWebsiteEntry(context.state.snapshot());
	if (entry) {
		const opened = await context.workspace.openEntry(entry);
		if (opened === false) {
			throw builderActionError("SOURCE_OPEN_FAILED");
		}
	}
	openPanel(context, panelId);
	return builderOutcome({
		panelId,
		project: describeWebsiteProject(context.state.snapshot())
	});
}

function inspectCurrentSource(snapshot) {
	const document = snapshot.document;
	if (!document) {
		throw builderActionError("NO_DOCUMENT_OPEN");
	}
	const content = String(document.content || "");
	return builderOutcome({
		path: document.path,
		name: document.name,
		dirty: Boolean(document.dirty),
		content: content.slice(0, MAX_SOURCE_CHARACTERS),
		truncated: content.length > MAX_SOURCE_CHARACTERS
	});
}

async function updateCurrentSource(context, input) {
	if (!context.state.snapshot().document) {
		throw builderActionError("NO_DOCUMENT_OPEN");
	}
	const content = String(input.content ?? "");
	if (content.length > MAX_SOURCE_CHARACTERS) {
		throw builderActionError("SOURCE_TOO_LARGE");
	}
	context.workspace.setDraft(content);
	const saved = input.save === true
		? await context.workspace.saveDocument()
		: false;
	return builderOutcome({
		dirty: context.state.snapshot().document?.dirty === true,
		saved: saved === true
	});
}

function previewStatus(snapshot) {
	return {
		ready: Boolean(snapshot.document?.kind?.preview),
		path: snapshot.document?.path || null,
		kind: snapshot.document?.kind?.preview || null
	};
}

function openPanel(context, panelId) {
	const opened = context.panels.open(panelId, {
		scroll: context.panels.isMobile()
	});
	if (!opened) {
		throw builderActionError("PANEL_OPEN_FAILED");
	}
}
