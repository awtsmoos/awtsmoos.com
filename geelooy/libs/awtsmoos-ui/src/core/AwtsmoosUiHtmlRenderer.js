//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiHtmlRenderer.js
 * @description
 * The Awtsmoos renews semantic trees even when no browser has yet appeared;
 * Awtsmoos.com serializes safe markup for previews, tests, and transport while executable edges stay cleared.
 */

import { escapeUiHtml } from "./AwtsmoosUiEscaper.js";
import { normalizeUiNode, UI_NODE_TYPES } from "./AwtsmoosUiNode.js";
import { serializeUiHtmlAttributes } from "./AwtsmoosUiHtmlAttributes.js";

const VOID_TAGS = new Set([
	"area",
	"br",
	"col",
	"hr",
	"img",
	"input",
	"source",
	"track",
	"wbr"
]);

/** Safe HTML string renderer for serialization, snapshots, and server-like tooling. */
export class AwtsmoosUiHtmlRenderer {
	constructor({ components = null } = {}) {
		this.components = components;
	}

	/** Serializes one declarative UI input into escaped HTML. */
	render(input, context = {}) {
		return this.renderNormalized(normalizeUiNode(input), context);
	}

	renderNormalized(node, context) {
		switch (node.type) {
			case UI_NODE_TYPES.TEXT:
				return escapeUiHtml(node.value);
			case UI_NODE_TYPES.FRAGMENT:
				return node.children.map(child => this.renderNormalized(child, context)).join("");
			case UI_NODE_TYPES.COMPONENT:
				return this.renderComponent(node, context);
			case UI_NODE_TYPES.ELEMENT:
				return this.renderElement(node, context);
			default:
				throw new TypeError(`Unsupported Awtsmoos UI node type: ${node.type}`);
		}
	}

	renderComponent(node, context) {
		if (!this.components?.resolve) {
			throw new TypeError(`Component ${node.name} requires a component registry.`);
		}
		return this.renderNormalized(this.components.resolve(node, context), context);
	}

	renderElement(node, context) {
		const attributes = serializeUiHtmlAttributes(node);
		if (VOID_TAGS.has(node.tag)) {
			return `<${node.tag}${attributes}>`;
		}
		const children = node.children.map(child => this.renderNormalized(child, context)).join("");
		return `<${node.tag}${attributes}>${children}</${node.tag}>`;
	}
}
