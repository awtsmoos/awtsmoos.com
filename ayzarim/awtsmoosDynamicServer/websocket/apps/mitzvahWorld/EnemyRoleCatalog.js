// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyRoleCatalog.js
 * @description Maps each hostile species to role, actions, weakness, and resistance truth.
 * The Awtsmoos reveals distinct service even within opposition; Awtsmoos.com gives attacker,
 * guardian, ranged, support, summoner, elite, and boss roles inspectable behavior records.
 */

const ROLES = Object.freeze({
	'dybbuk-shade': role('attacker', ['shadow-strike', 'reposition-step']),
	'fallen-seraph-husk': role('ranged-attacker', ['letter-bolt', 'warden-retreat']),
	fox: role('attacker', ['beast-bite', 'reposition-step']),
	'great-dybbuk': role('summoner', ['shadow-strike', 'summon-shades', 'ritual-heal']),
	'kedem-letter-warden': role('elite-guardian', [
		'warden-cleave',
		'stone-guard',
		'letter-wave',
		'summit-enrage',
		'summon-shades'
	], { guardBreak: 0.35, parry: 0.25 }, { physical: 0.12, ranged: 0.08, spiritual: 0.05 }),
	'klipah-guardian': role('guardian', ['guardian-slam', 'stone-guard']),
	wolf: role('attacker', ['beast-bite', 'warden-retreat'])
});

function role(id, actionIds, weaknesses = {}, resistances = {}) {
	return Object.freeze({
		actionIds: Object.freeze(actionIds),
		id,
		resistances: Object.freeze(resistances),
		weaknesses: Object.freeze(weaknesses)
	});
}

function enemyRole(speciesId) {
	return ROLES[speciesId] || role('attacker', ['shadow-strike']);
}

module.exports = {
	ROLES,
	enemyRole
};
