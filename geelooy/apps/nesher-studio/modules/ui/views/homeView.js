//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file homeView.js
 * @description Reframes the former launcher as a deliberate Project Hub beneath the Stage-first creative surface.
 * The Awtsmoos lets many workspaces remain discoverable without making the maker choose architecture before creation;
 * Awtsmoos.com keeps project health and deeper rooms nearby while Canvas becomes the first visible revelation.
 */
const PROJECT_HUB_ROOMS = [
	['01', 'stage', 'Canvas', 'Return to the movie and current selection.'],
	['02', 'nle', 'Timeline', 'Arrange clips, markers, timing, and exports.'],
	['03', 'audio', 'Audio Lab', 'Shape sound and audio-reactive visuals.'],
	['04', 'sources', 'Sources', 'Manage cameras, files, screens, and browser media.'],
	['05', 'setup', 'Project Setup', 'Canvas, frame rate, recording profile, and provider.'],
	['06', 'live', 'Live', 'Inspect streaming health and delivery state.'],
	['07', 'more', 'Commands & History', 'Inspect the Universal Creative Language and reusable work.']
];

/**
 * Renders the advanced Project Hub while Stage remains the default initial surface.
 * @returns {string} Project Hub workspace markup.
 */
export function homeView() {
	const tiles = PROJECT_HUB_ROOMS.map(createProjectHubTile).join('');

	return `
		<section id="homeSection" class="workspace-page home-page" data-studio-page="home" hidden>
			<div class="home-aurora" aria-hidden="true">
				<span>א</span><span>ו</span><span>ר</span>
			</div>
			<header class="page-hero">
				<div>
					<p class="eyebrow">Project systems & professional rooms</p>
					<h2>Project Hub</h2>
					<p>The canvas stays simple. Open a deeper workspace here when the project asks for it.</p>
				</div>
			</header>
			<div class="studio-home" aria-label="Project workspace grid">${tiles}</div>
			${recordingStatusStrip()}
		</section>
	`;
}

function createProjectHubTile([number, page, title, copy]) {
	return `
		<button class="home-tile" data-accent="${page}" data-page-target="${page}" type="button">
			<span class="tile-number">${number}</span>
			<span class="tile-copy">
				<strong>${title}</strong>
				<em>${copy}</em>
			</span>
			<span class="tile-arrow" aria-hidden="true">↗</span>
		</button>
	`;
}

function recordingStatusStrip() {
	return `
		<section class="metric-strip" aria-label="Recording status">
			<div><span>Recording</span><strong id="recordPhase">Idle</strong></div>
			<div><span>Elapsed</span><strong id="recordElapsed">00:00</strong></div>
			<div><span>Frames</span><strong id="recordFrames">0</strong></div>
			<div><span>Errors</span><strong id="recordErrors">0</strong></div>
			<p id="recordNote">Manual WebCodecs recorder is idle.</p>
		</section>
	`;
}
