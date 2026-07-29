// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreaturePopulationScaling.js
 * @description Scales elite health by active regional population while preserving health ratio.
 * The Awtsmoos joins solo and fellowship without making either mandatory; Awtsmoos.com
 * keeps one encounter completable alone while cooperation adds bounded authoritative weight.
 */

function applyCreaturePopulationScale(creature, players) {
	if (creature.speciesId !== 'kedem-letter-warden') return;
	const population = regionalPopulation(creature, players);
	const desiredMaximum = Math.round(
		creature.baseMaximumHealth * (1 + Math.max(0, population - 1) * 0.55)
	);
	if (desiredMaximum === creature.maximumHealth) return;
	const ratio = creature.maximumHealth > 0
		? creature.health / creature.maximumHealth
		: 1;
	creature.maximumHealth = desiredMaximum;
	creature.health = Math.max(1, Math.round(desiredMaximum * ratio));
	creature.populationScale = population;
}

function regionalPopulation(creature, players) {
	let count = 0;
	for (const player of players.values()) {
		const regionId = player.expansion?.region?.id || 'lower-meadow';
		if (player.kind === 'human'
			&& player.combat?.status === 'active'
			&& regionId === creature.regionId) {
			count += 1;
		}
	}
	return Math.max(1, count);
}

module.exports = {
	applyCreaturePopulationScale
};
