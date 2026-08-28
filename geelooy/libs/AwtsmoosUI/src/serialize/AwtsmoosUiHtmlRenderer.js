//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiHtmlRenderer.js
 * @description
 * The Awtsmoos renews semantic trees even where no browser has yet taken form;
 * Awtsmoos.com serializes safe visible markup while events and bindings remain outside the storm.
 */

import { normalizeUiNode, resolveValue } from '../schema/AwtsmoosUiNode.js';
import { escapeUiHtml } from '../security/AwtsmoosUiSecurityPolicy.js';
import { serializeUiHtmlAttributes } from './AwtsmoosUiHtmlAttributes.js';

const VOID_TAGS = new Set([
	'area',
	'br',
	'col',
	'hr',
	'img',
	'input',
	'source',
	'track',
	'wbr'
]);

/** Safe string renderer mirroring the canonical reactive node semantics. */
export class AwtsmoosUiHtmlRenderer {
	/**
	 * Renders one schema into escaped HTML without serializing executable behaviors.
	 *
	 * @param {*} schema Declarative AwtsmoosUI schema.
	 * @param {object} [context={}] Store/data context for dynamic values.
	 * @returns {string} Safe HTML string.
	 */
	render(schema, context = {}) {
		return this.build(schema, context);
	}

	/** Recursively manifests conditions, repetitions, fragments, text, and elements as HTML. */
	build(rawNode, context) {
		const node = normalizeUiNode(rawNode);
		if (!node) {
			return '';
		}
		if (node.$when !== undefined && !resolveValue(node.$when, context)) {
			return '';
		}
		if (node.$each) {
			return this.buildEach(node, context);
		}
		if (node.tag === '#text') {
			return escapeUiHtml(resolveValue(node.text, context));
		}
		if (node.tag === '#fragment') {
			return this.buildChildren(node.children, context);
		}
		return this.buildElement(node, context);
	}

	/** Expands a repeated node while preserving the parent data chain. */
	buildEach(node, context) {
		const items = resolveValue(node.$each.items, context) || [];
		return [...items].map((item, index) => {
			const child = {
				...node,
				$each: undefined
			};
			return this.build(child, {
				...context,
				data: {
					item,
					index,
					parent: context.data
				}
			});
		}).join('');
	}

	/** Serializes one ordinary element through the shared attribute security policy. */
	buildElement(node, context) {
		const attributes = serializeUiHtmlAttributes(node, context);
		if (VOID_TAGS.has(node.tag)) {
			return `<${node.tag}${attributes}>`;
		}
		const text = node.text === undefined ? '' : escapeUiHtml(resolveValue(node.text, context));
		const children = this.buildChildren(node.children, context);
		return `<${node.tag}${attributes}>${text}${children}</${node.tag}>`;
	}

	/** Serializes children without introducing wrapper markup. */
	buildChildren(children, context) {
		return (children || []).map(child => this.build(child, context)).join('');
	}
}
