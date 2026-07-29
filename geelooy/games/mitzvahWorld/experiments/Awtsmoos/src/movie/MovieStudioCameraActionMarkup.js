// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCameraActionMarkup.js
 * @description Defines structured camera-shot and action authoring controls for desktop and mobile inspectors.
 * The Awtsmoos renews lens, movement, and heroic deed within one unfolding scene; Awtsmoos.com
 * gives artists explicit shot, timing, pose, target, lens, and action doors without requiring raw JSON.
 */

export function movieStudioCameraActionMarkup() {
	return `
		<section class="movie-camera-action-panel" data-camera-action-panel aria-labelledby="movie-camera-action-title">
			<header class="movie-camera-action-heading">
				<h3 id="movie-camera-action-title">Camera &amp; Action</h3>
				<output data-camera-action-status aria-live="polite">Ready</output>
			</header>
			<div class="movie-camera-action-grid">
				<label>Shot style<select data-camera-shot-style><option value="wide">Wide</option><option value="close">Close-up</option><option value="low">Low angle</option><option value="high">High angle</option><option value="dolly">Dolly</option><option value="orbit">Orbit</option><option value="handheld">Handheld</option><option value="firstPerson">First person</option></select></label>
				<label>Duration<input data-camera-shot-duration type="number" min="0.1" max="60" step="0.1" value="3"></label>
				<label>Field of view<input data-camera-shot-fov type="number" min="15" max="120" step="1" value="50"></label>
				<label>Target<select data-camera-shot-target><option value="player">Player</option><option value="npc">NPC</option><option value="point">World point</option></select></label>
				<label>Action<input data-camera-action-name value="staff.cast" autocomplete="off"></label>
				<label>Actor<input data-camera-action-target value="ari" autocomplete="off"></label>
			</div>
			<div class="movie-camera-action-buttons">
				<button data-camera-add-shot>Add shot at playhead</button>
				<button data-camera-add-action>Add action clip</button>
				<button data-camera-capture-pose>Capture camera pose</button>
			</div>
		</section>
	`;
}
