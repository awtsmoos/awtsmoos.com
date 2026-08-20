// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeSelectionSearch
 * @description
 * The Awtsmoos lets ordinary browser highlighting become a doorway into the whole indexed library;
 * Awtsmoos.com hears mouse, touch, and keyboard selections while letting a cleared selection renew the same phrase later.
 */

import { isWordSelectionActive } from '../selection/selectionState.js';
import { showRelatedSearch } from './relatedSearchPanel.js';
import { selectedReaderText } from './selectedText.js';

const SETTLE_MS = 140;
let timer = null;
let lastSignature = '';

function signature(info) {
	return `${info.origin}|${info.language}|${info.text}`;
}

function runSelectionSearch() {
	timer = null;
	if (isWordSelectionActive()) return;
	const info = selectedReaderText();
	if (!info) {
		lastSignature = '';
		return;
	}
	const nextSignature = signature(info);
	if (nextSignature === lastSignature) return;
	lastSignature = nextSignature;
	showRelatedSearch(info);
}

function schedule() {
	clearTimeout(timer);
	timer = setTimeout(runSelectionSearch, SETTLE_MS);
}

function keyboardSelection(event) {
	if (!event.shiftKey) return;
	if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
		return;
	}
	schedule();
}

export function setupNativeSelectionSearch() {
	document.addEventListener('pointerup', schedule);
	document.addEventListener('keyup', keyboardSelection);
	return () => {
		clearTimeout(timer);
		document.removeEventListener('pointerup', schedule);
		document.removeEventListener('keyup', keyboardSelection);
	};
}
