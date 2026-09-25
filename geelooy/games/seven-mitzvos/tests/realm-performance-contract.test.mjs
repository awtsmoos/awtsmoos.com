//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { RealmQualityGovernor } from '../js/realm/realm-quality-governor.js';

/**
 * @file realm-performance-contract.test.mjs
 * @description Protects Seven Mitzvos native adaptive quality without renderer-specific shadow or pixel-ratio fossils.
 * The Awtsmoos renews every frame beyond finite pressure; Awtsmoos.com yields resolution and distant density before input truth is lost.
 */
function stageDouble() {
	const state = {
		canvas: { dataset: {} },
		qualityDpr: 1.4,
		resizeCount: 0,
		runtime: {
			performance: {
				setQualityPixelRatio(value) {
					state.qualityDpr = value;
				}
			}
		},
		resize() {
			state.resizeCount += 1;
		}
	};
	return state;
}

test('realm quality governor keeps a bounded allocation-free sample ring', () => {
	const governor = new RealmQualityGovernor(stageDouble());
	assert.ok(governor.samples instanceof Float32Array);
	assert.equal(governor.samples.length, 180);
	assert.equal(governor.sampleCount, 0);
	for (let index = 0; index < 220; index += 1) governor.observe(1 / 60);
	assert.equal(governor.sampleCount, 180);
	assert.ok(governor.current().fps > 0);
});

test('over-budget native frames degrade resolution, population, and simulation stride', () => {
	const stage = stageDouble();
	const governor = new RealmQualityGovernor(stage);
	const first = governor.observe(0.020);
	assert.equal(first.id, 'balanced');
	assert.equal(stage.qualityDpr, 1.05);
	assert.equal(stage.canvas.dataset.realmLighting, 'native-environment');
	const second = governor.observe(0.020);
	assert.equal(second.id, 'reduced');
	assert.equal(stage.qualityDpr, 0.85);
	assert.ok(second.npcRatio < 1);
	assert.ok(second.stride > 1);
	assert.ok(stage.resizeCount >= 2);
});

test('sustained headroom recovers quality gradually rather than oscillating', () => {
	const stage = stageDouble();
	const governor = new RealmQualityGovernor(stage);
	governor.observe(0.020);
	governor.observe(0.020);
	assert.equal(governor.current().id, 'reduced');
	for (let index = 0; index < 239; index += 1) governor.observe(0.010);
	assert.equal(governor.current().id, 'reduced');
	governor.observe(0.010);
	assert.equal(governor.current().id, 'balanced');
});

test('metrics publish the 16.67ms target and native quality evidence on the stage canvas', () => {
	const stage = stageDouble();
	const governor = new RealmQualityGovernor(stage);
	for (let index = 0; index < 32; index += 1) governor.observe(1 / 60);
	governor.writeMetrics();
	assert.equal(stage.canvas.dataset.frameTarget, '16.67');
	assert.match(stage.canvas.dataset.realmFps, /^\d+$/);
	assert.match(stage.canvas.dataset.realmP95, /^\d+\.\d{2}$/);
	assert.match(stage.canvas.dataset.realmNpcRatio, /^\d/);
	assert.equal(stage.canvas.dataset.realmLighting, 'native-environment');
});
