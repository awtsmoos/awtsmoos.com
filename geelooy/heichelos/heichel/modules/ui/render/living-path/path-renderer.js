// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathPathRenderer
 * @description
 * The Awtsmoos gathers every ancestor and present Torah branch into one useful
 * path. Awtsmoos.com removes root-only chrome and exposes a separate Full Path
 * disclosure only when compact breadcrumbs actually omit middle ancestry.
 */

import { DOMElements } from '../../../dom.js';
import {
	compactPath,
	normalizePath,
	searchPlaceholder
} from '../../../living-path/path-policy.js?v=heichel-mobile-010';
import { currentPathCrumb } from './path-current.js?v=heichel-mobile-010';
import {
	manifestPathBlueprints,
	pathCrumbBlueprint,
	pathSeparatorBlueprint
} from './path-blueprints.js?v=heichel-mobile-010';

/**
 * Paints every path-dependent surface and returns the normalized canonical path.
 * @param {Object} navigator Living-path navigator used by breadcrumb controls.
 * @param {Object} appState Current Heichel application state.
 * @returns {Array<Object>} Normalized breadcrumb records.
 */
export function renderPathSurfaces(navigator, appState) {
	const path = normalizePath(appState.breadcrumb, currentPathCrumb(appState));
	paintBreadcrumb(path, navigator);
	paintFullPath(path, navigator);
	paintSticky(path);
	paintSearch(path, appState.currentView);
	return path;
}

/** Paints compact ancestry and removes the entire path vessel at the root. */
function paintBreadcrumb(path, navigator) {
	if (!DOMElements.breadcrumb) return;
	const rootOnly = path.length <= 1;
	const context = DOMElements.breadcrumb.closest('.living-path-context');
	context?.classList.toggle('hidden', rootOnly);
	context?.toggleAttribute('hidden', rootOnly);
	if (rootOnly) {
		DOMElements.breadcrumb.replaceChildren();
		return;
	}
	const visible = path.length > 4
		? [path[0], ...path.slice(-3)]
		: path;
	const plans = [];
	visible.forEach((crumb, index) => {
		if (index) plans.push(pathSeparatorBlueprint());
		plans.push(pathCrumbBlueprint(
			crumb,
			navigator,
			index === visible.length - 1
		));
	});
	DOMElements.breadcrumb.replaceChildren(...manifestPathBlueprints(plans));
}

/** Shows Full Path only when compact breadcrumbs intentionally omit middle levels. */
function paintFullPath(path, navigator) {
	if (!DOMElements.fullPathList) return;
	const details = DOMElements.pathDetails
		|| DOMElements.fullPathList.closest('.living-path-full-path');
	const needsDisclosure = path.length > 4;
	details?.classList.toggle('hidden', !needsDisclosure);
	details?.toggleAttribute('hidden', !needsDisclosure);
	if (!needsDisclosure) {
		DOMElements.fullPathList.replaceChildren();
		return;
	}
	const plans = path.map((crumb, index) => ({
		tag: 'li',
		attr: { 'data-depth': index },
		children: [pathCrumbBlueprint(
			crumb,
			navigator,
			index === path.length - 1
		)]
	}));
	DOMElements.fullPathList.replaceChildren(...manifestPathBlueprints(plans));
}

/** Keeps parent navigation available only when there is somewhere useful to go. */
function paintSticky(path) {
	const { parent, current } = compactPath(path);
	const sticky = DOMElements.stickyPathTitle?.closest('.living-path-sticky');
	const rootOnly = current.id === 'root' && !parent;
	sticky?.classList.toggle('hidden', rootOnly);
	sticky?.classList.toggle('is-visible', false);
	sticky?.setAttribute('aria-hidden', String(rootOnly));
	if (DOMElements.stickyPathTitle) DOMElements.stickyPathTitle.textContent = current.name;
	if (!DOMElements.stickyParentButton) return;
	DOMElements.stickyParentButton.textContent = parent ? `‹ ${parent.name}` : 'Root';
	DOMElements.stickyParentButton.disabled = !parent;
	DOMElements.stickyParentButton.dataset.seriesId = parent?.id || '';
}

/** Updates the search prompt from canonical path and active view. */
function paintSearch(path, view) {
	if (!DOMElements.searchInput) return;
	const placeholder = searchPlaceholder(path, view);
	DOMElements.searchInput.placeholder = placeholder;
	DOMElements.searchInput.setAttribute('aria-label', placeholder);
}
