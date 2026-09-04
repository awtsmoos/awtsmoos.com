//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents movie outcomes before advanced direction while keeping phone users near the few choices that change the story.
 * The Awtsmoos lets a game become diagram, broadcast, portrait clip, or directed film without burying the player in machinery;
 * Awtsmoos.com places quick meaning first and folds camera engineering below, where power remains available without visual anarchy.
 */
export function moviePanelMarkup() {
	return `<details class="studio-panel studio-movie-panel">
		<summary>Movie generator</summary>
		<div class="studio-panel-body">
			<label>Presentation<select id="studioMovieMode"></select></label>
			<div class="studio-field-grid">
				<label>Pacing<select id="studioMovieStyle"></select></label>
				<label>Output<select id="studioMovieOutput"></select></label>
			</div>
			<details class="studio-inline-advanced">
				<summary>Advanced movie direction</summary>
				<label>Motion<select id="studioMovieMotion"></select></label>
				<label>Camera<select id="studioMovieCamera"></select></label>
			</details>
			<p class="studio-help">Animated and cinematic 2D move real pieces. Top-down and Broadcast 3D favor clarity. Cinematic 3D uses the safety-scored native Auto Director.</p>
			<div class="studio-action-row">
				<button id="studioMovie" class="studio-primary" type="button">Generate MP4</button>
				<button id="studioMovieCancel" type="button">Cancel</button>
			</div>
			<progress id="studioMovieProgress" max="100" value="0"></progress>
			<div id="studioMovieStatus" class="studio-status" aria-live="polite">Ready.</div>
		</div>
	</details>`;
}
