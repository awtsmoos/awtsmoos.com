// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingTreeToggle
 * @description
 * The Awtsmoos lets a closed branch become visible without confusing transport, recursion, and card identity in one vessel;
 * Awtsmoos.com places expansion inside a bounded Gevurah gate, while the caller supplies the child blueprint that continues the tree level.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCardData } from '../cardData.js?v=heichel-mobile-010';
import { loadTreeChildren } from './tree-branch-loader.js?v=heichel-mobile-010';

/** Opens or closes one persisted Tree branch and lazily manifests its children. */
export async function toggleTreeBranch(event, context, createChildNode) {
	event.preventDefault();
	event.stopPropagation();
	const button = event.currentTarget;
	const well = document.getElementById(context.wellId);
	if (!well) {
		return;
	}
	const open = button.getAttribute('aria-expanded') !== 'true';
	button.setAttribute('aria-expanded', String(open));
	well.hidden = !open;
	if (!open || well.dataset.loaded === 'true') {
		return;
	}
	paintMessage(well, 'Opening branch…', 'series-branch-loading');
	try {
		const children = await loadTreeChildren(
			context.appState.heichelId,
			context.data.id
		);
		paintChildren(well, children, context, createChildNode);
	} catch (error) {
		paintMessage(
			well,
			`Could not open branch: ${error.message}`,
			'series-branch-error',
			'alert'
		);
	}
}

function paintChildren(well, children, context, createChildNode) {
	well.replaceChildren();
	well.dataset.loaded = 'true';
	const visible = children.filter(child => {
		const childData = normalizeCardData(child, 'series');
		return !context.ancestors.has(childData.id);
	});
	if (!visible.length) {
		paintMessage(well, 'No deeper branches here.', 'series-branch-empty');
		return;
	}
	for (const child of visible) {
		const plan = createChildNode(
			child,
			context.navigator,
			context.appState,
			context.depth + 1,
			context.ancestors
		);
		well.appendChild(
			ScribeOfManifestation.manifest(plan)
		);
	}
}

function paintMessage(well, text, className, role = '') {
	well.replaceChildren(ScribeOfManifestation.manifest({
		tag: 'p',
		attr: {
			class: className,
			...(role ? { role } : {})
		},
		children: [text]
	}));
}
