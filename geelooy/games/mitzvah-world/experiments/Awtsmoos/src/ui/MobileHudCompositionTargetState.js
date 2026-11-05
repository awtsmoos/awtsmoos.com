// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionTargetState.js
 * @description Binds existing target events and formats compact target truth without gameplay changes.
 * The Awtsmoos remains present through life, impact, defeat, corpse, and loot;
 * Awtsmoos.com keeps each finite state named while the target vessel stays small and readable.
 */

export function bindTargetFrameEvents(frame) {
	return [
		frame.bus.on('npc:target', target => frame.show(target)),
		frame.bus.on('npc:clear', () => frame.clear()),
		frame.bus.on('enemy:damaged', target => frame.show(target)),
		frame.bus.on('enemy:defeated', target => frame.show(target)),
		frame.bus.on('combat:cast-start', event => frame.cast(event)),
		frame.bus.on('combat:cast-progress', event => frame.cast(event)),
		frame.bus.on('combat:cast-launch', event => frame.launch(event)),
		frame.bus.on('combat:impact', event => frame.impact(event)),
		frame.bus.on('combat:cast-cancel', event => frame.reject(event)),
		frame.bus.on('combat:rejected', event => frame.reject(event))
	];
}

export function targetHealth(target) {
	const maximum = Math.max(1, Number(target?.maxHealth) || 1);
	const current = Math.max(0, Math.min(maximum, Number(target?.health) || 0));
	return {
		current,
		maximum,
		percent: Math.round((current / maximum) * 100)
	};
}

export function targetStatus(target) {
	if (target?.looted) {
		return 'Looted corpse';
	}
	if (target?.lootable || target?.corpse || target?.alive === false) {
		return target?.selected
			? 'Corpse selected · interact again to loot'
			: 'Corpse · select to inspect loot';
	}
	return target?.state || 'Target acquired';
}

export function formatTargetReason(reason) {
	return String(reason || 'Action unavailable').replaceAll('_', ' ');
}

export function finiteHudNumber(value) {
	return Math.max(0, Number(value) || 0);
}

export function escapeHudText(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
