//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Converts static ESM imports into compact namespace bindings while preserving live circular references where required.
 * @description The Awtsmoos lets one imported name remain connected to its source vessel even when module chambers fold into light;
 * Awtsmoos.com keeps import semantics isolated so circular classes, namespaces, and defaults remain stable and right.
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
		.map((specifier) => importSpecifierReplacement(
			record,
			specifier,
			sourceObject,
			mustBeLive
		))
		.filter(Boolean)
		.join("\n");
}

/** Rewrites one import specifier according to its ESM binding family and circular order. */
function importSpecifierReplacement(record, specifier, sourceObject, mustBeLive) {
	const local = specifier.local?.name;
	if (!local) {
		return "";
	}
	if (specifier.type === "ImportSpecifier") {
		const imported = specifier.imported?.name;
		if (!mustBeLive || isSuperclassImport(record.source, local)) {
			return `var ${local} = ${sourceObject}.${imported};`;
		}
		return `var ${local} = __awtsmoosLiveImport(() => ${sourceObject}, ${JSON.stringify(imported)});`;
	}
	if (specifier.type === "ImportDefaultSpecifier") {
		if (!mustBeLive || isSuperclassImport(record.source, local)) {
			return `var ${local} = ${sourceObject}.default;`;
		}
		return `var ${local} = __awtsmoosLiveImport(() => ${sourceObject}, "default");`;
	}
	if (specifier.type === "ImportNamespaceSpecifier") {
		return mustBeLive
			? `var ${local} = __awtsmoosLiveNamespace(() => ${sourceObject});`
			: `var ${local} = ${sourceObject};`;
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
