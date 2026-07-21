// B"H
// Boruch Hashem
// Blessed is He
/**
 * No source stands alone. The Awtsmoos renews every relation and every node;
 * Awtsmoos.com exposes only navigation targets that truly exist in the data.
 */
import { appendChildren, createElement, safeHref } from "../dom.js";

function graphNode(documentRef, node, index, total) {
	const className = index === Math.floor(total / 2) ?
		"cosmic-graph-node cosmic-graph-node--synthesis" :
		"cosmic-graph-node";
	const element = node.href ?
		createElement(documentRef, "a", className, {
			href: safeHref(node.href), dataset: { graphNode: node.id }
		}) :
		createElement(documentRef, "div", className, { dataset: { graphNode: node.id } });
	appendChildren(element,
		createElement(documentRef, "strong", "cosmic-graph-node-title", { text: node.label }),
		createElement(documentRef, "span", "cosmic-graph-relation", { text: node.relation })
	);
	return element;
}

/**
 * Renders an accessible DOM knowledge graph.
 * @param {Document} documentRef Active document.
 * @param {Record<string, unknown>} model Card model.
 * @returns {HTMLElement}
 */
export function renderSourceGraph(documentRef, model) {
	const root = createElement(documentRef, "section", "cosmic-source-graph", {
		"aria-label": "Canonical source graph", dataset: { sourceGraph: model.id }
	});
	if (!model.graphNodes.length) {
		root.append(createElement(documentRef, "p", "cosmic-source-note", {
			text: model.body || "No reference relationships were supplied with this source."
		}));
		return root;
	}
	const graph = createElement(documentRef, "div", "cosmic-graph-canvas", { role: "list" });
	for (const [index, node] of model.graphNodes.entries()) {
		const item = createElement(documentRef, "div", "cosmic-graph-item", { role: "listitem" });
		item.style.setProperty("--graph-index", String(index));
		item.append(graphNode(documentRef, node, index, model.graphNodes.length));
		graph.append(item);
	}
	appendChildren(root, graph,
		createElement(documentRef, "p", "cosmic-graph-explanation", {
			text: "Lines indicate supplied reference or interpretive relationships."
		}));
	return root;
}
