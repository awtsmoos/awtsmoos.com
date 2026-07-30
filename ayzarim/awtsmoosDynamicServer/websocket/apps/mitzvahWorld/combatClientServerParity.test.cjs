// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatClientServerParity.test.cjs
 * @description Executes actual browser ESM and server CJS combat rules against identical contexts.
 * The Awtsmoos renews one law through two runtime vessels without a divided decree;
 * Awtsmoos.com proves prediction and authority share identities, ordering, diagnostics, and degree.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { loadClientEsm } = require('./ClientEsmTestLoader.cjs');
const {
	enemyAffinityProfile,
	playerCombatDefinition
} = require('./CombatDefinitionCatalog.js');
const {
	resolveCombatEffectiveness
} = require('./CombatEffectivenessResolver.js');

const CLIENT_ROOT = path.resolve(
	__dirname,
	'../../../../../geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/affinity'
);

test('client prediction and server authority resolve identical combat contexts', async () => {
	const clientCatalog = await loadClientEsm(
		path.join(CLIENT_ROOT, 'CombatDefinitionCatalog.js')
	);
	const clientRules = await loadClientEsm(
		path.join(CLIENT_ROOT, 'CombatEffectivenessResolver.js')
	);
	for (const context of combatContexts()) {
		const clientAction = clientCatalog.playerCombatDefinition(context.actionId);
		const serverAction = playerCombatDefinition(context.actionId);
		const request = { ...context, action: serverAction };
		const serverResult = resolveCombatEffectiveness(request);
		const clientResult = clientRules.resolveCombatEffectiveness({
			...context,
			action: clientAction
		});
		assert.deepEqual(clone(clientResult), clone(serverResult));
	}
});

test('client and server consume identical generated enemy resistance profiles', async () => {
	const clientCatalog = await loadClientEsm(
		path.join(CLIENT_ROOT, 'CombatDefinitionCatalog.js')
	);
	for (const speciesId of [
		'dybbuk-shade',
		'fallen-seraph-husk',
		'kedem-letter-warden'
	]) {
		assert.deepEqual(
			clone(clientCatalog.enemyAffinityProfile(speciesId)),
			clone(enemyAffinityProfile(speciesId))
		);
	}
});

function combatContexts() {
	return [
		{
			actionId: 'staff-shove',
			baseDamage: 100,
			targetTags: ['guarded']
		},
		{
			actionId: 'staff-heavy',
			baseDamage: 100,
			statusIds: ['soaked'],
			targetTags: ['airborne']
		},
		{
			actionId: 'hebrew-fire',
			baseDamage: 100,
			contextTags: ['counter-cast'],
			statusIds: ['illuminated'],
			targetResistances: { fire: 0.2 }
		}
	];
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
