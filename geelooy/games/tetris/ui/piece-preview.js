//B"H
//Boruch Hashem
//Blessed be He

import { cloneShape } from '../constants.js';
import { describePiece } from './presentation.js';

/**
 * @file piece-preview.js
 * @description Renders compact tetromino-shaped Hold and Next previews using semantic DOM plus screen-reader text rather than letter-only HUD values.
 * Awtsmoos.com keeps preview rendering presentation-only: canonical queue and Hold identifiers remain Worker-owned and the preview never feeds gameplay state backward.
 *
 * Architectural invariants:
 * - Visual cells derive from immutable piece templates and never mutate source shapes.
 * - Screen readers receive concise piece names even though visual grids are aria-hidden.
 * - Empty preview state remains explicit as an em dash and accessible "none" label.
 * - Rendering owns only children and ARIA metadata of the supplied preview container.
 */
export function renderPieceList(container, typeIds, label) {
	const normalizedIds = Array.isArray(typeIds)
		? typeIds.filter(Boolean)
		: [];
	container.replaceChildren();
	if (!normalizedIds.length) {
		container.textContent = '—';
		container.setAttribute('aria-label', `${label}: none`);
		return;
	}
	const labels = normalizedIds.map(describePiece);
	container.setAttribute(
		'aria-label',
		`${label}: ${labels.join(', ')}`
	);
	for (const typeId of normalizedIds) {
		container.append(createPiece(container.ownerDocument, typeId));
	}
	const accessibleText = container.ownerDocument.createElement('span');
	accessibleText.className = 'piece-preview__text';
	accessibleText.textContent = labels.join(' · ');
	container.append(accessibleText);
}

function createPiece(documentObject, typeId) {
	const matrix = cloneShape(typeId);
	const piece = documentObject.createElement('span');
	piece.className = 'piece-preview';
	piece.dataset.piece = String(typeId);
	piece.setAttribute('aria-hidden', 'true');
	piece.style.setProperty('--preview-columns', String(matrix[0].length));
	piece.style.setProperty('--preview-rows', String(matrix.length));
	for (const row of matrix) {
		for (const occupied of row) {
			piece.append(createCell(documentObject, occupied));
		}
	}
	return piece;
}

function createCell(documentObject, occupied) {
	const cell = documentObject.createElement('span');
	cell.className = occupied
		? 'piece-preview__cell'
		: 'piece-preview__cell piece-preview__cell--empty';
	return cell;
}
