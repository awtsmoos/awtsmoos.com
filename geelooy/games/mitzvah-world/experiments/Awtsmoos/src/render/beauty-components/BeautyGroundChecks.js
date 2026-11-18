// B"H
/**
 * @file BeautyGroundChecks.js
 * @description Complete ground visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BEAUTY_GROUND_BUDGETS, STONE_STRIDE, TUFT_CLOVER, TUFT_FLOWER, TUFT_GRASS, TUFT_STRIDE, beautyGroundBudget, groundTint, needsTuftRebuild, placeNearTufts, placePathEdging, resetBeautyGround } from '../BeautyGround.js';
import { finiteTriple } from './BeautyAssertionHelpers.js';

describe('BeautyGround', () => {
	it('budgets are bounded per tier', () => {
		for (const [tier, budget] of Object.entries(BEAUTY_GROUND_BUDGETS)) {
			assert.ok(budget.tufts <= 480, `${tier} tufts bounded`);
			assert.ok(budget.edgingStones <= 240, `${tier} stones bounded`);
		}
		assert.deepEqual(beautyGroundBudget('nope'), BEAUTY_GROUND_BUDGETS.high);
	});

	it('ground tint is deterministic and painterly', () => {
		const a = groundTint(3.5, -8.25);
		const b = groundTint(3.5, -8.25);
		assert.deepEqual(a, b);
		finiteTriple(a, 'tint');
		for (const component of a) assert.ok(component >= 0 && component <= 1, 'tint in range');
		const elsewhere = groundTint(40.1, 90.7);
		assert.ok(Math.abs(elsewhere[0] - a[0]) + Math.abs(elsewhere[1] - a[1]) > 0.001, 'tint varies');
	});

	it('tuft placement is pooled, budgeted, and deterministic', () => {
		resetBeautyGround();
		const first = placeNearTufts(10, 20, () => 0, 'high');
		const second = placeNearTufts(10, 20, () => 0, 'high');
		assert.ok(first.count > 0 && first.count <= BEAUTY_GROUND_BUDGETS.high.tufts);
		assert.equal(first.count, second.count);
		assert.ok(first.buffer === second.buffer, 'pooled buffer reused, no per-rebuild allocation');
		assert.deepEqual(Array.from(first.buffer.subarray(0, first.count * TUFT_STRIDE)),
			Array.from(second.buffer.subarray(0, second.count * TUFT_STRIDE)));
		// All tufts sit inside the far LOD ring.
		for (let i = 0; i < first.count; i++) {
			const x = first.buffer[i * TUFT_STRIDE];
			const z = first.buffer[i * TUFT_STRIDE + 2];
			const type = first.buffer[i * TUFT_STRIDE + 4];
			const dx = x - 10, dz = z - 20;
			assert.ok(dx * dx + dz * dz <= 30 * 30 + 1e-6, 'tuft inside LOD ring');
			assert.ok([TUFT_GRASS, TUFT_FLOWER, TUFT_CLOVER].includes(type), 'valid tuft type');
		}
	});

	it('tuft rebuild honors move hysteresis', () => {
		resetBeautyGround();
		assert.ok(needsTuftRebuild(0, 0, 'high'), 'first placement always rebuilds');
		placeNearTufts(0, 0, () => 0, 'high');
		assert.ok(!needsTuftRebuild(1, 1, 'high'), 'small moves skip rebuild');
		assert.ok(needsTuftRebuild(10, 0, 'high'), 'large moves rebuild');
	});

	it('path edging lays paired stones within budget', () => {
		resetBeautyGround();
		const path = [0, 0, 6, 0, 12, 3];
		const { buffer, count } = placePathEdging(path, () => 0, 'medium');
		assert.ok(count > 0 && count <= BEAUTY_GROUND_BUDGETS.medium.edgingStones);
		assert.equal(count % 2, 0, 'stones come in pairs');
		for (let i = 0; i < count; i++) {
			const o = i * STONE_STRIDE;
			assert.ok(Number.isFinite(buffer[o]) && Number.isFinite(buffer[o + 1]) && Number.isFinite(buffer[o + 2]));
			assert.ok(buffer[o + 3] > 0, 'stone has scale');
		}
	});
});
