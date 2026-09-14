//B"H
//Boruch Hashem
//Blessed be He

import { NATIVE_GLES_OBJECT_VALUES } from "./nativeGlesObjectValues.js";

/**
 * Extracts linked-program vertex attributes from attached vertex-shader source.
 * Built-in `gl_` names remain reserved and fixed array extents stay explicit.
 */
export function collectNativeGlesAttributeDeclarations(programRecord, objects, thread) {
	const declarations = new Map();
	for (const handle of programRecord.attached) {
		const outcome = objects.shader(handle, thread);
		if (!outcome.success
			|| outcome.record.type !== NATIVE_GLES_OBJECT_VALUES.VERTEX_SHADER) {
			continue;
		}
		mergeDeclarations(declarations, outcome.record.source);
	}
	return declarations;
}

/** Finds one active attribute by exact non-built-in name. */
export function findNativeGlesAttributeDeclaration(programRecord, objects, thread, name) {
	const key = String(name || "");
	if (!key || key.startsWith("gl_")) return null;
	return collectNativeGlesAttributeDeclarations(programRecord, objects, thread).get(key) || null;
}

/** Removes comments and extracts simple GLES2 `attribute type name[,name];` declarations. */
function mergeDeclarations(target, sourceValue) {
	const source = stripComments(String(sourceValue || ""));
	const pattern = /\battribute\s+(?:(?:lowp|mediump|highp)\s+)?([A-Za-z_]\w*)\s+([^;]+);/g;
	for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
		for (const fragment of match[2].split(",")) {
			addDeclaration(target, match[1], fragment);
		}
	}
}

/** Adds one scalar or fixed-array attribute declaration. */
function addDeclaration(target, type, fragmentValue) {
	const fragment = String(fragmentValue).trim();
	const match = /^([A-Za-z_]\w*)(?:\s*\[\s*(\d+)\s*\])?$/.exec(fragment);
	if (!match || match[1].startsWith("gl_")) return;
	const size = match[2] === undefined ? 1 : Math.max(1, Number(match[2]));
	target.set(match[1], Object.freeze({ name: match[1], size, type: String(type) }));
}

/** Strips line and block comments before declaration parsing. */
function stripComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, " ")
		.replace(/\/\/[^\n\r]*/g, " ");
}
