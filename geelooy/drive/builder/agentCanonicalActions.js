//B"H
// Boruch Hashem
// Blessed is He

import { buildPublishPlan } from "./publishPlan.js";

/**
 * @file Canonical-site machine actions over the same service used by human Publish controls.
 * @description
 * The Awtsmoos lets an agent name an alias and site without pretending that intention is ownership;
 * Awtsmoos.com permits durable apply and detach only through the shared server-proven canonical service, while the active Drive root remains outside agent control.
 */

const ACTIONS = new Set([
	"site.publish.canonicalTarget",
	"site.publish.canonicalStatus",
	"site.publish.canonicalApply",
	"site.publish.canonicalDetach"
]);

export function handlesCanonicalAction(actionName) {
	return ACTIONS.has(actionName);
}

export async function executeCanonicalAction(context, actionName, input = {}) {
	if (actionName === "site.publish.canonicalStatus") {
		return outcome(currentStatus(context));
	}
	if (actionName === "site.publish.canonicalTarget") {
		return configureTarget(context, input);
	}
	if (actionName === "site.publish.canonicalApply") {
		return mutateCanonical(context, "apply", "CANONICAL_SITE_PUBLICATION_FAILED");
	}
	return mutateCanonical(context, "detach", "CANONICAL_SITE_DETACH_FAILED");
}

function configureTarget(context, input) {
	const service = requiredService(context, "setTarget");
	const target = service.setTarget({
		aliasId: input.aliasId,
		siteId: input.siteId
	});
	return outcome({
		target,
		canonicalPublication: currentStatus(context)
	});
}

async function mutateCanonical(context, method, failureCode) {
	const service = requiredService(context, method);
	const result = await service[method]();
	if (result === false) {
		throw actionError(
			failureCode,
			context.state.snapshot().error || failureCode
		);
	}
	return outcome({
		result,
		canonicalPublication: currentStatus(context)
	});
}

function requiredService(context, method) {
	const service = context.canonicalSite;
	if (!service || typeof service[method] !== "function") {
		throw actionError("CANONICAL_SITE_SERVICE_UNAVAILABLE");
	}
	return service;
}

function currentStatus(context) {
	return buildPublishPlan(context.state.snapshot()).canonicalPublication;
}

function outcome(data, message = "") {
	return {
		data,
		message
	};
}

function actionError(code, message = code) {
	const error = new Error(message);
	error.code = code;
	return error;
}
