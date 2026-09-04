//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageCanvasView.js
 * @description Gives the movie canvas first visual priority while selection and status remain immediately understandable.
 * The Awtsmoos lets the picture stand before its instruments, simple at first sight yet joined to every depth;
 * Awtsmoos.com keeps selection truth beside the canvas so the maker always knows what the next touch will affect.
 */

/**
 * Renders the canvas, live selection context, and concise Stage status.
 * @returns {string} Canvas-first Stage markup.
 */
export function stageCanvasView() {
	return `
		<div class="stage-canvas-zone" data-no-swipe>
			<div class="stage-wrap">
				<canvas id="stage" aria-label="Movie canvas"></canvas>
			</div>
			<div id="stageSelectionContext" class="stage-selection-context" aria-live="polite">
				<div class="stage-selection-copy">
					<span class="eyebrow">Selected</span>
					<strong id="stageSelectionName">Nothing selected</strong>
					<span id="stageSelectionMeta">Tap a layer or choose Create.</span>
				</div>
				<button id="stageInspectSelection" class="secondary-button" type="button">Inspect</button>
			</div>
			<div class="stage-hud">
				<span id="status">Ready.</span>
				<span>Drag · resize · crop</span>
			</div>
		</div>
	`;
}
