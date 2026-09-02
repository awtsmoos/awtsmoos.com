// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathPathRenderer
 * @description
 * The Awtsmoos creates every ancestor and the present branch in one indivisible path;
 * Awtsmoos.com keeps Root singular while child branches receive a compact guiding echo.
 */

import { DOMElements } from '../../../dom.js';
import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { compactPath, normalizePath, searchPlaceholder } from '../../../living-path/path-policy.js';

export function renderPathSurfaces(navigator, appState) {
	const current = currentCrumb(appState);
	const path = normalizePath(appState.breadcrumb, current);
	paintBreadcrumb(path, navigator);
	paintFullPath(path, navigator);
	paintSticky(path);
	paintSearch(path, appState.currentView);
	return path;
}

function paintBreadcrumb(path, navigator) {
	if (!DOMElements.breadcrumb) return;
	const visible = path.length > 4 ? [path[0], ...path.slice(-3)] : path;
	const children = [];
	visible.forEach((crumb, index) => {
		if (index) children.push(separator());
		children.push(crumbButton(crumb, navigator, index === visible.length - 1));
	});
	DOMElements.breadcrumb.replaceChildren(...manifest(children));
}

function paintFullPath(path, navigator) {
	if (!DOMElements.fullPathList) return;
	const children = path.map((crumb, index) => ({
		tag: 'li',
		attr: { 'data-depth': index },
		children: [crumbButton(crumb, navigator, index === path.length - 1)]
	}));
	DOMElements.fullPathList.replaceChildren(...manifest(children));
}

function paintSticky(path) {
	const { parent, current } = compactPath(path);
	const sticky = DOMElements.stickyPathTitle?.closest('.living-path-sticky');
	const rootOnly = current.id === 'root' && !parent;
	sticky?.classList.toggle('hidden', rootOnly);
	sticky?.classList.toggle('is-visible', false);
	sticky?.setAttribute('aria-hidden', String(rootOnly));
	if (DOMElements.stickyPathTitle) DOMElements.stickyPathTitle.textContent = current.name;
	if (DOMElements.stickyParentButton) {
		DOMElements.stickyParentButton.textContent = parent ? `‹ ${parent.name}` : 'Root';
		DOMElements.stickyParentButton.disabled = !parent;
		DOMElements.stickyParentButton.dataset.seriesId = parent?.id || '';
	}
}

function paintSearch(path, view) {
	if (!DOMElements.searchInput) return;
	const placeholder = searchPlaceholder(path, view);
	DOMElements.searchInput.placeholder = placeholder;
	DOMElements.searchInput.setAttribute('aria-label', placeholder);
}

function crumbButton(crumb, navigator, current) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'breadcrumb-link',
			...(current ? { 'aria-current': 'page' } : {})
		},
		children: [crumb.name],
		events: { click: () => navigator.navigateTo(crumb.id) }
	};
}

function separator() {
	return {
		tag: 'span',
		attr: { class: 'breadcrumb-separator', 'aria-hidden': 'true' },
		children: ['›']
	};
}

function currentCrumb(appState) {
	const raw = appState.currentSeriesData?.prateem || appState.currentSeriesData || {};
	return {
		id: appState.currentSeries || 'root',
		name: raw.name || raw.title || appState.currentSeries || 'Root'
	};
}

function manifest(plans) {
	return plans.map(plan => ScribeOfManifestation.manifest(plan));
}
