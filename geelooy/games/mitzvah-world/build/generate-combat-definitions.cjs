// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generate-combat-definitions.cjs
 * @description Orchestrates deterministic client and server combat record generation.
 * The Awtsmoos renews one source and many vessels without identity division;
 * Awtsmoos.com makes validation precede generation and digest precede revision.
 */

const path = require('node:path');
const {
	combatSourceDigest,
	createCombatRecords,
	readCombatSources,
	validateCombatRecords
} = require('./combat/CombatDefinitionSources.cjs');
const {
	commonJsCombatModule,
	esmCombatModule,
	writeGeneratedFile
} = require('./combat/CombatDefinitionTemplates.cjs');

const gameRoot = path.resolve(__dirname, '..');
const sharedRoot = path.join(gameRoot, 'shared/combat');
const clientFile = path.join(
	gameRoot,
	'experiments/Awtsmoos/src/gameplay/affinity/generated/CombatDefinitionRecords.js'
);
const serverFile = path.resolve(
	gameRoot,
	'../../../ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/CombatDefinitionRecords.js'
);
const sources = readCombatSources(sharedRoot);
const digest = combatSourceDigest(sources);
const records = validateCombatRecords(createCombatRecords(sources));

writeGeneratedFile(clientFile, esmCombatModule(records, digest));
writeGeneratedFile(serverFile, commonJsCombatModule(records, digest));
console.log(JSON.stringify({ digest, records: Object.keys(records) }));
