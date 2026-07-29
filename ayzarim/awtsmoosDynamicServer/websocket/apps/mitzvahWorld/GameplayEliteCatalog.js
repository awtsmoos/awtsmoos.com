// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayEliteCatalog.js
 * @description Declares the complete Kedem Letter Warden encounter and durable reward.
 * The Awtsmoos turns concealment into readable challenge; Awtsmoos.com keeps telegraphs,
 * phases, roles, scaling, weaknesses, resistances, reward, and unlock authoritative.
 */

const ELITE = Object.freeze({
	actions: Object.freeze([
		'warden-cleave',
		'letter-wave',
		'stone-guard',
		'summit-enrage'
	]),
	id: 'kedem-letter-warden',
	maxHealth: 520,
	multiplayerHealthPerPeer: 0.55,
	phases: Object.freeze([
		Object.freeze({ healthRatio: 1, id: 'measured-guard' }),
		Object.freeze({ healthRatio: 0.45, id: 'burning-letters' })
	]),
	regionId: 'kedem-highlands',
	resistances: Object.freeze({ physical: 0.12, ranged: 0.08, spiritual: 0.05 }),
	reward: Object.freeze({
		id: 'elite:kedem-letter-warden',
		materialId: 'warden-seal',
		quantity: 1,
		unlockId: 'kedem-bounty-board',
		xp: 180
	}),
	role: 'elite-guardian',
	soloScale: 1,
	weaknesses: Object.freeze({ guardBreak: 0.35, parry: 0.25 })
});

const ELITE_ALIASES = Object.freeze({
	'warden-of-letter-ridge': 'kedem-letter-warden'
});

function canonicalEliteId(encounterId) {
	return ELITE_ALIASES[encounterId] || encounterId;
}

module.exports = {
	ELITE,
	ELITE_ALIASES,
	canonicalEliteId
};
