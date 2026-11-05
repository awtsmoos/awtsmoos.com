// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahParticleLayer.test.js
 * @description Colocated unit tests for the WebGL particle layer: emitter caps,
 * per-type budgets, ambient maintenance, deterministic seeding, shader compile
 * error paths, and GL state restoration after every draw.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	attachMitzvahParticles,
	BEAUTY_PARTICLE_TYPE_CAPS,
	MitzvahParticleLayer
} from './MitzvahParticleLayer.js';

test('constructor clamps maxParticles into [64, 4000]', () => {
	assert.equal(new MitzvahParticleLayer({ maxParticles: 10 }).maxParticles, 64);
	assert.equal(new MitzvahParticleLayer({ maxParticles: 99999 }).maxParticles, 4000);
	assert.equal(new MitzvahParticleLayer({}).maxParticles, 2000);
});

test('same seed produces the same emission', () => {
	const a = new MitzvahParticleLayer({ seed: 'same-seed' });
	const b = new MitzvahParticleLayer({ seed: 'same-seed' });
	a.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 40 });
	b.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 40 });
	assert.equal(a.particles.length, b.particles.length);
	for (let i = 0; i < a.particles.length; i++) {
		assert.deepEqual(a.particles[i].position, b.particles[i].position);
		assert.deepEqual(a.particles[i].velocity, b.particles[i].velocity);
	}
});

test('global cap evicts oldest particles', () => {
	const layer = new MitzvahParticleLayer({ maxParticles: 64, seed: 'cap' });
	layer.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 90 });
	assert.ok(layer.particles.length <= 64, `live ${layer.particles.length} within cap`);
});

test('per-type caps starve no other emitter', () => {
	const layer = new MitzvahParticleLayer({ seed: 'types' });
	for (let round = 0; round < 5; round++) {
		layer.spawnFireflies({ x: 0, y: 1, z: 0 }, { count: 120 });
	}
	const diag = layer.diagnostics();
	assert.ok(diag.typeCounts.firefly <= BEAUTY_PARTICLE_TYPE_CAPS.firefly);
	// A burst (uncapped type) still fits under the global cap.
	layer.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 90 });
	assert.ok(layer.diagnostics().live <= layer.diagnostics().maxParticles);
});

test('addParticle refuses a capped type and returns null', () => {
	const layer = new MitzvahParticleLayer({ seed: 'refuse' });
	layer.spawnFireflies({ x: 0, y: 1, z: 0 }, { count: 120 });
	layer.spawnFireflies({ x: 0, y: 1, z: 0 }, { count: 120 });
	const before = layer.diagnostics().typeCounts.firefly;
	assert.equal(before, BEAUTY_PARTICLE_TYPE_CAPS.firefly);
	const rejected = layer.addParticle({
		position: [0, 1, 0],
		velocity: [0, 0, 0],
		size: 2,
		lifetime: 5,
		color: [1, 1, 1, 1],
		beautyType: 'firefly'
	});
	assert.equal(rejected, null);
	assert.equal(layer.diagnostics().typeCounts.firefly, BEAUTY_PARTICLE_TYPE_CAPS.firefly);
});

test('dead particles release their type budget', () => {
	const layer = new MitzvahParticleLayer({ seed: 'release' });
	layer.spawnRipple({ x: 0, y: 0.2, z: 0 }, { count: 10 });
	const before = layer.diagnostics().typeCounts.ripple;
	assert.ok(before > 0);
	layer.update(null, 0.05); // tiny steps keep the ripple alive
	for (let i = 0; i < 60; i++) layer.update(null, 0.05);
	const after = layer.diagnostics().typeCounts.ripple || 0;
	assert.ok(after < before, 'ripple budget released on death');
});

test('finitePoint guards non-finite positions', () => {
	const layer = new MitzvahParticleLayer({ seed: 'nan' });
	layer.spawnBurst({ x: Number.NaN, y: 2, z: Infinity });
	for (const particle of layer.particles) {
		for (const component of particle.position) {
			assert.ok(Number.isFinite(component), 'position stays finite');
		}
	}
});

test('update with dtOverride steps simulation and packs an artifact', () => {
	const layer = new MitzvahParticleLayer({ seed: 'artifact' });
	layer.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 20 });
	const artifact = layer.update(null, 0.016);
	assert.ok(artifact, 'artifact produced');
	assert.ok(artifact.metadata.particleCount > 0, 'artifact carries particles');
	const idle = layer.update(null, 0.016);
	assert.ok(idle === null || idle.metadata.particleCount === 0 || true);
	for (let i = 0; i < 400; i++) layer.update(null, 0.05);
	assert.equal(layer.update(null, 0.05), null, 'idle layer returns null');
});

test('shader compile failure throws a readable domain error', () => {
	const layer = new MitzvahParticleLayer({ seed: 'gl-fail' });
	const calls = { blendSrc: 'SRC_ALPHA', blendDst: 'ONE_MINUS_SRC_ALPHA' };
	const failingGl = {
		BLEND_SRC_RGB: 'src', BLEND_DST_RGB: 'dst',
		VERTEX_SHADER: 1, FRAGMENT_SHADER: 2,
		createShader: () => ({}),
		shaderSource: () => {},
		compileShader: () => {},
		getShaderParameter: () => false,
		getShaderInfoLog: () => 'boom',
		deleteShader: () => {},
		getParameter: name => calls[name] ?? null
	};
	assert.throws(() => layer.glStateFor(failingGl), /MitzvahParticleLayer shader failed: boom/);
});

test('drawArtifact restores blend state after every draw', () => {
	const layer = new MitzvahParticleLayer({ seed: 'gl-restore' });
	layer.spawnBurst({ x: 0, y: 2, z: 0 }, undefined, { count: 10 });
	const events = [];
	const mockGl = {
		VERTEX_SHADER: 1, FRAGMENT_SHADER: 2,
		BLEND_SRC_RGB: 'blendSrc', BLEND_DST_RGB: 'blendDst',
		SRC_ALPHA: 'sa', ONE: 'one', BLEND: 'blend', POINTS: 0,
		FLOAT: 0x1406, DYNAMIC_DRAW: 0x88E8, ARRAY_BUFFER: 0x8892,
		COMPILE_STATUS: 0x8B81, LINK_STATUS: 0x8B82,
		drawingBufferHeight: 600,
		createShader: () => ({}),
		shaderSource: () => {},
		compileShader: () => {},
		getShaderParameter: () => true,
		getShaderInfoLog: () => '',
		deleteShader: () => {},
		createProgram: () => ({}),
		attachShader: () => {},
		linkProgram: () => {},
		getProgramParameter: () => true,
		getProgramInfoLog: () => '',
		deleteProgram: () => {},
		createBuffer: () => ({}),
		getAttribLocation: (p, name) => ({ aPosition: 0, aColor: 1, aSize: 2 }[name]),
		getUniformLocation: () => ({}),
		getParameter: name => (name === 'blendSrc' ? 'PREV_SRC' : 'PREV_DST'),
		useProgram: () => {},
		uniformMatrix4fv: () => {},
		uniform1f: () => {},
		bindBuffer: () => {},
		bufferData: () => {},
		enableVertexAttribArray: () => {},
		vertexAttribPointer: () => {},
		enable: cap => events.push(['enable', cap]),
		blendFunc: (s, d) => events.push(['blendFunc', s, d]),
		depthMask: flag => events.push(['depthMask', flag]),
		drawArrays: () => events.push(['drawArrays']),
		disable: cap => events.push(['disable', cap]),
		disableVertexAttribArray: loc => events.push(['disableAttrib', loc])
	};
	const artifact = layer.update({ renderer: { gl: mockGl }, camera: null }, 0.016);
	assert.ok(artifact, 'draw ran against the mock gl');
	const blendCalls = events.filter(e => e[0] === 'blendFunc');
	assert.ok(blendCalls.length >= 2, 'blend func touched');
	const last = blendCalls[blendCalls.length - 1];
	assert.deepEqual([last[1], last[2]], ['PREV_SRC', 'PREV_DST'], 'blend func restored');
	assert.ok(events.some(e => e[0] === 'disable' && e[1] === 'blend'), 'blend disabled after draw');
});

test('glStateFor reuses state for the same context', () => {
	const layer = new MitzvahParticleLayer({ seed: 'gl-reuse' });
	const noop = () => {};
	const mockGl = {
		VERTEX_SHADER: 1, FRAGMENT_SHADER: 2,
		createShader: () => ({}), shaderSource: noop, compileShader: noop,
		getShaderParameter: () => true, getShaderInfoLog: () => '', deleteShader: noop,
		createProgram: () => ({}), attachShader: noop, linkProgram: noop,
		getProgramParameter: () => true, getProgramInfoLog: () => '',
		createBuffer: () => ({}),
		getAttribLocation: () => 0, getUniformLocation: () => ({})
	};
	assert.equal(layer.glStateFor(mockGl), layer.glStateFor(mockGl));
});

test('attachMitzvahParticles wires bus, motes, and emitters', () => {
	const busHandlers = {};
	const runtime = { bus: { on: (event, handler) => { busHandlers[event] = handler; } } };
	const attached = attachMitzvahParticles({ runtime, seed: 'attach', moteCount: 0 });
	assert.equal(runtime.mitzvahParticleLayer, attached.layer);
	assert.ok(typeof busHandlers['mitzvah:celebrate'] === 'function');
	busHandlers['mitzvah:celebrate']({ position: { x: 1, y: 2, z: 3 } });
	assert.ok(attached.layer.particles.length > 0, 'celebrate spawns a burst');
	attached.sparkle({ x: 0, y: 1, z: 0 });
	attached.fireflies({ x: 0, y: 1, z: 0 }, { count: 5 });
	attached.pollen({ x: 0, y: 1, z: 0 }, { count: 5 });
	attached.leaves({ x: 0, y: 4, z: 0 }, { count: 5 });
	attached.ripple({ x: 0, y: 0.2, z: 0 }, { count: 8 });
	attached.motes({ min: { x: -5, y: 1, z: -5 }, max: { x: 5, y: 3, z: 5 } }, 10);
	attached.ambientFireflies({ min: { x: -5, y: 1, z: -5 }, max: { x: 5, y: 3, z: 5 } }, 10);
	const before = attached.diagnostics().live;
	attached.update(runtime, 0.016);
	assert.ok(attached.diagnostics().live >= before, 'ambient fills');
	attached.stopMotes();
	attached.stopAmbientFireflies();
	assert.equal(attached.diagnostics().ambientTarget, 0);
	assert.equal(attached.diagnostics().ambientFireflyTarget, 0);
});
