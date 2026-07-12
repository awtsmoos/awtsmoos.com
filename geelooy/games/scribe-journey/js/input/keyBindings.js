// B"H

/**
 * The keys are small vessels: many physical buttons, one clear intention.
 * This table keeps browser-specific codes outside the game-world logic.
 */
const BINDINGS = new Map([
	['ArrowUp', { key: 'ArrowUp', direction: 'up', kind: 'hold' }],
	['KeyW', { key: 'ArrowUp', direction: 'up', kind: 'hold' }],
	['ArrowDown', { key: 'ArrowDown', direction: 'down', kind: 'hold' }],
	['KeyS', { key: 'ArrowDown', direction: 'down', kind: 'hold' }],
	['ArrowLeft', { key: 'ArrowLeft', direction: 'left', kind: 'hold' }],
	['KeyA', { key: 'ArrowLeft', direction: 'left', kind: 'hold' }],
	['ArrowRight', { key: 'ArrowRight', direction: 'right', kind: 'hold' }],
	['KeyD', { key: 'ArrowRight', direction: 'right', kind: 'hold' }],
	['ShiftLeft', { key: 'Shift', kind: 'hold' }],
	['ShiftRight', { key: 'Shift', kind: 'hold' }],
	['Space', { key: 'Confirm', kind: 'press' }],
	['Enter', { key: 'Confirm', kind: 'press' }],
	['KeyE', { key: 'Confirm', kind: 'press' }],
	['Escape', { key: 'Menu', kind: 'press' }]
]);

/** Resolves one keyboard event into the canonical game contract. */
export function bindingForEvent(event) {
	return BINDINGS.get(event.code) || null;
}
