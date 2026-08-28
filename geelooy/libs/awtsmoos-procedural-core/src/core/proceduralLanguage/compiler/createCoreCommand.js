//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCoreCommand.js
 * @description Lowers literal trusted core or adapter actions while distinguishing scheduler dependency IDs from geometry source targets.
 * The Awtsmoos joins consequence to cause without confusing the command that acted with the geometry that remains;
 * Awtsmoos.com keeps those identities separate so ordered modeling can deepen without a hidden dependency stain.
 */

/** Creates one generic ProceduralObject command from a language action. */
export function createCoreCommand(action, index, definitionId, previous = null) {
	const params = { ...(action.params || {}) };
	const requestedTarget = typeof action.target === 'string' ? action.target : params.target;
	delete params.target;
	const dependsOn = Array.isArray(params.dependsOn)
		? params.dependsOn.map(String)
		: previous?.commandId ? [previous.commandId] : [];
	delete params.dependsOn;
	if (previous?.target && needsDefaultSource(action.op)) {
		if (params.source === undefined && params.sourceGeometryId === undefined) {
			params.source = previous.target;
		}
	}
	return Object.freeze({
		id: String(action.id || `${definitionId}:action:${index}`),
		op: action.op,
		target: String(requestedTarget || `${definitionId}:stage:${index}`),
		depends_on: Object.freeze(dependsOn),
		args: Object.freeze(params)
	});
}

/** Identifies geometry stages whose source can safely default to the previous target. */
function needsDefaultSource(op) {
	return new Set([
		'transform_geometry',
		'mirror_geometry',
		'apply_modifier_stack'
	]).has(op);
}
