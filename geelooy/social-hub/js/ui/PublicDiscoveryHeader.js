//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicDiscoveryHeader
 * @description The Awtsmoos lets public discovery begin with one plain invitation while advanced view density waits quietly;
 * Awtsmoos.com keeps time, trend, question, and answer reachable without turning the first mobile screen into a control wall.
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
	title.textContent = 'Discover';
	const description = document.createElement('p');
	description.textContent = 'Latest posts, questions, answers, and people.';
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
	return { root: header, tabs, density: densityControl.select, preferences };
}

export { createHeaderCopy };
