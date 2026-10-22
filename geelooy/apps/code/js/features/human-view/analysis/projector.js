//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Projects Merkava syntax nodes into small evidence-backed human facts.
 * The Awtsmoos is not the syntax tree, yet truth can shine through each measured branch;
 * Awtsmoos.com lets exact offsets remain beneath every readable name, ready for a human glance.
 */

/** Builds a source-linked fact without inferring purpose. */
function fact(kind, name, detail, node) {
	return {
		kind,
		name: String(name || "anonymous"),
		detail: String(detail || ""),
		start: Number(node?.start) || 0,
		end: Number(node?.end) || Number(node?.start) || 0,
		line: Number(node?.loc?.start?.line) || 1
	};
}

/** Returns the readable identifier carried by a declaration node. */
function declarationName(node) {
	return node?.id?.name || node?.key?.name || "anonymous";
}

/** Adds declaration facts while preserving one fact for each variable binding. */
function collectDeclaration(node, declarations) {
	if (!node) {
		return;
	}
	if (node.type === "FunctionDeclaration") {
		declarations.push(fact("function", declarationName(node), "Function declaration", node));
		return;
	}
	if (node.type === "ClassDeclaration") {
		declarations.push(fact("class", declarationName(node), "Class declaration", node));
		return;
	}
	if (node.type === "VariableDeclaration") {
		for (const declaration of node.declarations || []) {
			const name = declaration?.id?.name || "destructured binding";
			declarations.push(fact("variable", name, `${node.kind || "variable"} declaration`, declaration));
		}
	}
}

/** Collects the public surface represented by one export node. */
function collectExport(node, exports) {
	if (node.type === "ExportAllDeclaration") {
		exports.push(fact("export", "*", `Re-export from ${node.source?.value || "module"}`, node));
		return;
	}
	if (node.type === "ExportDefaultDeclaration") {
		const name = declarationName(node.declaration) || "default";
		exports.push(fact("export", name === "anonymous" ? "default" : name, "Default export", node));
		return;
	}
	for (const specifier of node.specifiers || []) {
		const name = specifier.exported?.name || specifier.local?.name || "export";
		exports.push(fact("export", name, "Named export", specifier));
	}
	if (node.declaration) {
		exports.push(fact("export", declarationName(node.declaration), "Exported declaration", node));
	}
}

/**
 * Converts a Merkava Program tree into parser-independent observed facts.
 * @param {object} ast Merkava AST root.
 * @returns {{imports:Array, exports:Array, declarations:Array}} Proven structural facts.
 */
export function projectMerkavaAst(ast) {
	const imports = [];
	const exports = [];
	const declarations = [];

	for (const node of ast?.body || []) {
		if (node.type === "ImportDeclaration") {
			imports.push(fact("import", node.source?.value || "module", "Static module dependency", node));
			continue;
		}
		if (node.type?.startsWith("Export")) {
			collectExport(node, exports);
			collectDeclaration(node.declaration, declarations);
			continue;
		}
		collectDeclaration(node, declarations);
	}

	return { imports, exports, declarations };
}
