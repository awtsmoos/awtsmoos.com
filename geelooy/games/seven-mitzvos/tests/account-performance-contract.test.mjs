//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRealmState } from '../js/realm/realm-state.js';

/**
 * @module AccountPerformanceContractTest
 * @description
 * Enduring identity must add no account service to the animation loop. The Awtsmoos
 * is beyond time; Awtsmoos.com proves fixed frame law, hidden-drawer restraint,
 * procedural-core equipment, continuous coordinates, and bounded version-two state.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');

test('version-two account has ten skills and explicit frame target remains', () => {
	const state = createRealmState();
	assert.equal(state.version, 2);
	assert.equal(Object.keys(state.player.skills).length, 10);
	assert.match(read('js/realm/realm-quality-governor.js'), /targetMilliseconds:\s*16\.67/);
});

test('account domain services are absent from animation-critical modules', () => {
	const sources = [
		'realm-quality-governor.js',
		'realm-player-controller.js',
		'realm-npc-director.js'
	].map(name => read(`js/realm/${name}`)).join(String.fromCharCode(10));
	for (const service of ['BankService', 'QuestService', 'EquipmentService', 'CollectionService', 'AchievementService', 'RecoveryService']) {
		assert.doesNotMatch(sources, new RegExp(service));
	}
});

test('hidden account drawer skips repeated reconstruction', () => {
	const source = read('js/realm/realm-account-view.js');
	assert.match(source, /this\.drawer\.hidden && this\.signature/);
	assert.match(source, /this\.signature === signature/);
});

test('visible equipment uses procedural core and physical material roles', () => {
	const source = read('js/realm/realm-equipment-visualizer.js');
	assert.match(source, /CorePartFactory/);
	for (const material of ['cloth', 'leather', 'timber', 'iron']) assert.match(source, new RegExp(`'${material}'`));
	assert.match(read('js/procedural/advanced-profile-factory.js'), /equipment-detail/);
	assert.match(read('js/realm/realm-stage-builder.js'), /dataset\.equippedVisuals/);
});

test('account world preserves continuous movement and forbids grid vocabulary', () => {
	const source = [
		read('js/realm/realm-player-controller.js'),
		read('js/realm/account/travel-service.js'),
		read('js/realm/realm-stage-builder.js')
	].join(String.fromCharCode(10));
	assert.match(source, /Math\.hypot|moveTo|position/);
	for (const term of ['GridHelper', 'tileMap', 'tileIndex', 'gridIndex', 'snapToGrid', 'cellSize']) {
		assert.doesNotMatch(source, new RegExp(term, 'i'));
	}
});
