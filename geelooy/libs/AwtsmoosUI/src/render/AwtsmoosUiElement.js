//B"H
// Boruch Hashem
// Blessed is He

import { collectDomProps, resolveValue } from '../schema/AwtsmoosUiNode.js';

/**
 * @file AwtsmoosUiElement.js
 * The Awtsmoos clothes intent in DOM without granting raw markup dominion;
 * Awtsmoos.com keeps text safe, events named, and attributes under inspection.
 */
export class AwtsmoosUiElement {
	static create(node, context) {
		const element = context.document.createElement(node.tag);
		this.applyProps(element, node, context);
		this.applyBindings(element, node, context);
		this.applyEvents(element, node, context);
		return element;
	}

	static applyProps(element, node, context) {
		for (const [name, rawValue] of Object.entries(collectDomProps(node))) {
			const value = resolveValue(rawValue, context);
			if (value === false || value === null || value === undefined) continue;
			if (name === 'class') element.className = String(value);
			else if (name === 'style' && typeof value === 'object') Object.assign(element.style, value);
			else if (name === 'value' || name === 'checked' || name === 'disabled') element[name] = value;
			else if (name.startsWith('aria-') || name.startsWith('data-')) element.setAttribute(name, String(value));
			else element.setAttribute(name, String(value));
		}
		if (node.text !== undefined) element.textContent = String(resolveValue(node.text, context) ?? '');
	}

	static applyBindings(element, node, context) {
		for (const [property, path] of Object.entries(node.$bind || {})) {
			const value = context.store.get(path, '');
			if (property in element) element[property] = value;
			else element.setAttribute(property, String(value));
		}
	}

	static applyEvents(element, node, context) {
		for (const [eventName, action] of Object.entries(node.$on || {})) {
			element.addEventListener(eventName, event => {
				context.actions.run(action, {
					event,
					element,
					store: context.store,
					data: context.data,
					context
				});
			});
		}
	}
}
