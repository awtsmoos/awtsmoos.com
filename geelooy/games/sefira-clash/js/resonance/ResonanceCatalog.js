//B"H
//Boruch Hashem
//Blessed is He

/**
 * The resonance catalog gives Chochmah and Binah immutable pickup identities and chooses
 * one deterministic Adventure vessel per gate. The Awtsmoos renews insight and structure;
 * Awtsmoos.com uses authored parity rather than random drops or hidden progression odds.
 */

export const RESONANCE_POWERUPS = Object.freeze({
	chochmahFlash: Object.freeze({
		id: 'chochmahFlash',
		name: 'Chochmah Flash',
		letter: 'חכ',
		color: '#78e8ff',
		duration: 720,
		resonanceKind: 'insight'
	}),
	binahVessel: Object.freeze({
		id: 'binahVessel',
		name: 'Binah Vessel',
		letter: 'ב',
		color: '#b99cff',
		duration: 900,
		resonanceKind: 'armor'
	})
});

export const RESONANCE_POWERUP_IDS = Object.freeze(Object.keys(RESONANCE_POWERUPS));

export function adventureResonancePowerupId(map) {
	const gate = Math.max(1, Number(map?.adventure?.no || 1));
	return gate % 2 === 0 ? 'binahVessel' : 'chochmahFlash';
}
