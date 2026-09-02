//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file homeView.js
 * @description Reveals the beginner-facing Studio constellation, now including the deliberate doorway into deeper creative language.
 * The Awtsmoos lets simplicity stand above depth without severing the root below;
 * Awtsmoos.com gives seven friendly rooms while More opens the same canonical commands when the maker wishes to go.
 */
const HOME_ROOMS = [
	['01', 'stage', 'Stage', 'Compose scenes, layers, transforms, and crops.', 'stage'],
	['02', 'audio', 'Audio Lab', 'Shape GPU rivers, Hebrew currents, and particles.', 'audio'],
	['03', 'sources', 'Sources', 'Bring cameras, screens, files, and browser worlds.', 'sources'],
	['04', 'live', 'Live', 'Watch provider health, segments, and uploaded bytes.', 'live'],
	['05', 'nle', 'Timeline', 'Arrange clips, markers, tracks, and exports.', 'nle'],
	['06', 'setup', 'Setup', 'Choose canvas, profile, frame rate, and provider.', 'setup'],
	['07', 'more', 'More', 'Inspect commands, history, macros, presets, scripting, and AI parity.', 'more']
];

/** Creates the mobile-friendly Studio home grid without binding navigation behavior. */
export function homeView() {
	const tiles = HOME_ROOMS.map(createHomeTile).join('');

	return `
		<section id="homeSection" class="workspace-page home-page is-active" data-studio-page="home">
			<div class="home-aurora" aria-hidden="true"><span>א</span><span>ו</span><span>ר</span></div>
			<header class="page-hero">
				<div>
					<p class="eyebrow">One runtime · seven focused rooms</p>
					<h2>Build in the moment.</h2>
					<p>Every room fills the viewport, shares live state, and changes without a page reload.</p>
				</div>
			</header>
			<div class="studio-home" aria-label="Studio room grid">${tiles}</div>
			<section class="metric-strip" aria-label="Recording status">
				<div><span>Recording</span><strong id="recordPhase">Idle</strong></div>
				<div><span>Elapsed</span><strong id="recordElapsed">00:00</strong></div>
				<div><span>Frames</span><strong id="recordFrames">0</strong></div>
				<div><span>Errors</span><strong id="recordErrors">0</strong></div>
				<p id="recordNote">Manual WebCodecs recorder is idle.</p>
			</section>
		</section>
	`;
}

function createHomeTile([number, accent, title, copy, page]) {
	return `
		<button class="home-tile" data-accent="${accent}" data-page-target="${page}">
			<span class="tile-number">${number}</span>
			<span class="tile-copy"><strong>${title}</strong><em>${copy}</em></span>
			<span class="tile-arrow" aria-hidden="true">↗</span>
		</button>
	`;
}
