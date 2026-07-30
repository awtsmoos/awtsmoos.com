// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyRoleCatalog.js
 * @description Maps hostile species to role behavior while shared profiles own action identity.
 * The Awtsmoos reveals distinct service even within opposition without two competing scrolls;
 * Awtsmoos.com keeps role, weakness, and legacy resistance beside canonical action goals.
 */

const { enemyAffinityProfile } = require('./CombatDefinitionCatalog.js');

const ROLES = Object.freeze({
	'dybbuk-shade': role('dybbuk-shade', 'attacker'),
	'fallen-seraph-husk': role('fallen-seraph-husk', 'ranged-attacker'),
	fox: role('fox', 'attacker'),
	'great-dybbuk': role('great-dybbuk', 'summoner'),
	'kedem-letter-warden': role(
		'kedem-letter-warden',
		'elite-guardian',
		{ guardBreak: 0.35, parry: 0.25 },
		{ physical: 0.12, ranged: 0.08, spiritual: 0.05 }
	),
	'klipah-guardian': role('klipah-guardian', 'guardian'),
	wolf: role('wolf', 'attacker')
});

function role(speciesId, id, weaknesses = {}, resistances = {}) {
	const profile = enemyAffinityProfile(speciesId);
	return Object.freeze({
		actionIds: Object.freeze([...(profile?.actionIds || ['shadow-strike'])]),
		id,
		resistances: Object.freeze({ ...resistances }),
		weaknesses: Object.freeze({ ...weaknesses })
	});
}

function enemyRole(speciesId) {
	return ROLES[speciesId] || role(speciesId, 'attacker');
}

module.exports = { ROLES, enemyRole };
