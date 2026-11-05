// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionMarkup.js
 * @description Defines accessible reusable-composition, layer, nesting, draft, and evaluation controls.
 * The Awtsmoos is beyond canvas and hierarchy; Awtsmoos.com gives artists one visible
 * vessel where new and existing nested stories can be created, ordered, timed, inspected, and reversed.
 */

export function movieStudioCompositionMarkup() {
	return `
		<section class="movie-composition-workspace" data-composition-workspace aria-labelledby="movie-composition-title">
			<header><h3 id="movie-composition-title">Compositions &amp; Layers</h3><output data-composition-status aria-live="polite">Composition workspace ready.</output></header>
			<div class="movie-composition-grid">
				<label>Composition<select data-composition-select aria-label="Selected composition"></select></label>
				<label>ID<input data-composition-id maxlength="96" autocomplete="off" placeholder="main-comp"></label>
				<label>Name<input data-composition-name maxlength="200" autocomplete="off" placeholder="Main composition"></label>
				<label>Duration<input type="number" data-composition-duration min="0.001" max="86400" step="0.001" value="10"></label>
				<label>FPS<input type="number" data-composition-fps min="1" max="240" step="1" value="30"></label>
				<label>Width<input type="number" data-composition-width min="1" max="16384" step="1" value="1920"></label>
				<label>Height<input type="number" data-composition-height min="1" max="16384" step="1" value="1080"></label>
			</div>
			<div class="movie-composition-actions"><button data-composition-action="new">New</button><button data-composition-action="create">Create</button><button data-composition-action="update">Update</button><button data-composition-action="duplicate">Duplicate</button><button data-composition-action="remove">Remove</button></div>
			<output data-composition-graph aria-live="polite">No composition graph yet.</output>
			<div class="movie-composition-layer-list" data-composition-layer-list role="listbox" aria-label="Composition layers" tabindex="0"></div>
			<section class="movie-composition-layer-editor" aria-labelledby="movie-composition-layer-title">
				<h4 id="movie-composition-layer-title">Layer Editor</h4>
				<div class="movie-composition-grid">
					<label>Kind<select data-composition-layer-kind><option value="solid">Solid</option><option value="text">Text</option><option value="composition">Nested composition</option></select></label>
					<label>ID<input data-composition-layer-id maxlength="96" autocomplete="off" placeholder="layer-1"></label>
					<label>Name<input data-composition-layer-name maxlength="160" autocomplete="off" placeholder="Layer 1"></label>
					<label>Nested source<select data-composition-layer-source aria-label="Nested composition source"></select></label>
					<label>Start<input type="number" data-composition-layer-start min="0" step="0.001" value="0"></label>
					<label>Duration<input type="number" data-composition-layer-duration min="0.001" step="0.001" value="5"></label>
					<label>Blend<select data-composition-layer-blend><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="add">Add</option><option value="subtract">Subtract</option><option value="darken">Darken</option><option value="lighten">Lighten</option></select></label>
					<label>Opacity<input type="number" data-composition-layer-opacity min="0" max="1" step="0.01" value="1"></label>
					<label class="movie-composition-check"><input type="checkbox" data-composition-layer-loop> Loop source</label>
					<label class="movie-composition-check"><input type="checkbox" data-composition-layer-locked> Locked</label>
					<label class="movie-composition-text">Text<textarea data-composition-layer-text maxlength="100000" spellcheck="true"></textarea></label>
				</div>
				<div class="movie-composition-actions"><button data-composition-layer-action="new">New layer</button><button data-composition-layer-action="add">Add layer</button><button data-composition-layer-action="update">Update layer</button><button data-composition-layer-action="up">Move up</button><button data-composition-layer-action="down">Move down</button><button data-composition-layer-action="remove">Remove layer</button></div>
			</section>
			<button data-composition-evaluate>Evaluate at playhead</button>
			<output class="movie-composition-evaluation" data-composition-evaluation aria-live="polite">No render plan evaluated.</output>
		</section>
	`;
}
