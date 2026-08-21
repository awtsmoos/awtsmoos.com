// B"H
// Boruch Hashem
// Blessed is He

const Manifest = require("./registration-manifest.js");
const Surface = require("./public-action-surface.js");

/**
 * @file Resolves compact local capability calls while preserving exact legacy execution.
 * @description
 * The Awtsmoos lets fourteen public names open the correct inner gate without erasing
 * any older exact path. Awtsmoos.com validates family and operation before dispatch,
 * while legacy callers still meet the same guarded handlers they have always known.
 */
function resolve(body = {}, deps = {}) {
	const requested = clean(
		body.name
		|| body.action
		|| body.tool
		|| body.function?.name
	);
	const argumentsValue = body.arguments || body.args || body.payload || {};
	const config = deps.configLoader();
	const manifest = Manifest.actionInventory(config);
	if (!Surface.isPublicAction(requested)) {
		return legacyPayload(requested, argumentsValue, body, manifest);
	}
	const operation = clean(argumentsValue.operation || body.operation);
	if (!operation) return failure("compact_operation_required", requested, operation);
	if (Surface.isPublicAction(operation)) {
		return failure("compact_operation_recursive", requested, operation);
	}
	const family = Surface.familyForOperation(operation, manifest);
	if (!family) return failure("compact_operation_unknown", requested, operation);
	if (family !== requested) {
		return failure("compact_operation_family_mismatch", requested, operation, family);
	}
	return {
		ok: true,
		payload: {
			...argumentsValue,
			publicAction: requested,
			requestAction: requested,
			executionAction: operation,
			action: operation,
			kind: Surface.kindForOperation(operation, manifest) || "fs"
		}
	};
}

function legacyPayload(action, argumentsValue, body, manifest) {
	return {
		ok: true,
		payload: {
			...argumentsValue,
			action,
			kind: body.kind
				|| Surface.kindForOperation(action, manifest)
				|| "fs"
		}
	};
}

function failure(error, publicAction, operation, expectedFamily = "") {
	return {
		ok: false,
		error,
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
	legacyPayload,
	resolve
};
