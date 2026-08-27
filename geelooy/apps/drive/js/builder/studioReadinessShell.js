//B"H
// Boruch Hashem
// Blessed is He

import { buildStudioReadiness } from './studioReadinessModel.js';
import { button, element, text } from './studioDom.js';

/**
 * @module SiteBuilderReadinessShell
 * @description
 * The Awtsmoos lets many infrastructure gates appear as one calm path while Awtsmoos.com keeps each witness distinct;
 * source, preview, publication, and domain begin with truthful model testimony before any account snapshot arrives, so the first visible state is useful rather than generic.
 */

const READINESS = Object.freeze([
	['source', 'Source', 'Create real editable files', 'build'],
	['preview', 'Preview', 'Check the website locally', 'preview'],
	['public', 'Public', 'Publish the canonical URL', 'publish'],
	['domain', 'Domain', 'Connect a custom hostname', 'domain']
]);

/** Creates the persistent readiness cockpit shown above the studio steps. */
export function createStudioReadinessShell() {
	const initial = buildStudioReadiness(null, 0);
	const root = element('section', 'builder-readiness');
	root.setAttribute('aria-labelledby', 'builder-readiness-title');
	const heading = text('div', 'builder-readiness-heading', 'Website readiness');
	heading.id = 'builder-readiness-title';
	const next = text('p', 'builder-readiness-next', initial.nextMessage);
	next.id = 'builder-readiness-next';
	next.setAttribute('aria-live', 'polite');
	const grid = element('div', 'builder-readiness-grid');
	for (const item of READINESS) {
		grid.append(readinessCard(initial, ...item));
	}
	root.append(heading, next, grid);
	return root;
}

function readinessCard(initial, name, label, description, target) {
	const state = initial.readiness[name];
	const item = button('', '', 'builder-readiness-card');
	item.dataset.readiness = name;
	item.dataset.builderJump = target;
	item.dataset.state = state.state;
	item.setAttribute('aria-label', `${label}: ${description}`);
	const title = element('span', 'builder-readiness-card__title');
	title.append(
		text('strong', '', label),
		text('span', 'builder-readiness-state', state.label)
	);
	const copy = text('span', 'builder-readiness-card__copy', description);
	item.append(title, copy);
	return item;
}
