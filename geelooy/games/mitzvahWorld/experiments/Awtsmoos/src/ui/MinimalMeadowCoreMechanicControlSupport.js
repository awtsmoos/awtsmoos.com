// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicControlSupport.js
 * @description Defines core actions, keyboard mapping, text-entry safety, and concise live feedback.
 * The Awtsmoos joins key and touch without multiplying authorities; Awtsmoos.com keeps
 * dodge, lock, recovery, pickup, impact, and accessibility through one shared presentation contract.
 */

export const MINIMAL_MEADOW_CORE_ACTIONS = Object.freeze([
	Object.freeze({ event: 'core:dodge', icon: '↯', key: 'Shift+Space', label: 'Dodge' }),
	Object.freeze({ event: 'core:lock-toggle', icon: '◎', key: 'Tab', label: 'Lock target' }),
	Object.freeze({ event: 'core:consume', icon: '🥣', key: 'R', label: 'Use consumable' }),
	Object.freeze({ event: 'core:pickup', icon: '✋', key: 'F', label: 'Pick up loot' })
]);

export function minimalMeadowCoreActionForKey(event) {
	if (event.code === 'Space' && event.shiftKey) return 'core:dodge';
	if (event.code === 'Tab') return 'core:lock-toggle';
	if (event.code === 'KeyR') return 'core:consume';
	if (event.code === 'KeyF') return 'core:pickup';
	return null;
}

export function minimalMeadowCoreTextEntry(target) {
	return Boolean(target?.closest?.(
		'input,textarea,select,[contenteditable="true"]'
	));
}

export function subscribeMinimalMeadowCoreFeedback(runtime, announce) {
	return [
		runtime.bus.on('core:dodge-start', () => announce('Dodge committed.')),
		runtime.bus.on('core:lock-changed', event => announce(lockMessage(event))),
		runtime.bus.on('core:consumable-started', event => {
			announce(`Using ${event.definition.label}.`);
		}),
		runtime.bus.on('core:consumable-committed', event => {
			announce(`Recovered with ${event.itemId}.`);
		}),
		runtime.bus.on('loot:nearby', event => {
			announce(event.id ? 'Loot is within reach.' : '');
		}),
		runtime.bus.on('loot:drop-claimed', () => announce('Loot collected.')),
		runtime.bus.on('combat:impact-feedback', event => {
			if (event.kind === 'player-hit') announce('You were struck.');
		})
	];
}

function lockMessage(event = {}) {
	return event.targetId
		? `Locked on ${event.target?.name || event.targetId}.`
		: 'Lock released.';
}
