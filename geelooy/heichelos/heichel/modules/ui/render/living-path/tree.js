// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathTreeRenderer
 * @description
 * The Awtsmoos manifests the current branch as a clear tree while node recursion lives in its own bounded vessel;
 * Awtsmoos.com keeps this coordinator small, so empty-state policy and real children cannot blur into one confused level.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { emptyStateBlueprint } from './empty-state.js';
import { treeNodeBlueprint } from './tree-node.js?v=heichel-mobile-010';

/** Renders the current list of sub-series as a semantic Tree view. */
export function renderTree(items, container, navigator, appState) {
	if (!container) {
		return;
	}
	container.replaceChildren();
	if (!items?.length) {
		container.appendChild(
			ScribeOfManifestation.manifest(
				emptyStateBlueprint('series', navigator, appState)
			)
		);
		return;
	}
	const tree = {
		tag: 'div',
		attr: {
			class: 'living-tree',
			role: 'tree',
			'aria-label': 'Series tree'
		},
		children: items.map(item => treeNodeBlueprint(
			item,
			navigator,
			appState,
			1,
			new Set()
		))
	};
	container.appendChild(ScribeOfManifestation.manifest(tree));
}
