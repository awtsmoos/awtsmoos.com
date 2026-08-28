//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file importTransform.js
 * @description Converts static ESM imports into block-scoped compact bindings while preserving live circular references where required.
 * The Awtsmoos lets one imported name remain joined to its source without leaking into a neighboring module's finite chamber;
 * Awtsmoos.com keeps each folded module's bindings block-scoped and read-only, so Vec3, Aabb, classes, functions, namespaces, and defaults remain stable and right.
 */

/** Replaces one ImportDeclaration with compact local/external namespace bindings. */
function importReplacement(record, node) {
	const source = node.source?.value;
	const dependency = record.deps.get(source);
	const external = record.externalDeps.get(source);
	const sourceObject = (dependency || external || {}).id;
	if (!sourceObject) {
		return record.source.slice(node.start, node.end);
	}
	const mustBeLive = Boolean(
		dependency
		&& dependency.orderIndex > record.orderIndex
	);
	return (node.specifiers || [])
		.map(specifier => importSpecifierReplacement(
			record,
			specifier,
			sourceObject,
			mustBeLive
		))
		.filter(Boolean)
		.join("\n");
}

/** Rewrites one import specifier as an ESM-like block-scoped immutable binding. */
function importSpecifierReplacement(record, specifier, sourceObject, mustBeLive) {
	const local = specifier.local?.name;
	if (!local) {
		return "";
	}
	if (specifier.type === "ImportSpecifier") {
		const imported = specifier.imported?.name;
		if (!mustBeLive || isSuperclassImport(record.source, local)) {
			return `const ${local} = ${sourceObject}.${imported};`;
		}
		return `const ${local} = __awtsmoosLiveImport(() => ${sourceObject}, ${JSON.stringify(imported)});`;
	}
	if (specifier.type === "ImportDefaultSpecifier") {
		if (!mustBeLive || isSuperclassImport(record.source, local)) {
			return `const ${local} = ${sourceObject}.default;`;
		}
		return `const ${local} = __awtsmoosLiveImport(() => ${sourceObject}, "default");`;
	}
	if (specifier.type === "ImportNamespaceSpecifier") {
		return mustBeLive
			? `const ${local} = __awtsmoosLiveNamespace(() => ${sourceObject});`
			: `const ${local} = ${sourceObject};`;
	}
	return "";
}

/** Detects superclass use where a Proxy live binding cannot safely stand in the `extends` position. */
function isSuperclassImport(source, local) {
	const escaped = String(local).replace(
		/[.*+?^${}()|[\]\\]/g,
		"\\$&"
	);
	return new RegExp(`extends\\s+${escaped}\\b`)
		.test(source || "");
}

module.exports = {
	importReplacement,
	importSpecifierReplacement,
	isSuperclassImport
};
