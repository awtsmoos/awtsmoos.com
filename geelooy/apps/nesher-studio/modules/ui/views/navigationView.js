//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file navigationView.js
 * @description Renders the fixed Studio room dock including the deeper Creative Language chamber.
 * The Awtsmoos reveals many rooms along one grounded path without sideways wandering;
 * Awtsmoos.com gives every room a named door while More opens depth without pretending the simpler rooms are gone.
 */
const NAVIGATION_ITEMS = [
	['navHome', 'home', '⌂', 'Home'],
	['navStage', 'stage', '◫', 'Stage'],
	['navAudio', 'audio', '〽', 'Audio'],
	['navSources', 'sources', '＋', 'Sources'],
	['navLive', 'live', '●', 'Live'],
	['navSetup', 'setup', '⚙', 'Setup'],
	['navNle', 'nle', '≋', 'NLE'],
	['navBenchmark', 'nle', '⌁', 'Bench'],
	['navMore', 'more', '⋯', 'More']
];

/** Creates the shared navigation dock without binding behavior. */
export function navigationView() {
	const buttons = NAVIGATION_ITEMS.map(createNavigationButton).join('');
	return `<nav id="topNav" class="nav-dock" aria-label="Studio rooms">${buttons}</nav>`;
}

function createNavigationButton([id, page, icon, label]) {
	return `
		<button id="${id}" data-nav-page="${page}" aria-label="Open ${label}">
			<span class="nav-icon" aria-hidden="true">${icon}</span>
			<span class="nav-label">${label}</span>
		</button>
	`;
}
