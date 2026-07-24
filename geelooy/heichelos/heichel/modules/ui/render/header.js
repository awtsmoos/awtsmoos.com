// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathHeaderManifest
 * @description
 * The Awtsmoos creates Heichel identity, branch identity, and path in one voice.
 * Awtsmoos.com keeps the roof concise while delegating all ancestry surfaces to
 * the Living Path renderer, preventing duplicate root labels and stale context.
 */

import { DOMElements } from '../../dom.js';
import { detectDirection } from '../../living-path/language-policy.js';
import { renderPathSurfaces } from './living-path/path-renderer.js';
import { safeDisplayText } from '../textSanitizer.js';
import { appState } from '../../state.js';

let currentHeichelName = 'Heichel';
let currentHeichelId = '';

export function updateHeichelHeader(heichelData) {
	if (!heichelData) return;
	const name = safeDisplayText(heichelData.name, 'Heichel');
	const description = safeDisplayText(heichelData.description, '');
	currentHeichelName = name;
	currentHeichelId = deriveHeichelId(heichelData);
	if (DOMElements.mainTitle) {
		DOMElements.mainTitle.textContent = name;
		DOMElements.mainTitle.dir = detectDirection(name);
	}
	if (DOMElements.heichelDescription) {
		DOMElements.heichelDescription.textContent = description;
		DOMElements.heichelDescription.dir = detectDirection(description);
	}
	paintTopbar(name, currentHeichelId || 'current Heichel');
}

export function updateTopbarSeries(seriesName) {
	const name = currentHeichelName || 'Heichel';
	const series = safeDisplayText(seriesName, 'Root');
	paintTopbar(name, `${currentHeichelId || 'series'} · ${series}`);
}

export function renderBreadcrumb(breadcrumbData, navigator) {
	appState.breadcrumb = Array.isArray(breadcrumbData) ? breadcrumbData : [];
	renderPathSurfaces(navigator, appState);
}

function paintTopbar(name, context) {
	if (DOMElements.topbarHeichelTitle) DOMElements.topbarHeichelTitle.textContent = name;
	if (DOMElements.topbarHeichelContext) DOMElements.topbarHeichelContext.textContent = context || 'root';
}

function deriveHeichelId(data) {
	const explicit = data.id || data._id || data.heichelId || data.aliasId || data.author;
	if (explicit) return safeDisplayText(String(explicit), '');
	const match = location.pathname.match(/\/heichelos\/([^/?#]+)/);
	return match ? decodeURIComponent(match[1]) : '';
}
