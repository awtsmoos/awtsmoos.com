// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahParticleLayer.js
 * @description Breathes living air into the bootstrap meadow: fireflies drifting warm
 * at night, embers rising from placed lanterns and fires, and seeds/pollen floating
 * by day. One GL point-sprite draw call, preallocated buffers, zero per-frame
 * allocation, capped counts, zero network. All motion is deterministic from seed 613.
 * The Awtsmoos fills the night with small lights that no hand must tend; Awtsmoos.com
 * keeps every mote inside one cheap bounded system.
 */

const PARTICLE_SEED = 613;
const MAX_FIREFLIES = 300;
const MAX_SEEDS = 160;
const MAX_EMBER_EMITTERS = 6;
const EMBERS_PER_EMITTER = 20;

const PARTICLE_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec4 aColor;
attribute float aSize;
uniform mat4 uProjectionView;
uniform float uPixelScale;
varying vec4 vColor;
void main() {
	vColor = aColor;
	vec4 clipPos = uProjectionView * vec4(aPosition, 1.0);
	gl_Position = clipPos;
	float depth = max(0.1, clipPos.w);
	gl_PointSize = clamp(aSize * uPixelScale * (120.0 / depth), 1.0, 42.0);
}
`;

const PARTICLE_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 vColor;
void main() {
	vec2 centered = gl_PointCoord - vec2(0.5);
	float dist = length(centered) * 2.0;
	float alpha = smoothstep(1.0, 0.2, dist) * vColor.a;
	if (alpha < 0.012) discard;
	gl_FragColor = vec4(vColor.rgb, alpha);
}
`;

function mulberry32(seed) {
	let state = seed >>> 0;
	return function next() {
		state |= 0;
		state = (state + 0x6D2B79F5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`B"H | Particle shader failed: ${gl.getShaderInfoLog(shader) || 'unknown'}`);
	}
	return shader;
}

/** Registers a fire/ember emitter on a scene (e.g. a placed lantern). Additive, idempotent per key. */
export function registerParticleEmitter(scene, emitter) {
	if (!scene) return;
	scene.userData ||= {};
	const list = scene.userData.particleEmitters || (scene.userData.particleEmitters = []);
	const key = emitter.key || `${emitter.x}:${emitter.y}:${emitter.z}`;
	if (list.some(entry => entry.key === key)) return;
	list.push({ key, kind: emitter.kind || 'ember', x: emitter.x || 0, y: emitter.y || 0, z: emitter.z || 0 });
}

/** Removes a registered emitter by key. */
export function unregisterParticleEmitter(scene, key) {
	const list = scene?.userData?.particleEmitters;
	if (!Array.isArray(list)) return;
	const index = list.findIndex(entry => entry.key === key);
	if (index >= 0) list.splice(index, 1);
}

/**
 * Creates the ambient particle layer.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} [options={}] Optional { pixelScale }.
 */
export function createMitzvahParticleLayer(gl, options = {}) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, PARTICLE_VERTEX_SHADER);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, PARTICLE_FRAGMENT_SHADER);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`B"H | Particle program link failed: ${gl.getProgramInfoLog(program) || 'unknown'}`);
	}
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	const locations = {
		color: gl.getAttribLocation(program, 'aColor'),
		pixelScale: gl.getUniformLocation(program, 'uPixelScale'),
		position: gl.getAttribLocation(program, 'aPosition'),
		projectionView: gl.getUniformLocation(program, 'uProjectionView'),
		size: gl.getAttribLocation(program, 'aSize')
	};

	const total = MAX_FIREFLIES + MAX_SEEDS + MAX_EMBER_EMITTERS * EMBERS_PER_EMITTER;
	const positions = new Float32Array(total * 3);
	const colors = new Float32Array(total * 4);
	const sizes = new Float32Array(total);

	const positionBuffer = gl.createBuffer();
	const colorBuffer = gl.createBuffer();
	const sizeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions.byteLength, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, colors.byteLength, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sizes.byteLength, gl.DYNAMIC_DRAW);

	const rand = mulberry32(PARTICLE_SEED);
	// Fireflies: warm drifters in a meadow volume around the origin.
	const fireflies = [];
	for (let i = 0; i < MAX_FIREFLIES; i += 1) {
		fireflies.push({
			baseX: (rand() - 0.5) * 130,
			baseY: 0.6 + rand() * 7,
			baseZ: 55 + (rand() - 0.5) * 130,
			phase: rand() * Math.PI * 2,
			speed: 0.25 + rand() * 0.6,
			wander: 1.5 + rand() * 3.5
		});
	}
	// Seeds: pale motes riding a slow wind.
	const seeds = [];
	for (let i = 0; i < MAX_SEEDS; i += 1) {
		seeds.push({
			baseX: (rand() - 0.5) * 130,
			baseY: 0.5 + rand() * 9,
			baseZ: 55 + (rand() - 0.5) * 130,
			phase: rand() * Math.PI * 2,
			speed: 0.15 + rand() * 0.35,
			wind: 0.7 + rand() * 1.4
		});
	}
	// Embers: per-emitter risers with flicker; slots recycled across emitters.
	const embers = [];
	for (let e = 0; e < MAX_EMBER_EMITTERS * EMBERS_PER_EMITTER; e += 1) {
		embers.push({
			life: rand(),
			phase: rand() * Math.PI * 2,
			rise: 1.2 + rand() * 1.8,
			sway: 0.2 + rand() * 0.5
		});
	}

	const api = {
		dispose() {
			gl.deleteBuffer(positionBuffer);
			gl.deleteBuffer(colorBuffer);
			gl.deleteBuffer(sizeBuffer);
			gl.deleteProgram(program);
		},
		/**
		 * Advances every mote. No allocation: writes into preallocated arrays.
		 * @param {number} deltaSeconds Clamped frame delta.
		 * @param {object} env { timeOfDay, timeSeconds, emitters }.
		 */
		update(deltaSeconds, env = {}) {
			const dt = Math.min(0.1, Math.max(0, deltaSeconds || 0));
			const timeOfDay = env.timeOfDay || 'day';
			const t = env.timeSeconds || 0;
			const night = timeOfDay === 'night' ? 1 : 0;
			const dayish = timeOfDay === 'night' ? 0 : 1;
			let cursor = 0;
			// Fireflies: visible at night, drifting + blinking.
			for (let i = 0; i < MAX_FIREFLIES; i += 1) {
				const f = fireflies[i];
				const wobble = t * f.speed + f.phase;
				const o = cursor * 3;
				positions[o] = f.baseX + Math.sin(wobble * 0.7) * f.wander + Math.sin(wobble * 0.23) * 2.2;
				positions[o + 1] = f.baseY + Math.sin(wobble) * 1.1;
				positions[o + 2] = f.baseZ + Math.cos(wobble * 0.6) * f.wander;
				const blink = 0.5 + 0.5 * Math.sin(t * (1.1 + f.speed) + f.phase * 3.0);
				const glow = night * (0.25 + 0.75 * blink * blink);
				const c = cursor * 4;
				colors[c] = 1.0;
				colors[c + 1] = 0.72;
				colors[c + 2] = 0.32;
				colors[c + 3] = glow;
				sizes[cursor] = 0.55 + blink * 0.5;
				cursor += 1;
			}
			// Seeds: visible by day, wind-drifted with wrap in the meadow volume.
			for (let i = 0; i < MAX_SEEDS; i += 1) {
				const s = seeds[i];
				const drift = (t * s.wind + s.phase * 10) % 130;
				const o = cursor * 3;
				positions[o] = s.baseX + drift - 65;
				positions[o + 1] = s.baseY + Math.sin(t * s.speed + s.phase) * 1.4;
				positions[o + 2] = s.baseZ + Math.cos(t * s.speed * 0.7 + s.phase) * 3.0;
				const c = cursor * 4;
				colors[c] = 0.96;
				colors[c + 1] = 0.96;
				colors[c + 2] = 0.90;
				colors[c + 3] = dayish * 0.5;
				sizes[cursor] = 0.35;
				cursor += 1;
			}
			// Embers: rise from registered fire/lantern emitters, respawn at the base.
			const emitterList = Array.isArray(env.emitters) ? env.emitters : null;
			for (let e = 0; e < MAX_EMBER_EMITTERS; e += 1) {
				const emitter = emitterList && e < emitterList.length ? emitterList[e] : null;
				for (let k = 0; k < EMBERS_PER_EMITTER; k += 1) {
					const ember = embers[e * EMBERS_PER_EMITTER + k];
					ember.life += dt * 0.55;
					if (ember.life >= 1) ember.life -= 1;
					const o = cursor * 3;
					const active = emitter ? 1 : 0;
					positions[o] = (emitter ? emitter.x : 0) + Math.sin(ember.life * 9 + ember.phase) * ember.sway * ember.life;
					positions[o + 1] = (emitter ? emitter.y : -50) + ember.life * ember.rise * 2.2;
					positions[o + 2] = (emitter ? emitter.z : 0) + Math.cos(ember.life * 7 + ember.phase) * ember.sway * ember.life;
					const c = cursor * 4;
					const heat = 1 - ember.life;
					colors[c] = 1.0;
					colors[c + 1] = 0.42 + heat * 0.25;
					colors[c + 2] = 0.12;
					colors[c + 3] = active * heat * heat * 0.9;
					sizes[cursor] = 0.28 + heat * 0.4;
					cursor += 1;
				}
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
			gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors);
			gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, sizes);
			api.drawCount = cursor;
		},
		drawCount: 0,
		/**
		 * Draws every mote with additive-leaning alpha blending.
		 * @param {object} projectionView 4x4 projection*view matrix.
		 */
		render(projectionView) {
			if (!api.drawCount) return;
			gl.useProgram(program);
			gl.uniformMatrix4fv(locations.projectionView, false, projectionView);
			gl.uniform1f(locations.pixelScale, options.pixelScale || 1);
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.enableVertexAttribArray(locations.position);
			gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
			gl.enableVertexAttribArray(locations.color);
			gl.vertexAttribPointer(locations.color, 4, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
			gl.enableVertexAttribArray(locations.size);
			gl.vertexAttribPointer(locations.size, 1, gl.FLOAT, false, 0, 0);
			gl.depthMask(false);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.drawArrays(gl.POINTS, 0, api.drawCount);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.disable(gl.BLEND);
			gl.depthMask(true);
			gl.disableVertexAttribArray(locations.position);
			gl.disableVertexAttribArray(locations.color);
			gl.disableVertexAttribArray(locations.size);
		}
	};
	return api;
}

export const MITZVAH_PARTICLE_BUDGETS = Object.freeze({
	embersPerEmitter: EMBERS_PER_EMITTER,
	fireflies: MAX_FIREFLIES,
	maxEmberEmitters: MAX_EMBER_EMITTERS,
	seeds: MAX_SEEDS
});
