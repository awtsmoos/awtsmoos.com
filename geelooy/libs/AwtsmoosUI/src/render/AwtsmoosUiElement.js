//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiElement.js
 * @description
 * The Awtsmoos clothes intent in DOM while Gevurah guards each executable gate;
 * Awtsmoos.com lets reactive UI stay expressive without letting generated data dictate unsafe fate.
 */

import { collectDomProps, resolveValue } from '../schema/AwtsmoosUiNode.js';
import {
	assertSafeAttributeName,
	assertSafeBindingName,
	assertSafeEventName,
	assertSafePropertyValue,
	assertSafeUiTag,
	normalizeSafeAttributeValue,
	normalizeUiStyleDeclaration
} from '../security/AwtsmoosUiSecurityPolicy.js';

const DIRECT_PROPERTIES = new Set(['checked', 'disabled', 'value']);

/** Creates one safe DOM element from a normalized declarative node. */
export class AwtsmoosUiElement {
	static create(node, context) {
		const element = context.document.createElement(assertSafeUiTag(node.tag));
		this.applyProps(element, node, context);
		this.applyBindings(element, node, context);
		this.applyEvents(element, node, context);
		return element;
	}

	/** Applies visible properties without crossing raw HTML, URL, or style sinks. */
	static applyProps(element, node, context) {
		for (const [name, rawValue] of Object.entries(collectDomProps(node))) {
			const value = resolveValue(rawValue, context);
			if (value === false || value === null || value === undefined) {
				continue;
			}
			this.applyProperty(element, name, value);
		}
		if (node.text !== undefined) {
			element.textContent = String(resolveValue(node.text, context) ?? '');
		}
	}

	/** Applies one visible property through the shared AwtsmoosUI policy. */
	static applyProperty(element, name, value) {
		if (name === 'class') {
			element.className = String(value);
			return;
		}
		if (name === 'style') {
			this.applyStyles(element, value);
			return;
		}
		if (DIRECT_PROPERTIES.has(name)) {
			element[name] = assertSafePropertyValue(name, value);
			return;
		}
		const safeName = assertSafeAttributeName(name);
		const safeValue = normalizeSafeAttributeValue(safeName, value);
		element.setAttribute(safeName, safeValue);
	}

	/** Applies a declarative style object through normalized setProperty calls. */
	static applyStyles(element, styles) {
		if (!styles || typeof styles !== 'object' || Array.isArray(styles)) {
			throw new TypeError('AwtsmoosUI style must be a declarative object.');
		}
		for (const [name, value] of Object.entries(styles)) {
			const [safeName, safeValue] = normalizeUiStyleDeclaration(name, value);
			element.style.setProperty(safeName, safeValue);
		}
	}

	/** Applies Store-backed bindings while blocking dangerous DOM sink properties. */
	static applyBindings(element, node, context) {
		for (const [property, path] of Object.entries(node.$bind || {})) {
			const safeProperty = assertSafeBindingName(property);
			const value = assertSafePropertyValue(safeProperty, context.store.get(path, ''));
			if (safeProperty in element) {
				element[safeProperty] = value;
			} else {
				const safeName = assertSafeAttributeName(safeProperty);
				element.setAttribute(safeName, normalizeSafeAttributeValue(safeName, value));
			}
		}
	}

	/** Binds only validated event names to the trusted named action registry. */
	static applyEvents(element, node, context) {
		for (const [eventName, action] of Object.entries(node.$on || {})) {
			const safeEventName = assertSafeEventName(eventName);
			element.addEventListener(safeEventName, event => {
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
