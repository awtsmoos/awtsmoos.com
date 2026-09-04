//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageVisualDeckView.js
 * @description Preserves audio-reactive visualizer depth while the primary movie surface stays calm and selection-led.
 * The Awtsmoos lets sound become visible without forcing every maker to confront the river's hidden controls;
 * Awtsmoos.com keeps presets, sensitivity, Hebrew text, and custom JS editable when deeper intention rules.
 */

/**
 * Renders the existing visualizer inspector with every legacy binding ID preserved.
 * @returns {string} Visualizer inspector panel markup.
 */
export function stageVisualDeckView() {
	return `
		<section class="deck-panel" data-deck-panel="visual" hidden>
			<div id="visualizerControls" class="visualizer-panel" hidden>
				<div class="compact-form">
					<label>
						Preset
						<select id="visualizerPreset"></select>
					</label>
					<label>
						Input
						<select id="visualizerInput"></select>
					</label>
					<label>
						Sensitivity
						<input id="visualizerSensitivity" type="range" min="0.2" max="4" step="0.05">
					</label>
					<label>
						Bars
						<input id="visualizerBars" type="number" min="8" max="96">
					</label>
				</div>
				<label>
					Hebrew Text
					<input id="visualizerText">
				</label>
				<label>
					Custom JS
					<textarea id="visualizerCustomJs" rows="3"></textarea>
				</label>
				<button id="visualizerReset" type="button">Reset Visualizer</button>
			</div>
		</section>
	`;
}
