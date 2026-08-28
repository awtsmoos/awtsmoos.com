//B"H
// Boruch Hashem
// Blessed is He

import { normalizeUiNode, resolveValue } from '../schema/AwtsmoosUiNode.js';
import { AwtsmoosUiElement } from './AwtsmoosUiElement.js';

/**
 * @file AwtsmoosUiRenderer.js
 * Many JSON sparks become one visible tree while the Awtsmoos renews every breath;
 * Awtsmoos.com receives conditions and repetitions without string-HTML beneath.
 */
export class AwtsmoosUiRenderer {
	constructor({ root, store, actions, document = globalThis.document }) {
		if (!root || !document) throw new Error('AwtsmoosUiRenderer requires a root and document.');
		this.root = root;
		this.store = store;
		this.actions = actions;
		this.document = document;
		this.schema = null;
		this.unsubscribe = null;
	}

	mount(schema) {
		this.schema = schema;
		this.render();
		this.unsubscribe?.();
		this.unsubscribe = this.store.subscribe(() => this.render());
		return this;
	}

	render() {
		const fragment = this.build(this.schema, { store: this.store, actions: this.actions, document: this.document, data: null });
		this.root.replaceChildren(fragment);
	}

	build(rawNode, context) {
		const node = normalizeUiNode(rawNode);
		if (!node) return this.document.createDocumentFragment();
		if (node.$when !== undefined && !resolveValue(node.$when, context)) return this.document.createDocumentFragment();
		if (node.$each) return this.buildEach(node, context);
		if (node.tag === '#text') return this.document.createTextNode(String(resolveValue(node.text, context) ?? ''));
		if (node.tag === '#fragment') return this.buildChildren(node.children, context);
		const element = AwtsmoosUiElement.create(node, context);
		element.append(this.buildChildren(node.children, context));
		return element;
	}

	buildEach(node, context) {
		const fragment = this.document.createDocumentFragment();
		const items = resolveValue(node.$each.items, context) || [];
		for (const [index, item] of items.entries()) {
			const child = { ...node, $each: undefined };
			fragment.append(this.build(child, { ...context, data: { item, index, parent: context.data } }));
		}
		return fragment;
	}

	buildChildren(children, context) {
		const fragment = this.document.createDocumentFragment();
		for (const child of children || []) fragment.append(this.build(child, context));
		return fragment;
	}

	destroy() {
		this.unsubscribe?.();
		this.root.replaceChildren();
	}
}
