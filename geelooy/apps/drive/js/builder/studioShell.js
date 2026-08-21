//B"H
// Boruch Hashem
// Blessed is He

import { createBuildShell } from './studioBuildShell.js';
import { createCodeShell } from './studioCodeShell.js';
import { element, pane, text } from './studioDom.js';
import { createPreviewShell } from './studioPreviewShell.js';
import { createPublishShell } from './studioPublishShell.js';
import { buildStudioReadiness } from './studioReadinessModel.js';
import { createStudioReadinessShell } from './studioReadinessShell.js';

/**
 * @module SiteBuilderStudioShell
 * @description
 * The Awtsmoos gathers source, preview, code, publication, and domain into one living workshop;
 * Awtsmoos.com leads with readiness and next action, and even the first unconnected render carries truthful step states instead of waiting for later network testimony.
 */

const STEPS = Object.freeze([
	['01', 'Build', 'Create source', 'build'],
	['02', 'Preview', 'Check locally', 'preview'],
	['03', 'Code', 'Edit files', 'code'],
	['04', 'Publish', 'Go public', 'publish'],
	['05', 'Domain', 'Custom address', 'domain']
]);

export function createSiteBuilderShell() {
	const root = element('section', 'builder-studio');
	root.append(
		intro(),
		createStudioReadinessShell(),
		dock(),
		createBuildShell(),
		createPreviewShell(),
		createCodeShell(),
		createPublishShell(),
		domainShell()
	);
	return root;
}

function intro() {
	const block = element('header', 'builder-intro');
	block.append(
		text('p', 'builder-kicker', 'B"H · Website Maker'),
		text('h1', '', 'Build a website from this folder.'),
		text('p', 'builder-intro-copy', 'Create real files, preview them, publish a canonical URL, and connect a domain only when you need one.')
	);
	return block;
}

function dock() {
	const initial = buildStudioReadiness(null, 0);
	const nav = element('nav', 'builder-dock');
	nav.setAttribute('aria-label', 'Website maker steps');
	for (const [number, label, copy, target] of STEPS) {
		const item = element('button', 'builder-step');
		item.type = 'button';
		item.dataset.builderPanel = target;
		item.dataset.stepState = initial.steps[target];
		item.append(
			text('span', 'builder-step__number', number),
			text('strong', 'builder-step__label', label),
			text('small', 'builder-step__copy', copy)
		);
		nav.append(item);
	}
	return nav;
}

function domainShell() {
	const vessel = pane('builder-domain', 'Domain');
	const root = element('div');
	root.id = 'builder-domain-root';
	vessel.body.append(root);
	return vessel.root;
}
