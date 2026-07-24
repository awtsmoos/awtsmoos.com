// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathTreeRenderer
 * @description
 * The Awtsmoos creates parent and child without separation. Awtsmoos.com
 * manifests a true expandable outline with levels, guarded async loading,
 * cycle protection, and the same honest series cards used elsewhere.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCollection } from '../../../navigator/content-normalizer.js';
import { getSubSeriesDetails } from '../../../api/series.js';
import { normalizeCardData } from '../cardData.js';
import { cardBlueprint } from './cards.js';
import { emptyStateBlueprint } from './empty-state.js';

const branchCache = new Map();
const MAX_DEPTH = 8;

export function renderTree(items, container, navigator, appState) {
	if (!container) return;
	container.replaceChildren();
	if (!items?.length) {
		container.appendChild(ScribeOfManifestation.manifest(emptyStateBlueprint('series', navigator, appState)));
		return;
	}
	const tree = {
		tag: 'div',
		attr: { class: 'living-tree', role: 'tree', 'aria-label': 'Series tree' },
		children: items.map(item => treeNode(item, navigator, appState, 1, new Set()))
	};
	container.appendChild(ScribeOfManifestation.manifest(tree));
}

function treeNode(item, navigator, appState, depth, ancestors) {
	const data = normalizeCardData(item, 'series');
	const wellId = `living-tree-children-${safeId(data.id)}-${depth}`;
	const nextAncestors = new Set(ancestors).add(data.id);
	const expandControl = depth < MAX_DEPTH ? expandButton(data, wellId, navigator, appState, depth, nextAncestors) : null;
	return {
		tag: 'div',
		attr: { class: 'living-tree-node', role: 'treeitem', 'aria-level': depth },
		children: [cardBlueprint(item, data, navigator, appState, {
			variant: 'tree-card',
			depth,
			expandControl,
			childrenWell: {
				tag: 'div',
				attr: { id: wellId, class: 'series-children-well', role: 'group', hidden: true }
			}
		})]
	};
}

function expandButton(data, wellId, navigator, appState, depth, ancestors) {
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
		events: { click: event => toggleBranch(event, data, wellId, navigator, appState, depth, ancestors) }
	};
}

async function toggleBranch(event, data, wellId, navigator, appState, depth, ancestors) {
	event.preventDefault();
	event.stopPropagation();
	const button = event.currentTarget;
	const well = document.getElementById(wellId);
	if (!well) return;
	const open = button.getAttribute('aria-expanded') !== 'true';
	button.setAttribute('aria-expanded', String(open));
	well.hidden = !open;
	if (!open || well.dataset.loaded === 'true') return;
	well.replaceChildren(ScribeOfManifestation.manifest({ tag: 'p', attr: { class: 'series-branch-loading' }, children: ['Opening branch…'] }));
	try {
		const children = await loadChildren(appState.heichelId, data.id);
		well.replaceChildren();
		well.dataset.loaded = 'true';
		if (!children.length) {
			well.appendChild(ScribeOfManifestation.manifest({ tag: 'p', attr: { class: 'series-branch-empty' }, children: ['No deeper branches here.'] }));
			return;
		}
		for (const child of children) {
			const childData = normalizeCardData(child, 'series');
			if (ancestors.has(childData.id)) continue;
			well.appendChild(ScribeOfManifestation.manifest(treeNode(child, navigator, appState, depth + 1, ancestors)));
		}
	} catch (error) {
		well.replaceChildren(ScribeOfManifestation.manifest({ tag: 'p', attr: { class: 'series-branch-error', role: 'alert' }, children: [`Could not open branch: ${error.message}`] }));
	}
}

async function loadChildren(heichelId, seriesId) {
	const key = `${heichelId}:${seriesId}`;
	if (!branchCache.has(key)) {
		branchCache.set(key, normalizeCollection(await getSubSeriesDetails(heichelId, seriesId)));
	}
	return branchCache.get(key);
}

function safeId(value) {
	return String(value).replace(/[^a-z0-9_-]/gi, '-');
}
