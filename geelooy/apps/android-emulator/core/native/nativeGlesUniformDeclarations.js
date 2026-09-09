//B"H
//Boruch Hashem
//Blessed is He

/**
 * Extracts ordinary GLSL ES uniform declarations from attached shader source.
 * The Awtsmoos reads declared names and fixed array extents without pretending uniform
 * blocks are scalar locations; Awtsmoos.com can therefore return -1 for absent names.
 */
export function collectNativeGlesUniformDeclarations(programRecord, objects, thread) {
	const declarations = new Map();
	for (const handle of programRecord.attached) {
		const outcome = objects.shader(handle, thread);
		if (!outcome.success) continue;
		mergeShaderDeclarations(declarations, outcome.record.source);
	}
	return declarations;
}

/** Resolves one queried name to a canonical scalar/array-element name or null. */
export function resolveNativeGlesUniformName(declarations, requestedName) {
	const requested = String(requestedName || "");
	if (!requested || requested.startsWith("gl_")) return null;
	const match = /^([A-Za-z_]\w*)(?:\[(\d+)\])?$/.exec(requested);
	if (!match) return null;
	const record = declarations.get(match[1]);
	if (!record) return null;
	const index = match[2] === undefined ? 0 : Number(match[2]);
	if (index < 0 || index >= record.size) return null;
	if (record.size === 1) return index === 0 ? match[1] : null;
	return `${match[1]}[${index}]`;
}

/** Removes comments and merges each simple `uniform type name[, name];` declaration. */
function mergeShaderDeclarations(target, sourceValue) {
	const source = stripComments(String(sourceValue || ""));
	const pattern = /\buniform\s+(?:(?:lowp|mediump|highp)\s+)?([A-Za-z_]\w*)\s+([^;{]+);/g;
	for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
		for (const fragment of match[2].split(",")) addDeclaration(target, match[1], fragment);
	}
}

/** Adds one scalar or fixed-size array declaration while preserving its GLSL type. */
function addDeclaration(target, type, fragmentValue) {
	const fragment = String(fragmentValue).trim();
	const match = /^([A-Za-z_]\w*)(?:\s*\[\s*(\d+)\s*\])?$/.exec(fragment);
	if (!match) return;
	const size = match[2] === undefined ? 1 : Math.max(1, Number(match[2]));
	target.set(match[1], Object.freeze({ name: match[1], size, type: String(type) }));
}

/** Strips line/block comments so commented-out declarations never become live locations. */
function stripComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n\r]*/g, " ");
}
