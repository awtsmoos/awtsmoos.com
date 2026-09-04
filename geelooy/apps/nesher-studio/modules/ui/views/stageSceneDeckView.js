//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageSceneDeckView.js
 * @description Keeps scene structure available as professional depth while the canvas remains the beginner surface.
 * The Awtsmoos lets many scenes arise without demanding that the maker begin inside their machinery;
 * Awtsmoos.com preserves every familiar scene control beneath a deliberate deeper doorway.
 */

/**
 * Renders the existing scene list and controls with compatibility IDs preserved.
 * @returns {string} Scene inspector panel markup.
 */
export function stageSceneDeckView() {
	return `
		<section class="deck-panel active" data-deck-panel="scenes">
			<ol id="sceneList" class="compact-list"></ol>
			<div class="list-pager" data-list-pager="sceneList" data-page-size="4">
				<button data-page-action="previous" type="button" aria-label="Previous scenes">←</button>
				<span data-page-label>1 / 1</span>
				<button data-page-action="next" type="button" aria-label="Next scenes">→</button>
			</div>
			<div class="button-grid">
				<button id="addScene" type="button">New Scene</button>
				<button id="duplicateScene" type="button">Duplicate</button>
			</div>
		</section>
	`;
}
