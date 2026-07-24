//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { RealmQualityGovernor } from '../js/realm/realm-quality-governor.js';

/**
 * @module RealmPerformanceContractTest
 * @description
 * The realm targets 16.67 milliseconds and yields optional detail immediately when
 * frames exceed budget. The Awtsmoos is beyond clocks; Awtsmoos.com proves bounded
 * samples, allocation-free observation, adaptive DPR, shadows, NPC ratio, and stride.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');

test('quality governor begins with the explicit frame target', () => {
	const stage = fakeStage();
	const governor = new RealmQualityGovernor(stage);
	assert.equal(governor.current().targetMilliseconds, 16.67);
	assert.equal(governor.current().id, 'full');
	assert.equal(governor.samples.length, 180);
});

test('one over-budget frame immediately reduces optional visual quality', () => {
	const stage = fakeStage();
	const governor = new RealmQualityGovernor(stage);
	governor.observe(0.018);
	assert.equal(governor.current().id, 'balanced');
	assert.equal(stage.renderer.shadowMap.enabled, true);
	governor.observe(0.020);
	assert.equal(governor.current().id, 'reduced');
	assert.equal(stage.renderer.shadowMap.enabled, false);
	assert.ok(governor.current().npcRatio < 1);
	assert.ok(governor.current().stride > 1);
});

test('sustained pressure reaches emergency tier without touching simulation', () => {
	const stage = fakeStage();
	const governor = new RealmQualityGovernor(stage);
	for (let index = 0; index < 8; index += 1) {
		governor.observe(0.03);
	}
	assert.equal(governor.current().id, 'emergency');
	assert.equal(governor.current().dpr, 0.65);
	assert.equal(governor.current().npcRatio, 0.34);
	assert.equal(governor.current().stride, 4);
});

test('normal observe path does not sort or allocate percentile arrays', () => {
	const source = read('js/realm/realm-quality-governor.js');
	const start = source.indexOf('\tobserve(delta)');
	const end = source.indexOf('\tcurrent()', start);
	const observeBody = source.slice(start, end);
	assert.doesNotMatch(observeBody, /sort\(|Array\.from|new Array/);
	assert.match(source, /new Float32Array\(180\)/);
	assert.match(source, /writeMetrics\(\)/);
});

test('quality writes runtime metrics and frame target to the canvas', () => {
	const stage = fakeStage();
	const governor = new RealmQualityGovernor(stage);
	for (let index = 0; index < 60; index += 1) {
		governor.observe(1 / 60);
	}
	governor.writeMetrics();
	assert.equal(stage.renderer.domElement.dataset.frameTarget, '16.67');
	assert.ok(Number(stage.renderer.domElement.dataset.realmFps) > 0);
	assert.ok(Number(stage.renderer.domElement.dataset.realmP95) > 0);
	assert.ok(stage.resizeCount > 0);
});

function fakeStage() {
	return {
		resizeCount: 0,
		renderer: {
			domElement: { dataset: {} },
			shadowMap: { enabled: true },
			setPixelRatio(value) {
				this.pixelRatio = value;
			}
		},
		resize() {
			this.resizeCount += 1;
		}
	};
}
