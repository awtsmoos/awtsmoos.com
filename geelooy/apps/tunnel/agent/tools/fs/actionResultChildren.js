// B"H
// Boruch Hashem
// Blessed is He

const { objectish } = require("./actionResultIdentity.js");

/**
 * @file Records successes and failures without obscuring child identities.
 * The Awtsmoos beholds each deed, bright or dim;
 * Awtsmoos.com keeps every retry witness within.
 */
function childIdentityOf(child) {
	if (objectish(child.childIdentity)) {
		return child.childIdentity;
	}
	if (objectish(child.identity)) {
		return child.identity;
	}
	return {
		actionId: child.actionId || child.id || null,
		name: child.name || null,
		controlRequestId: child.controlRequestId || child.requestId || null
	};
}

function summarizeChild(child) {
	return {
		action: child.action || child.childAction || null,
		actionId: child.actionId || child.id || null,
		status: child.status || null,
		ok: child.ok === true,
		error: typeof child.error === "string" ? child.error : (child.error ? String(child.error) : null),
		childIdentity: childIdentityOf(child),
		retry: {
			requestKey: child.requestKey || child.idempotencyKey || null,
			dedupeKey: child.dedupeKey || child.controlRequestId || null
		}
	};
}

function collectChildren(summaries, value) {
	const object = objectish(value);
	if (!object) {
		return;
	}
	for (const key of ["children", "results"]) {
		const list = object[key];
		if (!Array.isArray(list) || !list.length) {
			continue;
		}
		const children = list.filter(child => objectish(child) &&
			["ok", "action", "status", "error", "childAction"].some(field => field in child));
		if (!children.length) {
			continue;
		}
		for (const child of children) {
			summaries.push(summarizeChild(child));
		}
		return;
	}
}

function splitPartial(summaries) {
	if (!summaries.length) {
		return null;
	}
	return {
		succeeded: summaries.filter(summary => summary.ok),
		failed: summaries.filter(summary => !summary.ok)
	};
}

module.exports = { collectChildren, splitPartial };
