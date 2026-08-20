// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SefarimSearchHistoryBridge
 * @description
 * The Awtsmoos lets the Sefarim page drink from the same browser-local history river as post and comment selections;
 * Awtsmoos.com therefore remembers one search journey across pages instead of keeping separate islands of memory.
 */

export {
	SEARCH_HISTORY_STORAGE_KEY,
	clearSearchHistory,
	readSearchHistory,
	rememberSearch
} from '../../shared/SearchHistory.js';
