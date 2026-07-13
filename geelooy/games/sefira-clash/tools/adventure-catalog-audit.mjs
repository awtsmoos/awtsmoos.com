//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure catalog audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import { ADVENTURE_MAPS, ADVENTURE_WORLDS } from '../js/data/adventure/adventureLevels.js';

/**
 * Proves that the campaign is a sixty-gate authored road rather than a menu claim.
 *
 * The Awtsmoos renews truth directly; this audit refuses duplicate IDs, repeated
 * layouts, empty worlds, missing geometry, unreachable objectives, shallow middle
 * chapters, or a crown road without Perutas, checkpoints, and exits.
 */
assert.equal(ADVENTURE_MAPS.length, 60, 'Adventure must contain exactly sixty gates.');
assert.equal(uniqueCount(ADVENTURE_MAPS.map(map => map.id)), 60, 'Gate IDs must be unique.');
assert.equal(ADVENTURE_WORLDS.length, 10, 'Adventure must contain ten worlds.');

for (const world of ADVENTURE_WORLDS) {
	const levels = ADVENTURE_MAPS.filter(map => map.adventure.worldNo === world.no);
	assert.equal(levels.length, 6, `${world.name} must contain six gates.`);
}

for (const map of ADVENTURE_MAPS) {
	auditUniversalGate(map);
}

const authoredCampaign = ADVENTURE_MAPS.slice(10);
assert.equal(
	uniqueCount(authoredCampaign.map(layoutSignature)),
	authoredCampaign.length,
	'Gates 11–60 must have unique authored row layouts.'
);

for (const map of authoredCampaign) {
	auditAuthoredGate(map);
}

console.log(
	JSON.stringify({
		levels: ADVENTURE_MAPS.length,
		worlds: ADVENTURE_WORLDS.length,
		uniqueIds: uniqueCount(ADVENTURE_MAPS.map(map => map.id)),
		uniqueAuthoredLayouts: uniqueCount(authoredCampaign.map(layoutSignature)),
		authoredGatesWithCheckpoints: authoredCampaign.filter(hasCheckpoint).length,
		authoredGatesWithExits: authoredCampaign.filter(hasExit).length,
		totalPerutas: ADVENTURE_MAPS.reduce((sum, map) => {
			return sum + Number(map.adventure.totalPerutas || 0);
		}, 0)
	})
);

function auditUniversalGate(map) {
	assert.ok(map.name, `${map.id} needs a name.`);
	assert.ok(map.description, `${map.id} needs a description.`);
	assert.ok(map.platforms.length > 0, `${map.id} needs platforms.`);
	assert.ok(map.spawns.length >= 2, `${map.id} needs player and enemy spawns.`);
	assert.ok(Array.isArray(map.adventure.rows), `${map.id} needs authored rows.`);
	assert.ok(
		map.adventure.rows.some(row => row.includes('S')),
		`${map.id} needs S spawn.`
	);
	assert.ok(map.adventure.objective?.type, `${map.id} needs an objective.`);
}

function auditAuthoredGate(map) {
	const gate = map.adventure.no;
	assert.ok(map.adventure.rows.length >= 4, `Gate ${gate} needs at least four authored rows.`);
	assert.ok(map.adventure.idea, `Gate ${gate} needs a mechanical idea.`);
	assert.ok(map.adventure.progression.length >= 3, `Gate ${gate} needs three progression verbs.`);
	assert.ok(map.adventure.enemies.length >= 1, `Gate ${gate} needs a named enemy roster.`);
	assert.ok(map.adventure.totalPerutas >= 4, `Gate ${gate} needs at least four Perutas.`);
	assert.ok(hasCheckpoint(map), `Gate ${gate} needs a checkpoint.`);
	assert.ok(hasExit(map), `Gate ${gate} needs an authored exit.`);
	assert.ok(map.adventure.exit, `Gate ${gate} needs objective text.`);

	const required = Number(map.adventure.objective.perutas || 0);
	assert.ok(
		required <= map.adventure.totalPerutas,
		`Gate ${gate} requires ${required} Perutas but only contains ${map.adventure.totalPerutas}.`
	);
}

function layoutSignature(map) {
	return map.adventure.rows.join('\n');
}

function uniqueCount(values) {
	return new Set(values).size;
}

function hasCheckpoint(map) {
	return map.adventure.checkpoints.length >= 1;
}

function hasExit(map) {
	return Boolean(map.adventure.exitPoint);
}
