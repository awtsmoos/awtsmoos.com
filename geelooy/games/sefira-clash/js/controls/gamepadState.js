//B"H
//Boruch Hashem
//Blessed is He

/**
 * Each controller receives its own semantic current in this Awtsmoos.com module. The
 * Awtsmoos renews every indexed pad independently; start or select may now speak the
 * same lived-world interaction covenant as E and Enter without changing combat buttons.
 */

export function readGamepadAt(index, navigatorObject = globalThis.navigator) {
	const pad = navigatorObject?.getGamepads?.()?.[index];
	if (!pad?.connected) return blankGamepadState();
	const x = deadZone(pad.axes?.[0] || 0);
	const y = deadZone(pad.axes?.[1] || 0);
	return {
		x,
		y,
		aimX: x,
		aimY: y,
		down: y > 0.5,
		jump: pressed(pad, 0) || pressed(pad, 3),
		punch: pressed(pad, 2),
		kick: pressed(pad, 1),
		grab: pressed(pad, 4),
		shield: pressed(pad, 5) || pressed(pad, 6),
		special: pressed(pad, 7),
		interact: pressed(pad, 8) || pressed(pad, 9)
	};
}

export function connectedGamepadIndices(navigatorObject = globalThis.navigator) {
	const pads = navigatorObject?.getGamepads?.() || [];
	return [...pads].filter(pad => pad?.connected).map(pad => pad.index);
}

export function blankGamepadState() {
	return {
		x: 0,
		y: 0,
		aimX: 0,
		aimY: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false,
		interact: false
	};
}

function pressed(pad, index) {
	return Boolean(pad.buttons?.[index]?.pressed);
}

function deadZone(value) {
	const magnitude = Math.abs(value);
	if (magnitude < 0.16) return 0;
	return Math.sign(value) * Math.min(1, (magnitude - 0.16) / 0.84);
}
