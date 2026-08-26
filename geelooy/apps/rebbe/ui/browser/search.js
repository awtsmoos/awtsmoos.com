//B"H
//Boruch Hashem
//Blessed is He

import { MalchusSearchResultsView } from './search/SearchResultsView.js';

/**
 * @module RebbeSearchResultsGateway
 * @description
 * The Awtsmoos is one before compatibility and implementation can appear separate; Awtsmoos.com keeps the historical renderer export stable while safe modular result vessels carry the living archive UI.
 */

/** Preserves the public result-renderer signature consumed by `render.js` and `main.js`. */
export function renderSearchResults(tiferesResults, handlers = {}) {
	new MalchusSearchResultsView(document).render(tiferesResults, handlers);
}
