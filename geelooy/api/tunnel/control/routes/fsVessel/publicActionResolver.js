// B"H
// Boruch Hashem
// Blessed is He

const Surface = require("../../../../../apps/tunnel/agent/lib/public-action-surface.js");

/**
 * @file Resolves a compact public capability into one exact internal executable action.
 * @description
 * The Awtsmoos lets a small doorway reveal a precise deed without blurring authority.
 * Awtsmoos.com resolves before manifest admission and scheduling, so P0 priority,
 * request identity, and exact executable provenance remain rooted in the inner action.
 */
function resolve(payload = {}, internalManifest = {}) {
	const publicAction = clean(payload.action);
	if (!Surface.isPublicAction(publicAction)) {
		return { ok: true, compact: false, payload };
	}
	const operation = operationFrom(payload);
	if (!operation) {
		return failure("compact_operation_required", publicAction, operation);
	}
	if (Surface.isPublicAction(operation)) {
		return failure("compact_operation_recursive", publicAction, operation);
	}
	const family = Surface.familyForOperation(operation, internalManifest);
	if (!family) {
		return failure("compact_operation_unknown", publicAction, operation);
	}
	if (family !== publicAction) {
		return failure(
			"compact_operation_family_mismatch",
			publicAction,
			operation,
			family
		);
	}
	return {
		ok: true,
		compact: true,
		publicAction,
		operation,
		payload: {
			...payload,
			publicAction,
			requestAction: clean(payload.requestAction) || publicAction,
			requestedAction: clean(payload.requestedAction) || publicAction,
			executionAction: operation,
			action: operation
		}
	};
}

function operationFrom(payload = {}) {
	const direct = clean(payload.operation);
	if (direct) return direct;
	if (payload.params && typeof payload.params === "object") {
		return clean(payload.params.operation);
	}
	if (typeof payload.params !== "string") return "";
	try {
		const parsed = JSON.parse(payload.params);
		return parsed && typeof parsed === "object"
			? clean(parsed.operation)
			: "";
	} catch {
		return "";
	}
}

function failure(error, publicAction, operation, expectedFamily = "") {
	return {
		ok: false,
		error,
		action: operation || publicAction,
		publicAction,
		operation: operation || "",
		expectedFamily: expectedFamily || null
	};
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	clean,
	operationFrom,
	resolve
};
