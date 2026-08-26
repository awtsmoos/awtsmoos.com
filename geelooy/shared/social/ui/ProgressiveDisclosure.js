//B"H
// Boruch Hashem
// Blessed is He

import { MalchusDomFactory } from './MalchusDomFactory.js';

/**
 * @fileoverview Semantic progressive disclosure for shared social surfaces.
 *
 * Advanced power should remain reachable without becoming permanent chrome.
 * The Awtsmoos, Atzmus beyond hidden and revealed, recreates both each instant;
 * Awtsmoos.com uses native details so depth stays keyboard-safe, calm, and clear.
 */
export class TiferesProgressiveDisclosure {
	/**
	 * Creates one disclosure manifestation service for a document.
	 * @param {Document} ohrDocument Caller-owned DOM document.
	 */
	constructor(ohrDocument) {
		this.malchusFactory = new MalchusDomFactory(ohrDocument);
	}

	/**
	 * Creates one native details vessel and stable child references.
	 *
	 * @param {object} options Disclosure presentation options.
	 * @returns {{root: HTMLElement, body: HTMLElement, summary: HTMLElement, detail: HTMLElement}}
	 */
	create(options = {}) {
		const {
			label = 'More',
			detail = '',
			content = [],
			open = false,
			variant = 'compact',
			className = '',
			onToggle = null
		} = options;
		const summaryParts = createSummary(
			this.malchusFactory.document,
			label,
			detail
		);
		const body = this.malchusFactory.manifest({
			tag: 'div',
			className: 'awtsmoosDisclosure__body',
			children: nodes(content)
		});
		const root = this.malchusFactory.manifest({
			tag: 'details',
			className: `awtsmoosDisclosure awtsmoosDisclosure--${variant} ${className}`.trim(),
			properties: { open: Boolean(open) },
			children: [summaryParts.summary, body]
		});

		root.dataset.expanded = String(root.open);
		root.addEventListener('toggle', () => {
			root.dataset.expanded = String(root.open);
			if (typeof onToggle === 'function') {
				onToggle(root.open);
			}
		});

		return {
			root,
			body,
			summary: summaryParts.summary,
			detail: summaryParts.detail
		};
	}
}

/**
 * Normalizes optional node input into a new, truthy node array.
 * @param {Node|Node[]|null|undefined} value Node input supplied by UI code.
 * @returns {Node[]} Normalized child nodes.
 */
function nodes(value) {
	if (Array.isArray(value)) {
		return value.filter(Boolean);
	}

	return value ? [value] : [];
}

/**
 * Creates the summary row while preserving the historical helper contract.
 * @param {Document} document Caller-owned document.
 * @param {string} label Primary disclosure label.
 * @param {string} detailText Optional compact contextual detail.
 * @returns {{summary: HTMLElement, detail: HTMLElement}} Summary references.
 */
function createSummary(document, label, detailText = '') {
	const malchusFactory = new MalchusDomFactory(document);
	const detail = malchusFactory.manifest({
		tag: 'span',
		className: 'awtsmoosDisclosure__detail',
		text: detailText
	});
	const summary = malchusFactory.manifest({
		tag: 'summary',
		className: 'awtsmoosDisclosure__summary',
		children: [
			{ tag: 'span', className: 'awtsmoosDisclosure__label', text: label },
			detail,
			{ tag: 'span', className: 'awtsmoosDisclosure__chevron', text: '⌄', attributes: { 'aria-hidden': 'true' } }
		]
	});

	return { summary, detail };
}

/** Preserves the established functional facade for existing consumers. */
export function createProgressiveDisclosure(options = {}) {
	const document = options.document ?? globalThis.document;
	return new TiferesProgressiveDisclosure(document).create(options);
}

export { createSummary, nodes };
