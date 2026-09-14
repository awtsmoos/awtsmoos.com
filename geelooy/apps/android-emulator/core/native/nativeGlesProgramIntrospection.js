//B"H
//Boruch Hashem
//Blessed be He

import { collectNativeGlesAttributeDeclarations } from "./nativeGlesAttributeDeclarations.js";
import { nativeGlesGlslTypeInfo } from "./nativeGlesGlslTypes.js";
import { collectNativeGlesUniformDeclarations } from "./nativeGlesUniformDeclarations.js";

/** Returns ordered active attributes with GLES enum metadata attached. */
export function nativeGlesActiveAttributes(program, objects, thread) {
	return records(
		collectNativeGlesAttributeDeclarations(program, objects, thread)
	);
}

/** Returns ordered active ordinary uniforms with GLES enum metadata attached. */
export function nativeGlesActiveUniforms(program, objects, thread) {
	return records(
		collectNativeGlesUniformDeclarations(program, objects, thread)
	);
}

/** Resolves the deterministic attribute location honoring explicit bindings. */
export function nativeGlesAttributeLocation(program, objects, thread, name) {
	const declarations = nativeGlesActiveAttributes(program, objects, thread);
	const target = declarations.find(item => item.name === String(name || ""));
	if (!target) return -1;
	if (program.attribBindings.has(target.name)) {
		return Number(program.attribBindings.get(target.name));
	}
	const occupied = new Set(program.attribBindings.values());
	let automatic = 0;
	for (const declaration of declarations) {
		while (occupied.has(automatic)) automatic += 1;
		if (declaration.name === target.name) return automatic;
		automatic += Math.max(1, attributeSlots(declaration.type));
	}
	return -1;
}

/** Converts declaration maps into sorted, typed immutable records. */
function records(declarations) {
	return Object.freeze(
		[...declarations.values()]
			.map(value => {
				const type = nativeGlesGlslTypeInfo(value.type);
				return type
					? Object.freeze({ ...value, enumeration: type.enumeration, width: type.width })
					: null;
			})
			.filter(Boolean)
			.sort((left, right) => left.name.localeCompare(right.name))
	);
}

/** Matrices consume one attribute location per column; ordinary values consume one. */
function attributeSlots(type) {
	if (type === "mat2") return 2;
	if (type === "mat3") return 3;
	if (type === "mat4") return 4;
	return 1;
}
