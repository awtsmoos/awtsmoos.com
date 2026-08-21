// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeSelectionSearch
 * @description
 * The Awtsmoos lets ordinary browser highlighting become a doorway into the whole indexed library;
 * Awtsmoos.com hears mouse, touch, and keyboard selections while one active word gesture keeps its own boundary clear.
 */

import { isWordSelectionActive } from '../selection/selectionMode.js';
import { showRelatedSearch } from './relatedSearchPanel.js';
import { selectedReaderText } from './selectedText.js';

const SETTLE_MS = 140;
let timer = null;
let lastSignature = '';

/** Returns a stable identity for one native selection search. */
function selectionSignature(info) {
	return `${info.origin}|${info.language}|${info.text}`;
}

/** Reveals one related-search request after browser selection has settled. */
function runSelectionSearch() {
	timer = null;
	if (isWordSelectionActive()) return;
	const info = selectedReaderText();
	if (!info) {
		lastSignature = '';
		return;
	}
	const nextSignature = selectionSignature(info);
	if (nextSignature === lastSignature) return;
	lastSignature = nextSignature;
	showRelatedSearch(info);
}

/** Debounces selection events so touch and pointer completion share one path. */
function scheduleSelectionSearch() {
	clearTimeout(timer);
	timer = setTimeout(runSelectionSearch, SETTLE_MS);
}

/** Responds only to keyboard gestures that can extend a browser text selection. */
function keyboardSelection(event) {
	if (!event.shiftKey) return;
	const selectionKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
	if (!selectionKeys.includes(event.key)) return;
	scheduleSelectionSearch();
}

/** Installs native-selection discovery and returns one complete cleanup function. */
export function setupNativeSelectionSearch() {
	document.addEventListener('pointerup', scheduleSelectionSearch);
	document.addEventListener('keyup', keyboardSelection);
	return () => {
		clearTimeout(timer);
		document.removeEventListener('pointerup', scheduleSelectionSearch);
		document.removeEventListener('keyup', keyboardSelection);
	};
}
