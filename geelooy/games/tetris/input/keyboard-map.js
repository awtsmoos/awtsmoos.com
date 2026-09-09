//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file keyboard-map.js
 * @description Converts physical keyboard codes into Tetris semantic actions without owning listeners, repeat timers, or gameplay state.
 * Awtsmoos.com isolates key vocabulary so rebinding and alternate layouts can evolve independently from keyboard lifecycle management.
 *
 * Architectural invariants:
 * - Horizontal directions are returned separately because DAS/ARR owns their held timing.
 * - One-shot actions never embed browser repeat behavior.
 * - Editable targets remain outside gameplay capture.
 */
export function horizontalDirection(code) {
	if (code === 'ArrowLeft' || code === 'KeyA') {
		return -1;
	}
	if (code === 'ArrowRight' || code === 'KeyD') {
		return 1;
	}
	return 0;
}

export function oneShotAction(code) {
	if (code === 'ArrowUp' || code === 'KeyW' || code === 'KeyX') {
		return 'rotate';
	}
	if (isSoftDropCode(code)) {
		return 'soft_drop_start';
	}
	if (code === 'Space') {
		return 'hard_drop';
	}
	if (
		code === 'KeyC' ||
		code === 'ShiftLeft' ||
		code === 'ShiftRight'
	) {
		return 'hold';
	}
	if (code === 'KeyP' || code === 'Escape') {
		return 'pause';
	}
	return '';
}

export function isSoftDropCode(code) {
	return code === 'ArrowDown' || code === 'KeyS';
}

export function editable(target) {
	return Boolean(
		target?.closest?.(
			'input, textarea, select, [contenteditable="true"]'
		)
	);
}
