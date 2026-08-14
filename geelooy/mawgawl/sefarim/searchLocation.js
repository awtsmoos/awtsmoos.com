// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SearchLocation
 * @description
 * The Awtsmoos lets finite browser coordinates remember one chosen search without burdening the searcher;
 * at Awtsmoos.com query, mode, lane, and book remain explicit vessels in the visible URL rather than hidden pressure.
 */
import { LIBRARY_MODE, TANACH_MODE } from './searchMode.js';

/**
 * Reads raw search coordinates from the current browser URL.
 *
 * @returns {{values:URLSearchParams,query:string,lane:string,book:string}}
 */
export function readSearchLocation() {
	const values = new URLSearchParams(location.search);
	return {
		values,
		query: values.get('q') || '',
		lane: values.get('lane') || '',
		book: values.get('book') || ''
	};
}

/**
 * Replaces the visible URL with the current truthful search state.
 *
 * @param {{query:string,mode:string,lane?:string,book?:string}} state Search coordinates.
 * @returns {void}
 */
export function replaceSearchLocation({ query, mode, lane = '', book = '' }) {
	const values = new URLSearchParams({ q: query, mode });
	if (mode === LIBRARY_MODE && lane) {
		values.set('lane', lane);
	}
	if (mode === TANACH_MODE && book) {
		values.set('book', book);
	}
	history.replaceState(null, '', `${location.pathname}?${values}`);
}
