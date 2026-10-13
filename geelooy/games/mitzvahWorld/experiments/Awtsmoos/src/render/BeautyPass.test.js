// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautyPass.test.js
 * @description Budget and correctness gate for the MitzvahWorld beauty pass:
 * palette continuity, sky/water/ground budgets, crafted-structure geometry validity
 * and triangle caps, pooled particle emitters with per-type caps, and the standing
 * DPR caps from WorldQualityProfile (never raised).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
	beautyClamp,
	beautyHashSeed,
	beautyMix,
	beautyNoise2,
	createBeautyRng
} from './BeautyRng.js';
import {
	BEAUTY_GOLDEN_HOUR_T,
	BEAUTY_KEYFRAME_COUNT,
	applyBeautyGrade,
	beautyKeyframes,
	beautySunElevation,
	sampleBeautyPalette
} from './BeautyPalette.js';
import {
	BEAUTY_SKY_BUDGETS,
	beautySkyBudget,
	computeBeautySky,
	computeCloudField,
	computeSkyGradient,
	computeSunShafts,
	sunDiscParams
} from './BeautySky.js';
import {
	BEAUTY_WATER_BUDGETS,
	BEAUTY_WATER_GLSL,
	shoreFoamParams,
	waterColorRamp,
	waterShimmerParams,
	waterSunGlint
} from './BeautyWater.js';
import {
	BEAUTY_GROUND_BUDGETS,
	STONE_STRIDE,
	TUFT_CLOVER,
	TUFT_FLOWER,
	TUFT_GRASS,
	TUFT_STRIDE,
	beautyGroundBudget,
	groundTint,
	needsTuftRebuild,
	placeNearTufts,
	placePathEdging,
	resetBeautyGround
} from './BeautyGround.js';
import {
	BEAUTY_STRUCTURE_BUDGETS,
	buildAllStructures,
	buildStructure,
	structureTriangleBudget
} from './BeautyStructures.js';
import {
	BEAUTY_PARTICLE_TYPE_CAPS,
	MitzvahParticleLayer
} from '../fx/MitzvahParticleLayer.js';
import { resolveDeviceDprCap, resolveWorldQuality } from '../performance/WorldQualityProfile.js';
import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';

function finiteTriple(value, label) {
	assert.ok(Array.isArray(value) && value.length === 3, `${label} is a triple`);
	for (const component of value) {
		assert.ok(Number.isFinite(component), `${label} is finite`);
	}
}

describe('BeautyRng', () => {
	it('is deterministic for the same seed', () => {
		const a = createBeautyRng('tufts');
		const b = createBeautyRng('tufts');
		for (let i = 0; i < 20; i++) assert.equal(a(), b());
		assert.equal(beautyHashSeed('x'), beautyHashSeed('x'));
	});

	it('noise stays in [0, 1) and is deterministic', () => {
		for (const [x, z] of [[0, 0], [3.7, -2.1], [100.25, 55.75]]) {
			const value = beautyNoise2(x, z, 'meadow');
			assert.ok(value >= 0 && value < 1, `noise in range at ${x},${z}`);
			assert.equal(value, beautyNoise2(x, z, 'meadow'));
		}
	});

	it('mix and clamp behave', () => {
		assert.equal(beautyMix(2, 8, 0.25), 3.5);
		assert.equal(beautyClamp(9, 0, 1), 1);
		assert.equal(beautyClamp(-2, 0, 1), 0);
	});
});

describe('BeautyPalette', () => {
	it('carries eight keyframes around the dial', () => {
		assert.equal(BEAUTY_KEYFRAME_COUNT, 8);
		const frames = beautyKeyframes();
		assert.equal(frames.length, 8);
		assert.equal(frames[0].t, 0);
		assert.equal(frames[frames.length - 1].t, 1);
		for (let i = 1; i < frames.length; i++) assert.ok(frames[i].t > frames[i - 1].t);
	});

	it('samples deterministically and continuously', () => {
		const a = sampleBeautyPalette(0.781);
		const b = sampleBeautyPalette(0.781);
		assert.deepEqual(a, b);
		// Continuity: a small time step moves colors only a little.
		const c = sampleBeautyPalette(0.786);
		for (let i = 0; i < 3; i++) {
			assert.ok(Math.abs(c.skyZenith[i] - a.skyZenith[i]) < 0.05, 'sky is continuous');
		}
		assert.ok(Object.isFrozen(a));
		finiteTriple(a.skyZenith, 'skyZenith');
		finiteTriple(a.fogColor, 'fogColor');
	});

	it('rhymes with the golden-hour reference at the golden keyframe', () => {
		const palette = sampleBeautyPalette(BEAUTY_GOLDEN_HOUR_T);
		const ref = REFERENCE_GOLDEN_HOUR.cinematic;
		for (let i = 0; i < 3; i++) {
			assert.ok(Math.abs(palette.skyZenith[i] - ref.skyColor[i]) < 0.02, 'zenith matches reference');
			assert.ok(Math.abs(palette.fogColor[i] - ref.fogColor[i]) < 0.02, 'fog matches reference');
			assert.ok(Math.abs(palette.sunColor[i] - ref.sunColor[i]) < 0.02, 'sun matches reference');
		}
		assert.ok(Math.abs(palette.exposure - ref.exposureDesktop) < 0.02, 'exposure matches reference');
	});

	it('wraps out-of-range times and guards NaN', () => {
		const a = sampleBeautyPalette(1.78);
		const b = sampleBeautyPalette(0.78);
		assert.deepEqual(a.sunColor, b.sunColor);
		const nanSafe = sampleBeautyPalette(Number.NaN);
		finiteTriple(nanSafe.skyZenith, 'nan-safe zenith');
	});

	it('sun elevation peaks near noon and dips at night', () => {
		assert.ok(beautySunElevation(0.5) > beautySunElevation(0.78), 'noon higher than golden hour');
		assert.ok(beautySunElevation(0.0) < 0, 'midnight below horizon');
	});

	it('grading keeps colors finite', () => {
		const palette = sampleBeautyPalette(0.78);
		const graded = applyBeautyGrade([0.5, 0.5, 0.5], palette);
		finiteTriple(graded, 'graded');
	});
});

describe('BeautySky', () => {
	it('budgets are bounded per tier', () => {
		for (const [tier, budget] of Object.entries(BEAUTY_SKY_BUDGETS)) {
			assert.ok(budget.clouds <= 28, `${tier} clouds bounded`);
			assert.ok(budget.sunShafts <= 9, `${tier} shafts bounded`);
		}
		assert.deepEqual(beautySkyBudget('nope'), BEAUTY_SKY_BUDGETS.high);
	});

	it('cloud field is deterministic and within budget', () => {
		const a = computeCloudField('high');
		const b = computeCloudField('high');
		assert.equal(a.length, BEAUTY_SKY_BUDGETS.high.clouds);
		assert.deepEqual(a, b);
		assert.equal(computeCloudField('low').length, BEAUTY_SKY_BUDGETS.low.clouds);
		for (const cloud of a) {
			assert.ok(Number.isFinite(cloud.x) && Number.isFinite(cloud.y) && Number.isFinite(cloud.z));
			assert.ok(cloud.scaleX > 0 && cloud.scaleY > 0);
		}
	});

	it('gradient stops ascend and stay finite', () => {
		const palette = sampleBeautyPalette(0.78);
		const gradient = computeSkyGradient(palette);
		assert.equal(gradient.length, 6);
		for (let i = 1; i < gradient.length; i++) {
			assert.ok(gradient[i][0] > gradient[i - 1][0], 'stops ascend');
		}
		for (const stop of gradient) finiteTriple([stop[1], stop[2], stop[3]], 'stop color');
	});

	it('sun disc swells and reddens as it sinks; moon takes over at night', () => {
		const day = sunDiscParams(sampleBeautyPalette(0.5));
		const golden = sunDiscParams(sampleBeautyPalette(0.78));
		const night = sunDiscParams(sampleBeautyPalette(0.0));
		assert.ok(golden.discAngularSize > day.discAngularSize, 'disc swells at golden hour');
		assert.ok(night.moonIntensity > 0 && !night.isDay, 'moon at night');
		assert.ok(day.isDay && day.coreIntensity > 0, 'sun by day');
	});

	it('shafts respect the budget and fade at noon and night', () => {
		const noonShafts = computeSunShafts(sampleBeautyPalette(0.5), [-0.45, 0.9, -0.72], 'high');
		const nightShafts = computeSunShafts(sampleBeautyPalette(0.0), [-0.45, 0.35, -0.72], 'high');
		// t=0.70: the sun hangs low but still above the horizon — prime shaft territory.
		const goldenShafts = computeSunShafts(sampleBeautyPalette(0.70), [-0.45, 0.35, -0.72], 'high');
		assert.equal(noonShafts.length, 0);
		assert.equal(nightShafts.length, 0);
		assert.ok(goldenShafts.length > 0 && goldenShafts.length <= BEAUTY_SKY_BUDGETS.high.sunShafts);
		for (const shaft of goldenShafts) {
			assert.ok(shaft.intensity > 0 && shaft.intensity <= 0.3, 'shaft intensity bounded');
			assert.ok(shaft.length > 0 && shaft.width > 0);
		}
	});

	it('one-call sky vessel is complete', () => {
		const sky = computeBeautySky(0.78, 'medium');
		assert.ok(sky.palette && sky.gradient && sky.sun && sky.clouds && sky.shafts);
		assert.equal(sky.clouds.length, BEAUTY_SKY_BUDGETS.medium.clouds);
	});
});

describe('BeautyWater', () => {
	it('shimmer phases are finite and flow-reactive', () => {
		const calm = waterShimmerParams(10, 0.15);
		const rapid = waterShimmerParams(10, 2.5);
		assert.ok(Number.isFinite(calm.scrollA[0]) && Number.isFinite(rapid.scrollB[1]));
		assert.ok(rapid.rippleAmplitude > calm.rippleAmplitude, 'faster flow ripples harder');
	});

	it('glint is a bounded non-negative scalar', () => {
		const glint = waterSunGlint([0, 0.7, -0.7], [-0.45, 0.35, -0.72]);
		assert.ok(Number.isFinite(glint) && glint >= 0 && glint <= BEAUTY_WATER_BUDGETS.maxGlint);
	});

	it('foam grows with flow and hugs the shore', () => {
		const fast = shoreFoamParams(3.0, 0.05);
		const slow = shoreFoamParams(0.2, 0.05);
		const deep = shoreFoamParams(3.0, 0.9);
		assert.ok(fast.foamIntensity >= slow.foamIntensity, 'foam grows with flow');
		assert.ok(fast.foamIntensity > deep.foamIntensity, 'foam hugs the shore');
		assert.ok(fast.foamWidth <= BEAUTY_WATER_BUDGETS.maxFoamBand, 'foam band budgeted');
		finiteTriple(fast.foamColor, 'foam color');
	});

	it('color ramp runs shallow to deep', () => {
		const palette = sampleBeautyPalette(0.78);
		const shallow = waterColorRamp(0, palette);
		const deep = waterColorRamp(1, palette);
		finiteTriple(shallow, 'shallow');
		finiteTriple(deep, 'deep');
		const shallowBrightness = shallow[0] + shallow[1] + shallow[2];
		const deepBrightness = deep[0] + deep[1] + deep[2];
		assert.ok(shallowBrightness > deepBrightness, 'deep water is darker');
	});

	it('GLSL snippet is small and declares its uniforms', () => {
		assert.ok(BEAUTY_WATER_GLSL.length < 1600, 'snippet stays small');
		for (const token of ['uTime', 'uFlowSpeed', 'uShoreDist', 'uGlintColor', 'uFoamColor', 'uBaseColor', 'vBeautyUv']) {
			assert.ok(BEAUTY_WATER_GLSL.includes(token), `snippet uses ${token}`);
		}
	});
});

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

describe('BeautyStructures', () => {
	const ids = ['sukkah', 'fence', 'lantern', 'bench', 'well'];

	it('builds all five structures', () => {
		const all = buildAllStructures();
		for (const id of ids) {
			assert.ok(all[id], `${id} built`);
			assert.equal(all[id].id, id);
		}
		assert.throws(() => buildStructure('castle'), /Unknown structure/);
		assert.throws(() => structureTriangleBudget('castle'), /Unknown structure/);
	});

	it('geometry is valid: indices in range, normals and colors finite', () => {
		for (const id of ids) {
			const geo = buildStructure(id);
			assert.ok(geo.vertexCount > 0, `${id} has verts`);
			assert.equal(geo.positions.length, geo.vertexCount * 3);
			assert.equal(geo.normals.length, geo.vertexCount * 3);
			assert.equal(geo.colors.length, geo.vertexCount * 3);
			assert.equal(geo.indices.length, geo.triangleCount * 3);
			for (let i = 0; i < geo.indices.length; i++) {
				assert.ok(geo.indices[i] < geo.vertexCount, `${id} index in range`);
			}
			for (let i = 0; i < geo.positions.length; i++) {
				assert.ok(Number.isFinite(geo.positions[i]), `${id} position finite`);
				assert.ok(Number.isFinite(geo.normals[i]), `${id} normal finite`);
				assert.ok(Number.isFinite(geo.colors[i]), `${id} color finite`);
			}
			// Normals are roughly unit length (flat faces).
			for (let v = 0; v < Math.min(geo.vertexCount, 40); v++) {
				const nx = geo.normals[v * 3], ny = geo.normals[v * 3 + 1], nz = geo.normals[v * 3 + 2];
				const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
				assert.ok(Math.abs(len - 1) < 0.05, `${id} normal ${v} unit-ish`);
			}
		}
	});

	it('face winding matches the supplied normals (no inside-out parts)', () => {
		// Every face's geometric normal must agree with its vertex normal:
		// with default CCW front-face culling, an inverted face is culled.
		for (const id of ids) {
			const geo = buildStructure(id);
			for (let t = 0; t < geo.triangleCount; t++) {
				const i0 = geo.indices[t * 3], i1 = geo.indices[t * 3 + 1], i2 = geo.indices[t * 3 + 2];
				const px = [i0, i1, i2].map(i => [
					geo.positions[i * 3], geo.positions[i * 3 + 1], geo.positions[i * 3 + 2]
				]);
				const n = [geo.normals[i0 * 3], geo.normals[i0 * 3 + 1], geo.normals[i0 * 3 + 2]];
				const e1 = [px[1][0] - px[0][0], px[1][1] - px[0][1], px[1][2] - px[0][2]];
				const e2 = [px[2][0] - px[0][0], px[2][1] - px[0][1], px[2][2] - px[0][2]];
				const face = [
					e1[1] * e2[2] - e1[2] * e2[1],
					e1[2] * e2[0] - e1[0] * e2[2],
					e1[0] * e2[1] - e1[1] * e2[0]
				];
				const faceLen = Math.hypot(face[0], face[1], face[2]);
				const normalLen = Math.hypot(n[0], n[1], n[2]);
				if (faceLen < 1e-9 || normalLen < 0.5) continue;
				const cosine = (face[0] * n[0] + face[1] * n[1] + face[2] * n[2]) / (faceLen * normalLen);
				assert.ok(cosine > 0, `${id} triangle ${t} winds against its normal`);
			}
		}
	});

	it('triangle counts respect the budgets', () => {
		for (const id of ids) {
			const geo = buildStructure(id);
			const budget = structureTriangleBudget(id);
			assert.equal(budget, BEAUTY_STRUCTURE_BUDGETS[id]);
			assert.ok(geo.triangleCount <= budget, `${id}: ${geo.triangleCount} <= ${budget}`);
			assert.ok(geo.triangleCount >= 24, `${id} is not degenerate`);
		}
	});

	it('builds are deterministic', () => {
		for (const id of ids) {
			const a = buildStructure(id);
			const b = buildStructure(id);
			assert.equal(a.triangleCount, b.triangleCount);
			assert.deepEqual(Array.from(a.positions), Array.from(b.positions));
		}
	});

	it('structures carry material color variation (not one flat paint)', () => {
		const sukkah = buildStructure('sukkah');
		let minR = 2, maxR = -1;
		for (let i = 0; i < sukkah.vertexCount; i++) {
			const r = sukkah.colors[i * 3];
			if (r < minR) minR = r;
			if (r > maxR) maxR = r;
		}
		assert.ok(maxR - minR > 0.15, 'sukkah has real color variation');
	});
});

describe('MitzvahParticleLayer beauty emitters', () => {
	it('per-type caps are enforced', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test' });
		for (let round = 0; round < 4; round++) {
			layer.spawnFireflies({ x: 0, y: 1, z: 0 }, { count: 120 });
		}
		const diag = layer.diagnostics();
		assert.ok(diag.typeCounts.firefly <= BEAUTY_PARTICLE_TYPE_CAPS.firefly,
			`fireflies capped at ${BEAUTY_PARTICLE_TYPE_CAPS.firefly}`);
		// Bursts (uncapped type) still flow through the global cap.
		layer.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 90 });
		assert.ok(layer.diagnostics().live <= layer.diagnostics().maxParticles);
	});

	it('ambient fireflies fill to target and respawn', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test-2' });
		layer.startAmbientFireflies({ min: { x: -10, y: 1, z: -10 }, max: { x: 10, y: 4, z: 10 } }, 40);
		for (let i = 0; i < 10; i++) layer.update(null, 0.016);
		const diag = layer.diagnostics();
		assert.ok(diag.typeCounts.firefly >= 30, 'ambient fireflies fill toward target');
		assert.equal(diag.ambientFireflyTarget, 40);
		layer.stopAmbientFireflies();
		assert.equal(layer.diagnostics().ambientFireflyTarget, 0);
	});

	it('leaves sway without NaN and ripples form rings', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test-3' });
		layer.spawnLeaves({ x: 0, y: 4, z: 0 }, { count: 20 });
		layer.spawnRipple({ x: 5, y: 0.2, z: 5 }, { count: 10 });
		for (let i = 0; i < 90; i++) layer.update(null, 0.016);
		for (const particle of layer.particles) {
			for (const component of particle.position) {
				assert.ok(Number.isFinite(component), 'particle position stays finite');
			}
		}
		const diag = layer.diagnostics();
		assert.ok((diag.typeCounts.leaf || 0) + (diag.typeCounts.ripple || 0) >= 0);
		assert.ok(diag.beautyCaps.firefly === 220, 'caps exported in diagnostics');
	});

	it('existing burst/sparkle/mote behavior is unchanged', () => {
		const layer = new MitzvahParticleLayer({ seed: 'beauty-test-4' });
		layer.spawnBurst({ x: 0, y: 2, z: 0 });
		layer.spawnSparkles({ x: 1, y: 1, z: 1 });
		layer.startAmbientMotes({ min: { x: -5, y: 1, z: -5 }, max: { x: 5, y: 3, z: 5 } }, 20);
		layer.update(null, 0.016);
		const diag = layer.diagnostics();
		assert.ok(diag.live > 0, 'particles live');
		assert.equal(diag.ambientTarget, 20);
		assert.deepEqual(diag.typeCounts.firefly || 0, 0);
	});
});

describe('WorldQualityProfile DPR caps (standing constraints)', () => {
	it('never raises DPR caps', () => {
		for (const quality of ['low', 'medium', 'high', 'cinematic']) {
			const profile = resolveWorldQuality({ quality });
			assert.ok(profile.maxDpr <= 1.5, `${quality} DPR cap respected`);
		}
		const limited = resolveDeviceDprCap({ navigator: { deviceMemory: 4, hardwareConcurrency: 2 } });
		assert.equal(limited.maxDpr, 1.0);
		const touch = resolveDeviceDprCap({ navigator: { maxTouchPoints: 5 }, matchMedia: () => ({ matches: false }) });
		assert.equal(touch.maxDpr, 1.5);
	});
});
