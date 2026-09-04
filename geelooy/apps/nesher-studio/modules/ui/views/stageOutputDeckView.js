//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageOutputDeckView.js
 * @description Keeps finished-output evidence in professional depth without making export machinery dominate creation.
 * The Awtsmoos lets a completed render become a visible vessel while the editable project remains the living root;
 * Awtsmoos.com keeps downloads downstream of creation so a finished file never masquerades as the creative truth.
 */

/**
 * Renders the existing Stage output panel with its stable download-list identity.
 * @returns {string} Output inspector panel markup.
 */
export function stageOutputDeckView() {
	return `
		<section class="deck-panel" data-deck-panel="output" hidden>
			<div id="downloadList" class="download-list">
				<p>Finished files appear here.</p>
			</div>
		</section>
	`;
}
