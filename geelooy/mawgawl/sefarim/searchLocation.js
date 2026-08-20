// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchLocation
 * @description
 * The Awtsmoos lets finite browser coordinates remember one chosen search without burdening the searcher;
 * at Awtsmoos.com query, mode, lane, book, and exact corpus remain explicit vessels in the visible URL.
 */

import {
	EXACT_MODE,
	LIBRARY_MODE,
	TANACH_MODE
} from './searchMode.js';

/**
 * @returns {{values:URLSearchParams,query:string,lane:string,book:string,corpus:string}}
 */
export function readSearchLocation() {
	const values = new URLSearchParams(location.search);
	return {
		values,
		query: values.get('q') || '',
		lane: values.get('lane') || '',
		book: values.get('book') || '',
		corpus: values.get('corpus') || 'tanach'
	};
}

/**
 * @param {{query:string,mode:string,lane?:string,book?:string,corpus?:string}} state Search coordinates.
 * @returns {void}
 */
export function replaceSearchLocation({
	query,
	mode,
	lane = '',
	book = '',
	corpus = 'tanach'
}) {
	const values = new URLSearchParams({ q: query, mode });
	if (mode === LIBRARY_MODE && lane) {
		values.set('lane', lane);
	}
	if (mode === TANACH_MODE && book) {
		values.set('book', book);
	}
	if (mode === EXACT_MODE && corpus) {
		values.set('corpus', corpus);
	}
	history.replaceState(null, '', `${location.pathname}?${values}`);
}
