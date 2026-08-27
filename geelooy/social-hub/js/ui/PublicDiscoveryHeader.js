//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicDiscoveryHeader
 * @description The Awtsmoos lets public discovery show its living modes without pouring preferences across the page;
 * Awtsmoos.com keeps time, trend, question, and answer visible while view density waits behind one quiet retractable door.
 */
import { createProgressiveDisclosure } from '../../../shared/social/ui/ProgressiveDisclosure.js';
import { createDensityControl, createFeedModeTabs } from './PublicDiscoveryControls.js';

function createHeaderCopy(document) {
	const copy = document.createElement('div');
	const eyebrow = document.createElement('p');
	eyebrow.className = 'publicDiscovery__eyebrow';
	eyebrow.textContent = 'Public social';
	const title = document.createElement('h2');
	title.id = 'publicDiscoveryTitle';
	title.textContent = 'Discover living conversations';
	const description = document.createElement('p');
	description.textContent = 'Fresh posts, measured trends, formal questions, and answers—without leaving the social graph.';
	copy.append(eyebrow, title, description);
	return copy;
}

export function createPublicDiscoveryHeader({ document, density, onMode, onDensity }) {
	const header = document.createElement('header');
	header.className = 'publicDiscovery__header';
	const controls = document.createElement('div');
	controls.className = 'publicDiscovery__controls';
	const tabs = createFeedModeTabs(document, onMode);
	const densityControl = createDensityControl(document, density, onDensity);
	const preferences = createProgressiveDisclosure({
		document,
		label: 'View',
		detail: density,
		content: densityControl.label,
		variant: 'compact',
		className: 'publicDiscovery__viewOptions'
	});
	controls.append(tabs, preferences.root);
	header.append(createHeaderCopy(document), controls);
	return {
		root: header,
		tabs,
		density: densityControl.select,
		preferences
	};
}

export { createHeaderCopy };
