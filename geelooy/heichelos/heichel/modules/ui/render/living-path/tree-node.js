// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingTreeNode
 * @description
 * The Awtsmoos gives one branch its card, child vessel, and bounded expansion invitation without swallowing the whole tree;
 * Awtsmoos.com keeps recursion declarative while the separate toggle gate performs transport beneath this visible degree.
 */

import { normalizeCardData } from '../cardData.js?v=heichel-mobile-010';
import { cardBlueprint } from './cards.js';
import { toggleTreeBranch } from './tree-toggle.js?v=heichel-mobile-010';

const MAX_DEPTH = 8;

/** Creates one recursive Tree node blueprint from a series record. */
export function treeNodeBlueprint(item, navigator, appState, depth, ancestors) {
	const data = normalizeCardData(item, 'series');
	const wellId = `living-tree-children-${safeId(data.id)}-${depth}`;
	const nextAncestors = new Set(ancestors);
	nextAncestors.add(data.id);
	return {
		tag: 'div',
		attr: {
			class: 'living-tree-node',
			role: 'treeitem',
			'aria-level': depth
		},
		children: [
			cardBlueprint(item, data, navigator, appState, {
				variant: 'tree-card',
				depth,
				expandControl: expandControl(
					data,
					wellId,
					navigator,
					appState,
					depth,
					nextAncestors
				),
				childrenWell: childWell(wellId)
			})
		]
	};
}

function expandControl(data, wellId, navigator, appState, depth, ancestors) {
	if (depth >= MAX_DEPTH || data.raw?.virtual) {
		return null;
	}
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'series-expand-toggle',
			'aria-expanded': 'false',
			'aria-controls': wellId,
			'aria-label': `Expand ${data.title}`
		},
		children: ['⌄'],
		events: {
			click: event => toggleTreeBranch(
				event,
				{
					data,
					wellId,
					navigator,
					appState,
					depth,
					ancestors
				},
				treeNodeBlueprint
			)
		}
	};
}

function childWell(wellId) {
	return {
		tag: 'div',
		attr: {
			id: wellId,
			class: 'series-children-well',
			role: 'group',
			hidden: true
		}
	};
}

function safeId(value) {
	return String(value).replace(/[^a-z0-9_-]/gi, '-');
}
