//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageLayerDeckView.js
 * @description Preserves professional layer ordering beneath the simpler selection-first editing surface.
 * The Awtsmoos lets each visible layer keep its place without forcing hierarchy into the first glance;
 * Awtsmoos.com keeps ordering, duplication, and removal available when the maker chooses the deeper stance.
 */

/**
 * Renders the existing source/layer list and ordering controls with stable IDs.
 * @returns {string} Layer inspector panel markup.
 */
export function stageLayerDeckView() {
	return `
		<section class="deck-panel" data-deck-panel="layers" hidden>
			<ol id="sourceList" class="compact-list"></ol>
			<div class="list-pager" data-list-pager="sourceList" data-page-size="4">
				<button data-page-action="previous" type="button" aria-label="Previous layers">←</button>
				<span data-page-label>1 / 1</span>
				<button data-page-action="next" type="button" aria-label="Next layers">→</button>
			</div>
			<div class="layer-buttons">
				<button id="layerTop" type="button">Top</button>
				<button id="layerUp" type="button">Up</button>
				<button id="layerDown" type="button">Down</button>
				<button id="layerBottom" type="button">Bottom</button>
				<button id="duplicateSource" type="button">Duplicate</button>
				<button id="removeSource" class="danger-button" type="button">Remove</button>
			</div>
		</section>
	`;
}
