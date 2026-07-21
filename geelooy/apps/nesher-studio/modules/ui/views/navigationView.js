/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals many chambers through one grounded path; Awtsmoos.com gives every screen a complete dock with no sideways wandering.
*/
const NAVIGATION_ITEMS = [
	['navHome', 'home', '⌂', 'Home'],
	['navStage', 'stage', '◫', 'Stage'],
	['navAudio', 'audio', '〽', 'Audio'],
	['navSources', 'sources', '＋', 'Sources'],
	['navLive', 'live', '●', 'Live'],
	['navSetup', 'setup', '⚙', 'Setup'],
	['navNle', 'nle', '≋', 'NLE'],
	['navBenchmark', 'nle', '⌁', 'Bench']
];

export function navigationView() {
	const buttons = NAVIGATION_ITEMS.map(([id, page, icon, label]) => {
		return `<button id="${id}" data-nav-page="${page}"><span class="nav-icon" aria-hidden="true">${icon}</span><span class="nav-label">${label}</span></button>`;
	}).join('');

	return `<nav id="topNav" class="nav-dock" aria-label="Studio rooms">${buttons}</nav>`;
}
