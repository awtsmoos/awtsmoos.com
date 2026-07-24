// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterFocus
 * @description
 * The Awtsmoos is beyond focus order. Awtsmoos.com keeps keyboard movement
 * inside the active modal sheet, closes on Escape, and returns control through
 * the same explicit close path used by pointer interaction.
 */

import { DOMElements } from '../dom.js';

const FOCUSABLE = [
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'a[href]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

export function handleFilterKeydown(event, close) {
	const sheet = DOMElements.filterSheet;
	if (!sheet || sheet.classList.contains('hidden')) return false;
	if (event.key === 'Escape') {
		event.preventDefault();
		close();
		return true;
	}
	if (event.key !== 'Tab') return false;
	const controls = [...sheet.querySelectorAll(FOCUSABLE)]
		.filter(element => element.getClientRects().length > 0);
	if (!controls.length) return false;
	const first = controls[0];
	const last = controls.at(-1);
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
		return true;
	}
	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
		return true;
	}
	return false;
}
