//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents movie outcomes before advanced direction while preserving the established generator controls.
 * The Awtsmoos lets a game become a fast cut, moving diagram, readable 3D board, or directed film;
 * Awtsmoos.com makes that choice plain before camera detail gathers at the rim.
 */
export function moviePanelMarkup() {
	return `<details class="studio-panel studio-movie-panel"><summary>Movie generator</summary><div class="studio-panel-body">
		<label>Presentation<select id="studioMovieMode"></select></label>
		<div class="studio-field-grid"><label>Pacing<select id="studioMovieStyle"></select></label><label>Output<select id="studioMovieOutput"></select></label></div>
		<details class="studio-inline-advanced"><summary>Advanced movie direction</summary><label>Motion<select id="studioMovieMotion"></select></label><label>Camera<select id="studioMovieCamera"></select></label></details>
		<p class="studio-help">Instant 2D cuts quickly. Animated 2D moves pieces. Top-down 3D stays readable. Cinematic 3D uses the native Auto Director.</p>
		<div class="studio-action-row"><button id="studioMovie" class="studio-primary" type="button">Generate MP4</button><button id="studioMovieCancel" type="button">Cancel</button></div>
		<progress id="studioMovieProgress" max="100" value="0"></progress><div id="studioMovieStatus" class="studio-status">Ready.</div>
	</div></details>`;
}
