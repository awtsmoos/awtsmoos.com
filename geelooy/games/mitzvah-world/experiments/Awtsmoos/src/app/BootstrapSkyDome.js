// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapSkyDome.js
 * @description Paints the first-play sky as a camera-following dome: day blue, golden
 * sunrise, or a starfield night with Milky Way band and moon. Everything is procedural
 * in one tiny shader (no textures, no network); the dome renders first with depth
 * writes off so terrain always overdraws it. Palettes also feed the terrain fog so
 * the horizon melts into the same air the dome breathes.
 * The Awtsmoos hangs the firmament before the traveler lifts his eyes; Awtsmoos.com
 * keeps the whole sky inside one cheap draw call.
 */

const SKY_VERTEX_SHADER = `
attribute vec3 aPosition;
uniform mat4 uProjectionView;
uniform vec3 uCameraPos;
uniform float uRadius;
varying vec3 vDirection;
void main() {
	vDirection = aPosition;
	vec3 world = uCameraPos + aPosition * uRadius;
	gl_Position = uProjectionView * vec4(world, 1.0);
}
`;

const SKY_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uSunAmount;
uniform float uStarAmount;
uniform vec3 uMoonDirection;
uniform float uMoonAmount;
uniform float uTimeSeconds;
varying vec3 vDirection;
float skyHash(vec3 point) {
	return fract(sin(dot(point, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
void main() {
	vec3 dir = normalize(vDirection);
	float up = clamp(dir.y, 0.0, 1.0);
	vec3 sky = mix(uHorizon, uZenith, pow(up, 0.58));
	sky = mix(sky, uHorizon * 0.45, clamp(-dir.y * 3.5, 0.0, 1.0));
	float sunDot = max(dot(dir, uSunDirection), 0.0);
	sky += uSunColor * uSunAmount * (pow(sunDot, 1200.0) * 1.6 + pow(sunDot, 24.0) * 0.38 + pow(sunDot, 6.0) * 0.12);
	if (uStarAmount > 0.01) {
		vec3 cell = floor(dir * 230.0);
		float sparkle = skyHash(cell);
		float star = step(0.992, sparkle);
		float twinkle = 0.55 + 0.45 * sin(uTimeSeconds * 2.2 + sparkle * 40.0);
		vec3 bandNormal = normalize(vec3(0.42, 0.30, 0.86));
		float band = exp(-pow(dot(dir, bandNormal) * 3.0, 2.0));
		float dust = step(0.978, skyHash(cell + 3.7)) * band;
		float horizonGate = smoothstep(0.015, 0.22, dir.y);
		sky += vec3(0.88, 0.93, 1.0) * (star * twinkle * 0.9 + dust * 0.55) * uStarAmount * horizonGate;
	}
	float moonDot = max(dot(dir, uMoonDirection), 0.0);
	float disc = smoothstep(0.99955, 0.99985, moonDot);
	float glow = pow(moonDot, 260.0) * 0.45;
	sky += vec3(0.90, 0.94, 1.0) * (disc * 0.95 + glow) * uMoonAmount;
	gl_FragColor = vec4(sky, 1.0);
}
`;

export const SKY_TIME_OF_DAY = Object.freeze({
	DAY: 'day',
	NIGHT: 'night',
	SUNRISE: 'sunrise'
});

/** Palettes per time of day; fog colors keep the terrain inside the same air. */
export const BOOTSTRAP_SKY_PALETTES = Object.freeze({
	day: Object.freeze({
		fogColor: Object.freeze([0.74, 0.83, 0.91]),
		fogDensity: 0.0016,
		horizon: Object.freeze([0.74, 0.85, 0.93]),
		moonAmount: 0,
		moonDirection: Object.freeze([0.4, 0.5, -0.6]),
		starAmount: 0,
		sunAmount: 1,
		sunColor: Object.freeze([1.0, 0.96, 0.88]),
		sunDirection: Object.freeze([0.45, 0.62, 0.35]),
		zenith: Object.freeze([0.20, 0.44, 0.80])
	}),
	sunrise: Object.freeze({
		fogColor: Object.freeze([0.96, 0.78, 0.58]),
		fogDensity: 0.0028,
		horizon: Object.freeze([1.0, 0.70, 0.40]),
		moonAmount: 0,
		moonDirection: Object.freeze([0.4, 0.5, -0.6]),
		starAmount: 0.12,
		sunAmount: 1,
		sunColor: Object.freeze([1.0, 0.78, 0.52]),
		sunDirection: Object.freeze([0.82, 0.10, 0.30]),
		zenith: Object.freeze([0.30, 0.42, 0.68])
	}),
	night: Object.freeze({
		fogColor: Object.freeze([0.05, 0.08, 0.16]),
		fogDensity: 0.0022,
		horizon: Object.freeze([0.07, 0.11, 0.20]),
		moonAmount: 1,
		moonDirection: Object.freeze([-0.45, 0.55, -0.55]),
		starAmount: 1,
		sunAmount: 0,
		sunColor: Object.freeze([0.0, 0.0, 0.0]),
		sunDirection: Object.freeze([0.45, -0.4, 0.35]),
		zenith: Object.freeze([0.012, 0.028, 0.085])
	})
});

/** Resolves a time-of-day name to its palette, defaulting to day. */
export function bootstrapSkyPalette(timeOfDay) {
	return BOOTSTRAP_SKY_PALETTES[timeOfDay] || BOOTSTRAP_SKY_PALETTES.day;
}

/** Builds a unit-sphere dome mesh (positions only; direction doubles as the varying). */
function buildDomeGeometry() {
	const latitudes = 14;
	const longitudes = 24;
	const positions = [];
	for (let lat = 0; lat <= latitudes; lat += 1) {
		const theta = (lat / latitudes) * Math.PI;
		const sinTheta = Math.sin(theta);
		const cosTheta = Math.cos(theta);
		for (let lon = 0; lon <= longitudes; lon += 1) {
			const phi = (lon / longitudes) * Math.PI * 2;
			positions.push(
				sinTheta * Math.cos(phi),
				cosTheta,
				sinTheta * Math.sin(phi)
			);
		}
	}
	const indices = [];
	const ring = longitudes + 1;
	for (let lat = 0; lat < latitudes; lat += 1) {
		for (let lon = 0; lon < longitudes; lon += 1) {
			const a = lat * ring + lon;
			const b = a + 1;
			const c = a + ring;
			const d = c + 1;
			indices.push(a, c, b, b, c, d);
		}
	}
	return { indices, positions };
}

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`B"H | Sky shader failed: ${gl.getShaderInfoLog(shader) || 'unknown'}`);
	}
	return shader;
}

/**
 * Creates the camera-following sky dome renderer.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @returns {{render:function, dispose:function}} Sky renderer.
 */
export function createBootstrapSky(gl) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, SKY_VERTEX_SHADER);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, SKY_FRAGMENT_SHADER);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`B"H | Sky program link failed: ${gl.getProgramInfoLog(program) || 'unknown'}`);
	}
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	const locations = {
		cameraPos: gl.getUniformLocation(program, 'uCameraPos'),
		horizon: gl.getUniformLocation(program, 'uHorizon'),
		moonAmount: gl.getUniformLocation(program, 'uMoonAmount'),
		moonDirection: gl.getUniformLocation(program, 'uMoonDirection'),
		position: gl.getAttribLocation(program, 'aPosition'),
		projectionView: gl.getUniformLocation(program, 'uProjectionView'),
		radius: gl.getUniformLocation(program, 'uRadius'),
		starAmount: gl.getUniformLocation(program, 'uStarAmount'),
		sunAmount: gl.getUniformLocation(program, 'uSunAmount'),
		sunColor: gl.getUniformLocation(program, 'uSunColor'),
		sunDirection: gl.getUniformLocation(program, 'uSunDirection'),
		timeSeconds: gl.getUniformLocation(program, 'uTimeSeconds'),
		zenith: gl.getUniformLocation(program, 'uZenith')
	};
	const geometry = buildDomeGeometry();
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
	const indexCount = geometry.indices.length;

	return {
		dispose() {
			gl.deleteBuffer(positionBuffer);
			gl.deleteBuffer(indexBuffer);
			gl.deleteProgram(program);
		},
		/**
		 * Draws the sky dome centered on the camera.
		 * @param {object} camera Camera with position/fov/aspect/near/far.
		 * @param {object} projectionView 4x4 projection*view matrix.
		 * @param {string} timeOfDay 'day' | 'sunrise' | 'night'.
		 * @param {number} timeSeconds Clock for star twinkle.
		 */
		render(camera, projectionView, timeOfDay, timeSeconds) {
			const palette = bootstrapSkyPalette(timeOfDay);
			const cameraPos = camera.position.toArray
				? camera.position.toArray()
				: [camera.position.x || 0, camera.position.y || 0, camera.position.z || 0];
			const radius = Math.min(camera.far || 1000, 1200) * 0.92;
			gl.useProgram(program);
			gl.uniformMatrix4fv(locations.projectionView, false, projectionView);
			gl.uniform3f(locations.cameraPos, cameraPos[0], cameraPos[1], cameraPos[2]);
			gl.uniform1f(locations.radius, radius);
			gl.uniform3f(locations.zenith, ...palette.zenith);
			gl.uniform3f(locations.horizon, ...palette.horizon);
			gl.uniform3f(locations.sunDirection, ...palette.sunDirection);
			gl.uniform3f(locations.sunColor, ...palette.sunColor);
			gl.uniform1f(locations.sunAmount, palette.sunAmount);
			gl.uniform1f(locations.starAmount, palette.starAmount);
			gl.uniform3f(locations.moonDirection, ...palette.moonDirection);
			gl.uniform1f(locations.moonAmount, palette.moonAmount);
			gl.uniform1f(locations.timeSeconds, timeSeconds);
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.enableVertexAttribArray(locations.position);
			gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.depthMask(false);
			gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
			gl.depthMask(true);
			gl.disableVertexAttribArray(locations.position);
		}
	};
}
