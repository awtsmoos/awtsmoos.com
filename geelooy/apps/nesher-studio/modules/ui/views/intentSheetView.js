//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file intentSheetView.js
 * @description Renders one reusable accessible sheet for Create, Edit, Animate, and More without replacing the canvas.
 * The Awtsmoos lets one vessel receive many intentions while the movie remains visible above;
 * Awtsmoos.com keeps focus, title, body, and status stable so progressive disclosure can open gently like love.
 */

/**
 * Renders one shared bottom sheet plus backdrop; controllers replace only its transient contents.
 * @returns {string} Accessible intent sheet markup.
 */
export function intentSheetView() {
	return `
		<div id="intentSheetBackdrop" class="intent-sheet-backdrop" hidden></div>
		<section id="intentSheet" class="intent-sheet" role="dialog" aria-modal="true" aria-labelledby="intentSheetTitle" hidden>
			<header class="intent-sheet-header">
				<div>
					<p id="intentSheetEyebrow" class="eyebrow">Creative action</p>
					<h2 id="intentSheetTitle">Create</h2>
				</div>
				<button id="intentSheetClose" class="intent-sheet-close secondary-button" type="button" aria-label="Close creative action sheet">Close</button>
			</header>
			<div id="intentSheetBody" class="intent-sheet-body"></div>
			<p id="intentSheetStatus" class="intent-sheet-status" role="status" aria-live="polite"></p>
		</section>
	`;
}
