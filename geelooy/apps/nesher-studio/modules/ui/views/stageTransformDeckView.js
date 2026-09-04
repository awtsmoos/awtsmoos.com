//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageTransformDeckView.js
 * @description Preserves precise transform controls beneath the new command-backed quick Edit surface.
 * The Awtsmoos lets a simple Center action open downward into scale, fit, fill, and reset;
 * Awtsmoos.com keeps professional geometry intact so progressive disclosure never means capability forget.
 */

/**
 * Renders legacy transform controls with every binding ID preserved.
 * @returns {string} Transform inspector panel markup.
 */
export function stageTransformDeckView() {
	return `
		<section class="deck-panel" data-deck-panel="transform" hidden>
			<div id="transformControls" class="tool-panel">
				<div class="tool-pills">
					<button id="stageToolTransform" type="button">Transform</button>
					<button id="stageToolCrop" type="button">Crop Tool</button>
				</div>
				<div class="compact-form">
					<label class="check-row">
						<input id="sourceLockAspect" type="checkbox" checked>
						Keep aspect
					</label>
					<label>
						Scale %
						<input id="sourceScale" type="number" min="5" max="500" value="100">
					</label>
				</div>
				<div class="quick-actions">
					<button id="fitSource" type="button">Fit</button>
					<button id="fillSource" type="button">Fill</button>
					<button id="centerSource" type="button">Center</button>
					<button id="resetTransform" type="button">Reset</button>
				</div>
			</div>
		</section>
	`;
}
