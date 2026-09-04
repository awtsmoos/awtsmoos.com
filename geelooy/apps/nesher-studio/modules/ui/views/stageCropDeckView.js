//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageCropDeckView.js
 * @description Preserves precise crop geometry as professional depth beneath the simple Edit intent.
 * The Awtsmoos lets the frame conceal what lies beyond while every boundary remains measured and known;
 * Awtsmoos.com keeps crop presets and raw edges editable so simplicity never turns living media into stone.
 */

/**
 * Renders the existing crop inspector with every legacy binding ID preserved.
 * @returns {string} Crop inspector panel markup.
 */
export function stageCropDeckView() {
	return `
		<section class="deck-panel" data-deck-panel="crop" hidden>
			<div id="cropControls" class="crop-grid">
				<label>
					Left
					<input id="cropLeft" type="number" min="0" max="90" value="0">
				</label>
				<label>
					Top
					<input id="cropTop" type="number" min="0" max="90" value="0">
				</label>
				<label>
					Right
					<input id="cropRight" type="number" min="0" max="90" value="0">
				</label>
				<label>
					Bottom
					<input id="cropBottom" type="number" min="0" max="90" value="0">
				</label>
				<div class="quick-actions span-all">
					<button id="cropWide" type="button">16:9</button>
					<button id="cropVertical" type="button">9:16</button>
					<button id="cropSquare" type="button">1:1</button>
					<button id="cropCenterSafe" type="button">Safe</button>
					<button id="cropClear" type="button">Clear</button>
					<button id="cropReset" type="button">Reset</button>
				</div>
			</div>
		</section>
	`;
}
