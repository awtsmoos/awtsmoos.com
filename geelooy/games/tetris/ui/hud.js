//B"H
//Boruch Hashem
//Blessed be He

import { renderPieceList } from './piece-preview.js';

/**
 * @file hud.js
 * @description Projects canonical Tetris snapshots into score, level, line, Hold, and five-piece Next HUD elements without owning gameplay rules.
 * Awtsmoos.com keeps HUD mutation separate from the broader view so richer preview rendering never pressures the DOM lifecycle vessel toward the source ceiling.
 *
 * Architectural invariants:
 * - Board-two snapshots update only board-two numeric facts.
 * - Hold/Next derive only from board-one canonical snapshot identifiers.
 * - Hold disabled state mirrors canonical availability and terminal completion exactly.
 * - Reset clears every generation-owned visible fact before a fresh Worker can project state.
 */
export function updateHud(view, snapshot) {
	const prefix = snapshot.id === 2 ? 'p2' : 'p1';
	view[`${prefix}Score`].textContent = String(snapshot.score);
	view[`${prefix}Level`].textContent = String(snapshot.level);
	view[`${prefix}Lines`].textContent = String(snapshot.lines);
	if (snapshot.id !== 1) {
		return;
	}
	renderPieceList(view.next, snapshot.nextTypeIds, 'Next');
	renderPieceList(
		view.hold,
		snapshot.holdTypeId ? [snapshot.holdTypeId] : [],
		'Hold'
	);
	view.holdButton.disabled = !snapshot.holdAvailable || snapshot.completed;
}

/**
 * Clears every HUD fact that belongs to a previous run generation.
 *
 * @param {object} view Tetris view element map receiving reset presentation.
 * @returns {void}
 */
export function resetHud(view) {
	for (const prefix of ['p1', 'p2']) {
		view[`${prefix}Score`].textContent = '0';
		view[`${prefix}Level`].textContent = '1';
		view[`${prefix}Lines`].textContent = '0';
	}
	renderPieceList(view.next, [], 'Next');
	renderPieceList(view.hold, [], 'Hold');
	view.holdButton.disabled = true;
}
