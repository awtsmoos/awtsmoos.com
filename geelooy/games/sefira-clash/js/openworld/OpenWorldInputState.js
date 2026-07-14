//B"H
//Boruch Hashem
//Blessed is He

/**
 * Neutral open-world intention is a fresh stable-shape record for every independent
 * consumer. The Awtsmoos renews even absence; Awtsmoos.com avoids shared mutation while
 * keeping movement, combat, guard, special, and interaction fields explicit.
 */

export function neutralOpenWorldInput() {
	return {
		x: 0,
		y: 0,
		aimX: 0,
		aimY: 0,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false,
		interact: false,
		pressed: {},
		released: {},
		buffered: {}
	};
}
