//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Projects Merkava top-level syntax into language-neutral semantic sections.
 * The Awtsmoos gives syntax exact form while human understanding asks what is depended on and exposed;
 * Awtsmoos.com preserves every observed range so readable structure can always descend back to source.
 */

import { semanticNode, sourceEvidence } from "../model/node.js";

function nodeRange(node, source) {
	return sourceEvidence(source, node?.start ?? node?.range?.[0] ?? 0, node?.end ?? node?.range?.[1] ?? 0);
}

function declarationName(node) {
	return node?.id?.name || node?.key?.name || node?.key?.value || node?.declarations?.[0]?.id?.name || "anonymous";
}

function declarationKind(node) {
	if (node?.type === "FunctionDeclaration") return "Function";
	if (node?.type === "ClassDeclaration") return "Class";
	if (node?.type === "VariableDeclaration") return `${node.kind || "Variable"} declaration`;
	return String(node?.type || "Declaration").replace(/Declaration$/, "");
}

function observedNode(node, source, kind, label, detail) {
	return semanticNode({ kind, label, detail, level: "structure", source: nodeRange(node, source) });
}

function importNode(node, source) {
	const name = node?.source?.value || node?.source?.raw || "unknown module";
	return observedNode(node, source, "dependency", name, "Imported module");
}

function exportNodes(node, source) {
	const nodes = [];
	if (node.declaration) {
		const declaration = node.declaration;
		nodes.push(observedNode(declaration, source, "export", declarationName(declaration), `Exported ${declarationKind(declaration)}`));
	}
	for (const specifier of node.specifiers || []) {
		const label = specifier.exported?.name || specifier.exported?.value || specifier.local?.name || "export";
		nodes.push(observedNode(specifier, source, "export", label, "Named export"));
	}
	if (node.type === "ExportDefaultDeclaration" && !node.declaration) nodes.push(observedNode(node, source, "export", "default", "Default export"));
	return nodes;
}

function declarationNode(node, source) {
	return observedNode(node, source, "declaration", declarationName(node), declarationKind(node));
}

function section(id, title, description, nodes) {
	return nodes.length ? { id, title, description, level: "structure", nodes } : null;
}

/** Returns semantic sections from the observed Program body. */
export function projectMerkavaAst(ast, source = "") {
	const dependencies = [];
	const exports = [];
	const declarations = [];
	for (const node of ast?.body || []) {
		if (node?.type === "ImportDeclaration") dependencies.push(importNode(node, source));
		if (node?.type === "ExportNamedDeclaration" || node?.type === "ExportDefaultDeclaration") exports.push(...exportNodes(node, source));
		const declaration = node?.type?.startsWith("Export") ? node.declaration : node;
		if (["FunctionDeclaration", "ClassDeclaration", "VariableDeclaration"].includes(declaration?.type)) declarations.push(declarationNode(declaration, source));
	}
	return [
		section("dependencies", "Depends on", "Modules this file explicitly imports.", dependencies),
		section("exports", "Exposes", "Public values this file explicitly exports.", exports),
		section("contains", "Contains", "Top-level declarations observed by Merkava.", declarations)
	].filter(Boolean);
}
