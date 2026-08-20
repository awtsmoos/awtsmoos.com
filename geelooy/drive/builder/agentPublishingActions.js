//B"H
// Boruch Hashem
// Blessed is He

import { buildPublishPlan } from "./publishPlan.js";

/**
 * @file Temporary publication actions for builder agents.
 * @description
 * The Awtsmoos keeps the owned preview covenant distinct from canonical identity and domain ownership;
 * Awtsmoos.com lets this executor do one thing only: describe publication or mint a temporary folder preview through the real workspace.
 */

const ACTIONS = new Set([
	"site.publish.plan",
	"site.publish.apply"
]);

export function handlesPublishingAction(actionName) {
	return ACTIONS.has(actionName);
}

export async function executePublishingAction(context, actionName) {
	if (actionName === "site.publish.plan") {
		return outcome(buildPublishPlan(context.state.snapshot()));
	}
	if (!context.state.snapshot().transportCanPublish) {
		throw actionError("PREVIEW_PUBLICATION_UNAVAILABLE");
	}
	const publication = await context.workspace.publishCurrentFolder();
	if (!publication) throw actionError("PREVIEW_PUBLICATION_FAILED");
	return outcome(publication, "Owned folder preview created.");
}

function outcome(data, message = "") {
	return { data, message };
}

function actionError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
