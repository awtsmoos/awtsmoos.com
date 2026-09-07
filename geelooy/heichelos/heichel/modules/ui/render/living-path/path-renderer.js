// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathPathRenderer
 * @description
 * The Awtsmoos creates every ancestor and present branch in one path while Hebrew and English remain two revelations of one name;
 * Awtsmoos.com paints breadcrumb, full path, sticky parent, and search while a separate vessel prepares the current identity for the frame.
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

export function renderPathSurfaces(navigator, appState) {
	const path = normalizePath(
		appState.breadcrumb,
		currentPathCrumb(appState)
	);
	paintBreadcrumb(path, navigator);
	paintFullPath(path, navigator);
	paintSticky(path);
	paintSearch(path, appState.currentView);
	return path;
}

function paintBreadcrumb(path, navigator) {
	if (!DOMElements.breadcrumb) {
		return;
	}
	const visible = path.length > 4
		? [path[0], ...path.slice(-3)]
		: path;
	const plans = [];
	visible.forEach((crumb, index) => {
		if (index) {
			plans.push(pathSeparatorBlueprint());
		}
		plans.push(
			pathCrumbBlueprint(
				crumb,
				navigator,
				index === visible.length - 1
			)
		);
	});
	DOMElements.breadcrumb.replaceChildren(
		...manifestPathBlueprints(plans)
	);
}

function paintFullPath(path, navigator) {
	if (!DOMElements.fullPathList) {
		return;
	}
	const plans = path.map((crumb, index) => ({
		tag: 'li',
		attr: {
			'data-depth': index
		},
		children: [
			pathCrumbBlueprint(
				crumb,
				navigator,
				index === path.length - 1
			)
		]
	}));
	DOMElements.fullPathList.replaceChildren(
		...manifestPathBlueprints(plans)
	);
}

function paintSticky(path) {
	const { parent, current } = compactPath(path);
	const sticky = DOMElements.stickyPathTitle?.closest('.living-path-sticky');
	const rootOnly = current.id === 'root' && !parent;
	sticky?.classList.toggle('hidden', rootOnly);
	sticky?.classList.toggle('is-visible', false);
	sticky?.setAttribute('aria-hidden', String(rootOnly));
	if (DOMElements.stickyPathTitle) {
		DOMElements.stickyPathTitle.textContent = current.name;
	}
	if (!DOMElements.stickyParentButton) {
		return;
	}
	DOMElements.stickyParentButton.textContent = parent
		? `‹ ${parent.name}`
		: 'Root';
	DOMElements.stickyParentButton.disabled = !parent;
	DOMElements.stickyParentButton.dataset.seriesId = parent?.id || '';
}

function paintSearch(path, view) {
	if (!DOMElements.searchInput) {
		return;
	}
	const placeholder = searchPlaceholder(path, view);
	DOMElements.searchInput.placeholder = placeholder;
	DOMElements.searchInput.setAttribute(
		'aria-label',
		placeholder
	);
}
