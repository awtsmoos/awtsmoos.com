//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Reveals declaration-bound names and stable synthetic default symbols for CompactJS export transformation.
 * @description The Awtsmoos lets identifiers emerge from patterns while anonymous defaults receive one deterministic name of light;
 * Awtsmoos.com keeps naming law separate from source slicing so export vessels remain readable, reusable, and right.
 */

/** Returns every binding name introduced by one declaration node. */
function namesFromDeclaration(declaration) {
	if (!declaration) {
		return [];
	}
	if (declaration.id?.name) {
		return [declaration.id.name];
	}
	if (!Array.isArray(declaration.declarations)) {
		return [];
	}
	const names = [];
	for (const item of declaration.declarations) {
		addPatternNames(item.id, names);
	}
	return names;
}

/** Recursively reveals names from identifier, array, object, and rest binding patterns. */
function addPatternNames(node, names) {
	if (!node) {
		return;
	}
	if (node.type === "Identifier" && node.name) {
		names.push(node.name);
	}
	if (Array.isArray(node.elements)) {
		node.elements.forEach((item) => addPatternNames(item, names));
	}
	if (Array.isArray(node.properties)) {
		node.properties.forEach((item) => {
			addPatternNames(item.value || item.argument, names);
		});
	}
}

/** Chooses the authored default name when available, otherwise a stable file-derived symbol. */
function defaultLocalName(record, declaration) {
	if (declaration?.id?.name) {
		return declaration.id.name;
	}
	if (declaration?.type === "Identifier" && declaration.name) {
		return declaration.name;
	}
	return defaultSymbolForFile(record.filePath);
}

/** Produces one deterministic identifier for anonymous default exports. */
function defaultSymbolForFile(filePath) {
	let hash = 0;
	for (const char of String(filePath || "")) {
		hash = (
			(hash << 5)
			- hash
			+ char.charCodeAt(0)
		) >>> 0;
	}
	return `__awtsmoosDefault_${hash.toString(36)}`;
}

module.exports = {
	addPatternNames,
	defaultLocalName,
	defaultSymbolForFile,
	namesFromDeclaration
};
