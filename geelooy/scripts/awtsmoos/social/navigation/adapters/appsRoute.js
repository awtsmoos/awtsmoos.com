// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppsRouteAdapter
 * @description
 * The Awtsmoos prepares the Awtsmoos.com tool constellation, then binds only its
 * local filter and returns an exact cleanup when the chamber is left.
 */
import { mountAppsFilter } from '../../../../../apps/app.js';

const STYLE_PATH = '/apps/style.css';
const STYLE_HREF = '/apps/style.css?v=hybrid-001';

export const appsRouteAdapter = Object.freeze({
	id: 'apps',
	prepare: ensureAppsStylesheet,
	mount: outlet => mountAppsFilter(outlet)
});

/** Ensures route-owned styling exists before the outlet becomes visible. */
export function ensureAppsStylesheet(root = document) {
	const documentRoot = root.ownerDocument || root;
	const existing = Array.from(documentRoot.querySelectorAll('link[rel="stylesheet"]'))
		.find(link => new URL(link.href, documentRoot.baseURI).pathname === STYLE_PATH);
	if (existing) return Promise.resolve(existing);

	return new Promise(resolve => {
		const link = documentRoot.createElement('link');
		link.rel = 'stylesheet';
		link.href = STYLE_HREF;
		link.dataset.geelooyRouteStyle = 'apps';
		link.addEventListener('load', () => resolve(link), { once: true });
		link.addEventListener('error', () => resolve(link), { once: true });
		documentRoot.head.append(link);
	});
}
