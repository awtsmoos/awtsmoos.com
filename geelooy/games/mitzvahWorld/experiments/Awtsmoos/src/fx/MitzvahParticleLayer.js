// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahParticleLayer.js
 * @description One tasteful WebGL particle vessel for MitzvahWorld: celebration bursts for
 * mitzvah moments, gentle rising sparkles, and ambient meadow motes. Simulation state is
 * packed every frame through the procedural core's real particle packer
 * (`createParticleRenderArtifact`) and drawn as GL_POINTS with the game's own WebGL
 * context, so particles can never desynchronize from the renderer's truth. The layer
 * owns its program and buffers, restores GL state after every draw, and is fully
 * guarded at its call site so a particle failure can never break the visible frame.
 * Deterministic seeded RNG keeps every emission reproducible.
 */

import { createParticleRenderArtifact } from '../../../../../../libs/awtsmoos-procedural-core/src/core/proceduralObject/particles/createParticleRenderArtifact.js';
import { lookAt, perspective } from '../../../light-three-gltf/tiny-camera-math.js';
import { multiply } from '../../../light-three-gltf/tiny-matrix-core.js';

const MAX_LIVE_PARTICLES = 2000;
const MAX_FRAME_DELTA_SECONDS = 0.05;

const BURST_COLORS = ['#ffd873', '#fff3c4', '#ffb347', '#ffffff', '#f6d86b'];
const SPARKLE_COLORS = ['#fffbe8', '#ffe9a8', '#ffffff'];
const MOTE_COLORS = ['#fff6d8', '#e8f4ff'];

const PARTICLE_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec4 aColor;
attribute float aSize;
uniform mat4 uProjectionView;
uniform float uSizeScale;
varying vec4 vColor;
void main() {
	vec4 clip = uProjectionView * vec4(aPosition, 1.0);
	gl_Position = clip;
	float w = max(0.1, clip.w);
	gl_PointSize = clamp(aSize * uSizeScale / w, 1.0, 64.0);
	vColor = aColor;
}
`;

const PARTICLE_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 vColor;
void main() {
	vec2 centered = gl_PointCoord - vec2(0.5);
	float radius = length(centered) * 2.0;
	if (radius > 1.0) discard;
	float soft = smoothstep(1.0, 0.2, radius);
	gl_FragColor = vec4(vColor.rgb * soft, vColor.a * soft);
}
`;

/** Deterministic 32-bit string hash (xfnv1a). */
function hashSeedString(seed) {
	let hash = 2166136261;
	const text = String(seed);
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/** Deterministic PRNG (mulberry32). */
function createSeededRng(seed) {
	let state = hashSeedString(seed) || 1;
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
}

/** Parses '#rgb'/'#rrggbb' into [r,g,b] 0..1. */
function hexToRgb(hex) {
	let clean = String(hex || '#ffffff').replace('#', '');
	if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
	const value = parseInt(clean.slice(0, 6), 16);
	if (!Number.isFinite(value)) return [1, 1, 1];
	return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function pick(rng, list) {
	return list[Math.floor(rng() * list.length) % list.length];
}

function finitePoint(point, fallback) {
	const candidate = point || fallback || { x: 0, y: 0, z: 0 };
	const x = Number(candidate.x);
	const y = Number(candidate.y);
	const z = Number(candidate.z);
	return [
		Number.isFinite(x) ? x : 0,
		Number.isFinite(y) ? y : 0,
		Number.isFinite(z) ? z : 0
	];
}

function cameraForward(camera) {
	try {
		const position = readCameraPoint(camera?.position);
		const target = readCameraPoint(camera?.target) || [position[0], position[1] + 1, position[2]];
		const forward = [target[0] - position[0], target[1] - position[1], target[2] - position[2]];
		const length = Math.hypot(forward[0], forward[1], forward[2]);
		if (length > 1e-6) return [forward[0] / length, forward[1] / length, forward[2] / length];
	} catch { /* fall through to default */ }
	return [0, 0, -1];
}

function readCameraPoint(point) {
	if (!point) return null;
	if (typeof point.toArray === 'function') {
		const array = point.toArray();
		if (Array.isArray(array) && array.length >= 3) return [array[0], array[1], array[2]];
		return null;
	}
	if (Array.isArray(point) && point.length >= 3) return [point[0], point[1], point[2]];
	if (Number.isFinite(point.x)) return [point.x, Number(point.y) || 0, Number(point.z) || 0];
	return null;
}

function projectionViewMatrix(camera) {
	const fallback = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	try {
		if (!camera) return fallback;
		const position = readCameraPoint(camera.position) || [0, 2, 8];
		const target = readCameraPoint(camera.target) || [0, 1, 0];
		const projection = perspective(
			Number(camera.fov) || 60,
			Number(camera.aspect) || 1.78,
			Number(camera.near) || 0.1,
			Number(camera.far) || 1000
		);
		return multiply(projection, lookAt(position, target));
	} catch {
		return fallback;
	}
}

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) || 'unknown';
		gl.deleteShader(shader);
		throw new Error(`MitzvahParticleLayer shader failed: ${log}`);
	}
	return shader;
}

function createParticleProgram(gl) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, PARTICLE_VERTEX_SHADER);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, PARTICLE_FRAGMENT_SHADER);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`MitzvahParticleLayer link failed: ${gl.getProgramInfoLog(program) || 'unknown'}`);
	}
	return {
		program,
		locations: {
			position: gl.getAttribLocation(program, 'aPosition'),
			color: gl.getAttribLocation(program, 'aColor'),
			size: gl.getAttribLocation(program, 'aSize'),
			projectionView: gl.getUniformLocation(program, 'uProjectionView'),
			sizeScale: gl.getUniformLocation(program, 'uSizeScale')
		}
	};
}

export class MitzvahParticleLayer {
	/**
	 * @param {object} [options={}]
	 * @param {string} [options.systemId] Stable particle-system identity.
	 * @param {string|number} [options.seed] Deterministic RNG seed.
	 * @param {number} [options.maxParticles] Live-particle cap (default 2000).
	 */
	constructor(options = {}) {
		this.systemId = String(options.systemId || 'mitzvah-fx');
		this.maxParticles = Math.min(
			4000,
			Math.max(64, Math.floor(Number(options.maxParticles) || MAX_LIVE_PARTICLES))
		);
		this.rng = createSeededRng(options.seed ?? 'mitzvah-fx');
		this.particles = [];
		this.tick = 0;
		this.nextId = 1;
		this.ambient = null;
		this.glState = null;
		this.lastNow = 0;
		this.lastArtifact = null;
	}

	/** Celebration burst: warm golden sparks with gravity, for mitzvah moments. */
	spawnBurst(position, colors = BURST_COLORS, options = {}) {
		const origin = finitePoint(position);
		const count = Math.min(160, Math.max(8, Math.floor(Number(options.count) || 90)));
		const speed = Number(options.speed) || 6;
		const lifetime = Number(options.lifetime) || 1.6;
		const gravity = Number(options.gravity ?? -5.5);
		for (let i = 0; i < count; i++) {
			const theta = this.rng() * Math.PI * 2;
			const phi = Math.acos(2 * this.rng() - 1);
			const magnitude = speed * (0.35 + this.rng() * 0.85);
			const rgb = hexToRgb(pick(this.rng, colors));
			this.addParticle({
				position: [origin[0], origin[1], origin[2]],
				velocity: [
					magnitude * Math.sin(phi) * Math.cos(theta),
					Math.abs(magnitude * Math.cos(phi)) * 0.9 + 1.2,
					magnitude * Math.sin(phi) * Math.sin(theta)
				],
				size: 2.6 + this.rng() * 4.2,
				lifetime: lifetime * (0.6 + this.rng() * 0.7),
				gravity,
				drag: 1.4,
				color: [rgb[0], rgb[1], rgb[2], 0.95],
				fade: 'out'
			});
		}
		return this;
	}

	/** Gentle rising sparkles that drift upward and shimmer. */
	spawnSparkles(position, colors = SPARKLE_COLORS, options = {}) {
		const origin = finitePoint(position);
		const count = Math.min(80, Math.max(4, Math.floor(Number(options.count) || 24)));
		for (let i = 0; i < count; i++) {
			const rgb = hexToRgb(pick(this.rng, colors));
			this.addParticle({
				position: [
					origin[0] + (this.rng() - 0.5) * (Number(options.spread) || 2.4),
					origin[1] + this.rng() * 0.8,
					origin[2] + (this.rng() - 0.5) * (Number(options.spread) || 2.4)
				],
				velocity: [
					(this.rng() - 0.5) * 0.5,
					0.9 + this.rng() * 1.1,
					(this.rng() - 0.5) * 0.5
				],
				size: 1.8 + this.rng() * 2.6,
				lifetime: (Number(options.lifetime) || 2.4) * (0.7 + this.rng() * 0.6),
				gravity: 0.35,
				drag: 0.4,
				color: [rgb[0], rgb[1], rgb[2], 0.8],
				fade: 'in-out'
			});
		}
		return this;
	}

	/** Starts ambient meadow motes drifting inside a bounding box; they respawn forever. */
	startAmbientMotes(bounds, count = 120) {
		const safe = bounds || {};
		this.ambient = {
			min: finitePoint(safe.min, { x: -40, y: 0.5, z: -40 }),
			max: finitePoint(safe.max, { x: 40, y: 7, z: 40 }),
			target: Math.min(400, Math.max(0, Math.floor(Number(count) || 0)))
		};
		return this;
	}

	/** Stops ambient motes; existing motes fade out naturally. */
	stopAmbientMotes() {
		if (this.ambient) this.ambient.target = 0;
		return this;
	}

	/**
	 * Advances simulation, packs the live system through the procedural core's
	 * particle packer, and draws the artifact with the game's own WebGL context.
	 * @param {object} runtime Game runtime carrying renderer/camera.
	 * @param {number} [dtOverride] Explicit delta seconds (tests); otherwise wall-clock.
	 * @returns {object|null} The frozen render artifact, or null when idle.
	 */
	update(runtime, dtOverride) {
		const now = currentTimeMs();
		const dt = dtOverride !== undefined
			? Math.min(MAX_FRAME_DELTA_SECONDS, Math.max(0.001, Number(dtOverride) || 0.016))
			: frameDelta(this.lastNow, now);
		this.lastNow = now;
		this.tick += 1;
		this.maintainAmbient(dt);
		this.stepParticles(dt);
		if (this.particles.length === 0) {
			this.lastArtifact = null;
			return null;
		}
		const system = {
			id: this.systemId,
			tick: this.tick,
			particles: this.particles
		};
		const artifact = createParticleRenderArtifact(system, {
			viewDirection: cameraForward(runtime?.camera)
		});
		this.lastArtifact = artifact;
		this.drawArtifact(runtime, artifact);
		return artifact;
	}

	/** Read-only snapshot for diagnostics and tests. */
	diagnostics() {
		return Object.freeze({
			ambientTarget: this.ambient?.target || 0,
			live: this.particles.length,
			maxParticles: this.maxParticles,
			systemId: this.systemId,
			tick: this.tick
		});
	}

	addParticle(spec) {
		if (this.particles.length >= this.maxParticles) {
			this.particles.shift();
		}
		const particle = {
			id: `${this.systemId}-${this.nextId++}`,
			position: [spec.position[0], spec.position[1], spec.position[2]],
			velocity: [spec.velocity[0], spec.velocity[1], spec.velocity[2]],
			size: Math.max(0.5, Number(spec.size) || 2),
			age: 0,
			lifetime: Math.max(0.2, Number(spec.lifetime) || 1),
			gravity: Number(spec.gravity) || 0,
			drag: Math.max(0, Number(spec.drag) || 0),
			baseAlpha: spec.color?.[3] ?? 1,
			baseColor: [spec.color?.[0] ?? 1, spec.color?.[1] ?? 1, spec.color?.[2] ?? 1],
			fade: spec.fade || 'out',
			ambient: Boolean(spec.ambient),
			attributes: {
				color: [spec.color?.[0] ?? 1, spec.color?.[1] ?? 1, spec.color?.[2] ?? 1, spec.color?.[3] ?? 1],
				previousPosition: [spec.position[0], spec.position[1], spec.position[2]]
			}
		};
		this.particles.push(particle);
		return particle;
	}

	maintainAmbient(dt) {
		if (!this.ambient || this.ambient.target <= 0) return;
		let ambientCount = 0;
		for (const particle of this.particles) {
			if (particle.ambient) ambientCount += 1;
		}
		const missing = this.ambient.target - ambientCount;
		for (let i = 0; i < missing; i++) {
			this.spawnAmbientMote();
		}
	}

	spawnAmbientMote() {
		const { min, max } = this.ambient;
		const rgb = hexToRgb(pick(this.rng, MOTE_COLORS));
		this.addParticle({
			position: [
				min[0] + this.rng() * (max[0] - min[0]),
				min[1] + this.rng() * (max[1] - min[1]),
				min[2] + this.rng() * (max[2] - min[2])
			],
			velocity: [
				(this.rng() - 0.5) * 0.35,
				0.06 + this.rng() * 0.16,
				(this.rng() - 0.5) * 0.35
			],
			size: 1.1 + this.rng() * 1.6,
			lifetime: 9 + this.rng() * 9,
			gravity: 0,
			drag: 0,
			color: [rgb[0], rgb[1], rgb[2], 0.35],
			fade: 'in-out',
			ambient: true
		});
	}

	stepParticles(dt) {
		const alive = [];
		for (const particle of this.particles) {
			particle.age += dt;
			if (particle.age >= particle.lifetime) {
				if (particle.ambient && this.ambient && this.ambient.target > 0) {
					this.spawnAmbientMote();
				}
				continue;
			}
			particle.attributes.previousPosition[0] = particle.position[0];
			particle.attributes.previousPosition[1] = particle.position[1];
			particle.attributes.previousPosition[2] = particle.position[2];
			particle.velocity[1] += particle.gravity * dt;
			const dragFactor = Math.max(0, 1 - particle.drag * dt);
			particle.velocity[0] *= dragFactor;
			particle.velocity[1] *= dragFactor;
			particle.velocity[2] *= dragFactor;
			particle.position[0] += particle.velocity[0] * dt;
			particle.position[1] += particle.velocity[1] * dt;
			particle.position[2] += particle.velocity[2] * dt;
			const age01 = particle.age / particle.lifetime;
			const alpha = particle.fade === 'in-out'
				? particle.baseAlpha * Math.sin(Math.PI * Math.min(1, age01))
				: particle.baseAlpha * (1 - age01);
			particle.attributes.color[3] = Math.max(0, Math.min(1, alpha));
			alive.push(particle);
		}
		this.particles = alive;
	}

	drawArtifact(runtime, artifact) {
		const count = artifact?.metadata?.particleCount || 0;
		if (count === 0) return;
		const gl = runtime?.renderer?.gl;
		if (!gl || typeof gl.createBuffer !== 'function') return;
		try {
			const state = this.glStateFor(gl);
			const { program, locations } = state;
			gl.useProgram(program);
			gl.uniformMatrix4fv(locations.projectionView, false, projectionViewMatrix(runtime?.camera));
			const height = gl.drawingBufferHeight || gl.canvas?.height || 600;
			gl.uniform1f(locations.sizeScale, height * 0.7);
			bindParticleAttribute(gl, state, 'position', locations.position, artifact.positions, 3);
			bindParticleAttribute(gl, state, 'color', locations.color, artifact.colors, 4);
			bindParticleAttribute(gl, state, 'size', locations.size, artifact.sizes, 1);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.depthMask(false);
			gl.drawArrays(gl.POINTS, 0, count);
			gl.depthMask(true);
			gl.disable(gl.BLEND);
			for (const location of [locations.position, locations.color, locations.size]) {
				if (location >= 0) gl.disableVertexAttribArray(location);
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.useProgram(null);
		} catch {
			// Particles must never break the frame; the simulation continues next frame.
		}
	}

	glStateFor(gl) {
		if (this.glState && this.glState.gl === gl) return this.glState;
		if (this.glState && this.glState.gl !== gl && typeof this.glState.gl?.isContextLost === 'function') {
			try { this.glState.gl.deleteProgram(this.glState.program); } catch { /* ignore */ }
		}
		const created = createParticleProgram(gl);
		const buffers = {
			position: gl.createBuffer(),
			color: gl.createBuffer(),
			size: gl.createBuffer()
		};
		this.glState = { gl, program: created.program, locations: created.locations, buffers };
		return this.glState;
	}
}

function bindParticleAttribute(gl, state, name, location, data, itemSize) {
	if (location < 0) return;
	const buffer = state.buffers[name];
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, itemSize, gl.FLOAT, false, 0, 0);
}

function currentTimeMs() {
	try {
		return globalThis.performance?.now?.() ?? Date.now();
	} catch {
		return Date.now();
	}
}

function frameDelta(lastNow, now) {
	if (!lastNow) return 0.016;
	return Math.min(MAX_FRAME_DELTA_SECONDS, Math.max(0.001, (now - lastNow) / 1000));
}

/**
 * Attaches one particle layer to a game runtime.
 * @param {object} [gameContext={}] Carries `runtime`; optional `seed`, `maxParticles`,
 * `ambientMotes` (false disables the gentle meadow motes).
 * @returns {{layer, burst, sparkle, motes, stopMotes, update}} Emitters and per-frame update.
 */
export function attachMitzvahParticles(gameContext = {}) {
	const runtime = gameContext.runtime || null;
	const layer = new MitzvahParticleLayer({
		maxParticles: gameContext.maxParticles,
		seed: gameContext.seed,
		systemId: gameContext.systemId
	});
	if (gameContext.ambientMotes !== false) {
		layer.startAmbientMotes(gameContext.moteBounds, gameContext.moteCount ?? 110);
	}
	if (runtime) {
		runtime.mitzvahParticleLayer = layer;
	}
	const celebrate = detail => {
		try {
			const position = finitePoint(detail?.position, { x: 0, y: 2, z: 0 });
			layer.spawnBurst(position, detail?.colors);
		} catch { /* emitter must never throw */ }
	};
	try {
		runtime?.bus?.on?.('mitzvah:celebrate', celebrate);
	} catch { /* bus is optional */ }
	return Object.freeze({
		layer,
		burst: (position, colors, options) => layer.spawnBurst(position, colors, options),
		sparkle: (position, colors, options) => layer.spawnSparkles(position, colors, options),
		motes: (bounds, count) => layer.startAmbientMotes(bounds, count),
		stopMotes: () => layer.stopAmbientMotes(),
		update: (context, dtOverride) => layer.update(context || runtime, dtOverride),
		diagnostics: () => layer.diagnostics()
	});
}

export default MitzvahParticleLayer;
