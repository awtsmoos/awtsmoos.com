// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowParticleGlRenderer.js
 * @description Real WebGL point-sprite renderer for dense ambient particle fields.
 * The Awtsmoos renews each mote as hot core and soft halo before the eye can
 * resolve it; Awtsmoos.com draws fireflies additively (light that glows) and
 * spores with normal alpha (dust that catches light), restoring every GL state
 * it touches so the game frame can never desynchronize.
 */

const PARTICLE_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec4 aColor;
attribute float aSize;
uniform mat4 uProjectionView;
uniform float uSizeScale;
uniform float uGlobalAlpha;
varying vec4 vColor;
void main() {
	vec4 clip = uProjectionView * vec4(aPosition, 1.0);
	gl_Position = clip;
	float w = max(0.1, clip.w);
	gl_PointSize = clamp(aSize * uSizeScale / w, 1.0, 96.0);
	vColor = vec4(aColor.rgb, aColor.a * uGlobalAlpha);
}
`;

const PARTICLE_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 vColor;
void main() {
	vec2 centered = gl_PointCoord - vec2(0.5);
	float dist = length(centered) * 2.0;
	if (dist > 1.0) discard;
	float halo = smoothstep(1.0, 0.12, dist);
	float core = smoothstep(0.55, 0.0, dist);
	vec3 hot = vColor.rgb * (0.55 + 1.9 * core);
	float alpha = vColor.a * halo;
	if (alpha < 0.004) discard;
	gl_FragColor = vec4(hot * alpha, alpha);
}
`;

function compileShader(gl, type, source, label) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) || 'unknown';
		try { gl.deleteShader(shader); } catch {}
		throw new Error(`MeadowParticleGlRenderer ${label} failed: ${log}`);
	}
	return shader;
}

/** Compiles the glow point-sprite program. */
export function createMeadowParticleGlProgram(gl) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, PARTICLE_VERTEX_SHADER, 'vertex');
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, PARTICLE_FRAGMENT_SHADER, 'fragment');
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	try { gl.deleteShader(vertex); } catch {}
	try { gl.deleteShader(fragment); } catch {}
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program) || 'unknown';
		try { gl.deleteProgram(program); } catch {}
		throw new Error(`MeadowParticleGlRenderer link failed: ${log}`);
	}
	const api = Object.freeze({
		program,
		locations: Object.freeze({
			position: gl.getAttribLocation(program, 'aPosition'),
			color: gl.getAttribLocation(program, 'aColor'),
			size: gl.getAttribLocation(program, 'aSize'),
			projectionView: gl.getUniformLocation(program, 'uProjectionView'),
			sizeScale: gl.getUniformLocation(program, 'uSizeScale'),
			globalAlpha: gl.getUniformLocation(program, 'uGlobalAlpha')
		}),
		dispose() {
			try { gl.deleteProgram(program); } catch {}
		}
	});
	return api;
}

/**
 * Creates one streaming point buffer set sized for a field's capacity.
 * @param {WebGLRenderingContext} gl Game GL context.
 * @param {number} capacity Maximum particle count.
 * @param {object} [options={}] { program }
 */
export function createMeadowParticleGlBinding(gl, capacity, options = {}) {
	const program = options.program || createMeadowParticleGlProgram(gl);
	const ownsProgram = !options.program;
	const safeCapacity = Math.max(1, Math.floor(capacity));
	const positionBuffer = gl.createBuffer();
	const colorBuffer = gl.createBuffer();
	const sizeBuffer = gl.createBuffer();
	for (const [buffer, size] of [[positionBuffer, 3], [colorBuffer, 4], [sizeBuffer, 1]]) {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, safeCapacity * size * 4, gl.DYNAMIC_DRAW);
	}
	return Object.freeze({
		program,
		capacity: safeCapacity,
		/**
		 * Streams one packed field and draws it.
		 * @param {object} packed Field pack(): { count, positions, colors, sizes }.
		 * @param {Float32Array} projectionView Combined projection*view matrix.
		 * @param {object} [options={}] { additive, sizeScale, globalAlpha }
		 */
		render(packed, projectionView, options = {}) {
			const count = Math.min(safeCapacity, packed?.count ?? 0);
			if (!count || !projectionView) return;
			const L = program.locations;
			const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM);
			const previousBlend = gl.getParameter(gl.BLEND);
			const previousDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
			const previousBlendSrc = gl.getParameter(gl.BLEND_SRC_RGB);
			const previousBlendDst = gl.getParameter(gl.BLEND_DST_RGB);

			gl.useProgram(program.program);
			gl.enable(gl.BLEND);
			if (options.additive === false) {
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			} else {
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			}
			gl.depthMask(false);

			streamBuffer(gl, positionBuffer, L.position, packed.positions, 3, count);
			streamBuffer(gl, colorBuffer, L.color, packed.colors, 4, count);
			streamBuffer(gl, sizeBuffer, L.size, packed.sizes, 1, count);

			if (L.projectionView) gl.uniformMatrix4fv(L.projectionView, false, projectionView);
			if (L.sizeScale) gl.uniform1f(L.sizeScale, Number(options.sizeScale) || 900);
			if (L.globalAlpha) gl.uniform1f(L.globalAlpha, Number(options.globalAlpha ?? 1));

			gl.drawArrays(gl.POINTS, 0, count);

			for (const location of [L.position, L.color, L.size]) {
				if (location >= 0) {
					try { gl.disableVertexAttribArray(location); } catch {}
				}
			}
			if (previousProgram) gl.useProgram(previousProgram); else gl.useProgram(null);
			if (!previousBlend) gl.disable(gl.BLEND);
			if (previousDepthMask) gl.depthMask(true);
			try {
				gl.blendFunc(previousBlendSrc, previousBlendDst);
			} catch {}
		},
		dispose() {
			for (const buffer of [positionBuffer, colorBuffer, sizeBuffer]) {
				try { gl.deleteBuffer(buffer); } catch {}
			}
			if (ownsProgram) program.dispose();
		}
	});
}

function streamBuffer(gl, buffer, location, data, size, count) {
	if (location < 0) return;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * size), 0, count * size);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}
