// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiExplorerMarkup.js
 * @description Provides the searchable API/UI parity Explorer shell inside Studio utilities.
 * The Awtsmoos renews every callable and visible doorway from one source; Awtsmoos.com gives
 * methods, arguments, actions, receipts, and missing parity a bounded human-readable chamber.
 */

export function movieStudioApiExplorerBodyMarkup() {
	return `
		<div class="movie-api-explorer" data-api-explorer>
			<div class="movie-api-explorer-tools">
				<label><span class="movie-sr-only">Search API methods and UI actions</span><input type="search" data-api-explorer-search placeholder="Search API methods and UI actions…" autocomplete="off"></label>
				<button type="button" data-api-explorer-refresh>Refresh parity</button>
			</div>
			<output class="movie-api-parity" data-api-parity aria-live="polite">Parity not measured.</output>
			<section aria-labelledby="movie-api-methods-title">
				<h3 id="movie-api-methods-title">Public API methods</h3>
				<div class="movie-api-methods" data-api-methods></div>
			</section>
			<section aria-labelledby="movie-ui-actions-title">
				<h3 id="movie-ui-actions-title">Rendered UI actions</h3>
				<div class="movie-api-actions" data-api-actions></div>
			</section>
		</div>
	`;
}
