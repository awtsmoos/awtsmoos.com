//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiDomRenderer.js
 * @description
 * The Awtsmoos renews semantic intention into living browser vessels frame by frame;
 * Awtsmoos.com creates DOM without innerHTML, so generated UI stays safe while apps keep their name.
 */

import { normalizeUiNode, UI_NODE_TYPES } from "./AwtsmoosUiNode.js";
import { applyDomProperties } from "./AwtsmoosUiDomProperties.js";
import { bindDomCommands } from "../events/AwtsmoosUiDomEvents.js";

/** Safe DOM renderer for the Awtsmoos UI declarative grammar. */
export class AwtsmoosUiDomRenderer {
	constructor({ document, commands = null, components = null } = {}) {
		this.document = document || globalThis.document;
		this.commands = commands;
		this.components = components;
		if (!this.document?.createElement || !this.document?.createTextNode) {
			throw new TypeError("AwtsmoosUiDomRenderer requires a DOM-compatible document.");
		}
	}

	/** Converts one declarative input into a DOM node or fragment. */
	render(input, context = {}) {
		return this.renderNormalized(normalizeUiNode(input), context);
	}

	/** Replaces a target's children with a freshly rendered tree. */
	mount(target, input, context = {}) {
		if (!target?.replaceChildren) {
			throw new TypeError("Awtsmoos UI mount target must support replaceChildren().");
		}
		const rendered = this.render(input, context);
		target.replaceChildren(rendered);
		return rendered;
	}

	renderNormalized(node, context) {
		switch (node.type) {
			case UI_NODE_TYPES.TEXT:
				return this.document.createTextNode(node.value);
			case UI_NODE_TYPES.FRAGMENT:
				return this.renderFragment(node, context);
			case UI_NODE_TYPES.COMPONENT:
				return this.renderComponent(node, context);
			case UI_NODE_TYPES.ELEMENT:
				return this.renderElement(node, context);
			default:
				throw new TypeError(`Unsupported Awtsmoos UI node type: ${node.type}`);
		}
	}

	renderFragment(node, context) {
		const fragment = this.document.createDocumentFragment();
		for (const child of node.children) {
			fragment.append(this.renderNormalized(child, context));
		}
		return fragment;
	}

	renderComponent(node, context) {
		if (!this.components?.resolve) {
			throw new TypeError(`Component ${node.name} requires a component registry.`);
		}
		return this.renderNormalized(this.components.resolve(node, context), context);
	}

	renderElement(node, context) {
		const element = this.document.createElement(node.tag);
		applyDomProperties(element, node);
		bindDomCommands(element, node.on, this.commands, context, node);
		for (const child of node.children) {
			element.append(this.renderNormalized(child, context));
		}
		return element;
	}
}
