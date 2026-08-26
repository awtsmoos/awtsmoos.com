//B"H
//Boruch Hashem
//Blessed is He

const {
	defaultLocalName,
	namesFromDeclaration
} = require("./declarationNames.js");
const {
	sourceForDefaultDeclaration,
	sourceForNamedDeclaration
} = require("./sourceDeclarations.js");

/**
 * @file Converts AST-recognized ESM exports into each compact module's frozen namespace vessel.
 * @description The Awtsmoos lets declarations, aliases, defaults, and re-exported rays remain public after source chambers fold into light;
 * Awtsmoos.com keeps export meaning independent from CRN resolution so identity grows stronger without changing what modules reveal right.
 */

/** Rewrites one named export declaration, local list, or source re-export. */
function namedExportReplacement(record, node) {
	const source = node.source?.value;
	if (source && (record.deps.has(source) || record.externalDeps.has(source))) {
		return sourceReexportReplacement(record, node);
	}
	if (node.declaration) {
		return declarationExportReplacement(record, node.declaration);
	}
	return specifierExportAssignments(node.specifiers, "");
}

/** Rewrites a source re-export using the already-resolved dependency namespace. */
function sourceReexportReplacement(record, node) {
	const source = node.source?.value;
	const dependency = record.deps.get(source)
		|| record.externalDeps.get(source);
	if (!dependency) {
		return "";
	}
	const specifiers = node.specifiers || [];
	if (!specifiers.length || specifiers.some((item) => item.type === "ExportAllDeclaration")) {
		return `Object.assign(__exports, ${dependency.id});`;
	}
	return specifiers
		.map((specifier) => {
			const local = specifier.local?.name;
			const exported = specifier.exported?.name;
			return local && exported
				? `__exports.${exported} = ${dependency.id}.${local};`
				: "";
		})
		.filter(Boolean)
		.join("\n");
}

/** Rewrites one export-star declaration into namespace assignment. */
function exportAllReplacement(record, node) {
	const source = node.source?.value;
	const dependency = record.deps.get(source)
		|| record.externalDeps.get(source);
	return dependency
		? `Object.assign(__exports, ${dependency.id});`
		: "";
}

/** Preserves the authored declaration, then publishes every declared binding. */
function declarationExportReplacement(record, declaration) {
	let text = sourceForNamedDeclaration(record, declaration);
	if (
		declaration.async
		&& declaration.type === "FunctionDeclaration"
		&& !/^async\b/.test(text.trim())
	) {
		text = `async ${text}`;
	}
	const assignments = namesFromDeclaration(declaration)
		.map((name) => `__exports.${name} = ${name};`)
		.join("\n");
	return assignments
		? `${text}\n${assignments}\n`
		: text;
}

/** Rewrites a local export list into namespace assignments. */
function specifierExportAssignments(specifiers, prefix) {
	return (specifiers || [])
		.map((specifier) => {
			const local = specifier.local?.name;
			const exported = specifier.exported?.name;
			return local && exported
				? `__exports.${exported} = ${prefix}${local};`
				: "";
		})
		.filter(Boolean)
		.join("\n");
}

/** Rewrites one default export while preserving named declarations and creating stable names for anonymous values. */
function defaultExportReplacement(record, node) {
	const declaration = node.declaration;
	const local = defaultLocalName(record, declaration);
	let source = sourceForDefaultDeclaration(record, declaration, node);
	if (declaration.async && /^function\b/.test(source.trim())) {
		source = `async ${source}`;
	}
	if (declaration.id?.name) {
		return `${source}\n__exports.default = ${local};`;
	}
	if (declaration.type === "Identifier") {
		return `__exports.default = ${local};`;
	}
	if (declaration.type === "FunctionExpression") {
		return `function ${local}${source.slice("function".length)}\n__exports.default = ${local};`;
	}
	if (declaration.type === "ClassExpression") {
		return `class ${local}${source.slice("class".length)}\n__exports.default = ${local};`;
	}
	return `const ${local} = ${source};\n__exports.default = ${local};`;
}

module.exports = {
	declarationExportReplacement,
	defaultExportReplacement,
	exportAllReplacement,
	namedExportReplacement,
	sourceReexportReplacement,
	specifierExportAssignments
};
