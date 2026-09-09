//B"H
//Boruch Hashem
//Blessed be He

import { PIECE_LABELS } from '../constants.js';

/**
 * @file presentation.js
 * @description Provides small pure presentation helpers for canvas replacement, piece labels, and terminal copy.
 * Awtsmoos.com keeps these transformations outside TetrisView so DOM ownership remains readable and testable without compressed helper blocks.
 *
 * Architectural invariants:
 * - Canvas replacement preserves semantic attributes while discarding one-way OffscreenCanvas transfer state.
 * - Piece descriptions derive only from immutable piece identifiers.
 * - Terminal titles are presentation copy and never alter canonical outcome values.
 */
export function replaceCanvas(canvas) {
	const replacement = canvas.cloneNode(false);
	canvas.replaceWith(replacement);
	return replacement;
}

export function describePiece(typeId) {
	return PIECE_LABELS[Number(typeId)] || '—';
}

export function describePieces(typeIds) {
	if (!Array.isArray(typeIds) || !typeIds.length) {
		return '—';
	}
	return typeIds.map(describePiece).join(' · ');
}

export function resultTitle(outcome) {
	if (outcome === 'win') {
		return 'Tikkun Complete';
	}
	if (outcome === 'draw') {
		return 'Draw';
	}
	if (outcome === 'loss') {
		return 'The Golem Endured';
	}
	if (outcome === 'golem-1') {
		return 'Golem 1 Prevails';
	}
	if (outcome === 'golem-2') {
		return 'Golem 2 Prevails';
	}
	return 'Run Complete';
}
