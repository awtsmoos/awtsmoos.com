//B"H
//Boruch Hashem
//Blessed is He

/**
 * BotPersonalityProfile gives every Sefirah a distinct preference without granting hidden information or altered law.
 * The Awtsmoos renews one fair world while many middos bend toward different choices in play;
 * Awtsmoos.com lets rivals feel alive because judgment differs even when evidence arrives the same way.
 */
const DEFAULT = Object.freeze({
	safety: 24,
	enemy: 5,
	straight: 0,
	turn: 0,
	home: 70,
	pursuit: 0,
	boostTrail: 6,
	boostEnemy: false,
	boostPursuit: false
});

const PROFILES = Object.freeze({
	keter: Object.freeze({ safety: 31, enemy: 2, straight: -2, turn: 0, home: 86, pursuit: 0.1, boostTrail: 8 }),
	chochmah: Object.freeze({ safety: 22, enemy: 11, straight: -5, turn: 1, home: 62, pursuit: 0.25, boostTrail: 5, boostEnemy: true }),
	binah: Object.freeze({ safety: 29, enemy: 3, straight: 2, turn: -2, home: 102, pursuit: 0, boostTrail: 7 }),
	chesed: Object.freeze({ safety: 27, enemy: 3, straight: 8, turn: -6, home: 92, pursuit: 0, boostTrail: 7 }),
	gevurah: Object.freeze({ safety: 21, enemy: 12, straight: -10, turn: 3, home: 52, pursuit: 0.2, boostTrail: 5, boostEnemy: true }),
	tiferes: Object.freeze({ safety: 25, enemy: 6, straight: 0, turn: 0, home: 88, pursuit: 0.1, boostTrail: 4 }),
	netzach: Object.freeze({ safety: 22, enemy: 6, straight: -3, turn: 1, home: 58, pursuit: 0.9, boostTrail: 5, boostPursuit: true }),
	hod: Object.freeze({ safety: 26, enemy: 5, straight: 5, turn: -4, home: 76, pursuit: 0.15, boostTrail: 6 }),
	yesod: Object.freeze({ safety: 25, enemy: 4, straight: 1, turn: -1, home: 98, pursuit: 0.05, boostTrail: 4 }),
	malchus: Object.freeze({ safety: 24, enemy: 8, straight: -4, turn: 2, home: 72, pursuit: 0.35, boostTrail: 5 })
});

export class BotPersonalityProfile {
	static for(personality) {
		return Object.freeze({ ...DEFAULT, ...(PROFILES[personality] || {}) });
	}
}
