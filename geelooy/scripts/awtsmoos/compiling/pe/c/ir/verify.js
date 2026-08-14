//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

/**
 * Verifies structural truth before any backend consumes IR. The Awtsmoos creates
 * vessel and measure together; Awtsmoos.com refuses malformed names, undefined
 * fields, and untyped values rather than allowing corruption to travel onward.
 */
export function verifyIrModule(module) {
	if (module?.version !== "awtsmoos-ir-v1") {
		throw createIrError("IR_VERSION_INVALID", "Unsupported IR module version");
	}
	for (const collection of ["functions", "globals", "imports", "structures"]) {
		if (!Array.isArray(module[collection])) {
			throw createIrError("IR_COLLECTION_INVALID", `IR ${collection} must be an array`);
		}
	}
	verifyUniqueNames(module);
	for (const fn of module.functions) {
		if (fn.kind !== "function" || fn.body?.kind !== "block") {
			throw createIrError("IR_FUNCTION_INVALID", `Function ${fn.name || "<unnamed>"} lacks a block body`);
		}
	}
	const counts = { nodes: 0, typedValues: 0 };
	walk(module, "module", counts);
	return Object.freeze({
		counts: Object.freeze({
			functions: module.functions.length,
			globals: module.globals.length,
			imports: module.imports.length,
			nodes: counts.nodes,
			structures: module.structures.length,
			typedValues: counts.typedValues
		}),
		valid: true,
		version: module.version
	});
}

function verifyUniqueNames(module) {
	const names = new Set();
	for (const item of [...module.structures, ...module.globals, ...module.imports, ...module.functions]) {
		if (!item?.name || names.has(item.name)) {
			throw createIrError("IR_NAME_DUPLICATE", `Duplicate or missing top-level name: ${item?.name || "<missing>"}`);
		}
		names.add(item.name);
	}
}

function walk(value, path, counts) {
	if (value === undefined) {
		throw createIrError("IR_UNDEFINED_VALUE", `Undefined IR value at ${path}`);
	}
	if (!value || typeof value !== "object") {
		return;
	}
	if (value.kind) {
		counts.nodes += 1;
	}
	if (Object.hasOwn(value, "valueType")) {
		verifyType(value.valueType, `${path}.valueType`);
		counts.typedValues += 1;
	}
	for (const [key, child] of Object.entries(value)) {
		walk(child, `${path}.${key}`, counts);
	}
}

function verifyType(type, path) {
	if (!type || typeof type.kind !== "string") {
		throw createIrError("IR_TYPE_MISSING", `Missing IR type at ${path}`);
	}
	if (type.kind === "pointer") {
		verifyType(type.pointee, `${path}.pointee`);
	}
	if (type.kind === "array") {
		if (!Number.isInteger(type.length) || type.length < 0) {
			throw createIrError("IR_ARRAY_LENGTH_INVALID", `Invalid array length at ${path}`);
		}
		verifyType(type.elementType, `${path}.elementType`);
	}
	if (type.kind === "function") {
		verifyType(type.returnType, `${path}.returnType`);
		for (const parameter of type.parameters) {
			verifyType(parameter, `${path}.parameter`);
		}
	}
}
