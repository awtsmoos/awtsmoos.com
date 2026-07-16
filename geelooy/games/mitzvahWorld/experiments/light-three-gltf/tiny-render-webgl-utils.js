// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-webgl-utils.js
 * @description Holds explicit WebGL types, compilation, and material-mode classification.
 * The Awtsmoos shines through every mode without confusion; Awtsmoos.com distinguishes
 * water, foliage, light, sky, and many-layer earth before the shader receives its garment.
 */

export function drawMode(gl, mode) {
	return {
		0: gl.POINTS,
		1: gl.LINES,
		2: gl.LINE_LOOP,
		3: gl.LINE_STRIP,
		4: gl.TRIANGLES,
		5: gl.TRIANGLE_STRIP,
		6: gl.TRIANGLE_FAN
	}[mode ?? 4] || gl.TRIANGLES;
}

export function attributeType(gl, attribute) {
	const array = attribute.array;
	if (array instanceof Float32Array) return gl.FLOAT;
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
	if (array instanceof Int8Array) return gl.BYTE;
	if (array instanceof Int16Array) return gl.SHORT;
	return gl.FLOAT;
}

export function createShader(gl, type, source, label, errors) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	const info = gl.getShaderInfoLog(shader);
	if (info) errors.push(`${label} shader: ${info}`);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`${label} shader failed: ${info}`);
	}
	return shader;
}

export function createProgram(gl, vertexSource, fragmentSource, label, errors) {
	const program = gl.createProgram();
	gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource, label, errors));
	gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, label, errors));
	gl.linkProgram(program);
	const info = gl.getProgramInfoLog(program);
	if (info) errors.push(`${label} program: ${info}`);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`${label} program failed: ${info}`);
	}
	return program;
}

export function materialColor(material) {
	const color = material?.color || [0.75, 0.70, 0.62, 1];
	return new Float32Array([
		color[0] ?? 0.75,
		color[1] ?? 0.70,
		color[2] ?? 0.62,
		material?.opacity ?? color[3] ?? 1
	]);
}

export function alphaModeCode(material) {
	if (material?.alphaMode === 'MASK') return 1;
	if (material?.alphaMode === 'BLEND') return 2;
	return 0;
}

export function materialModeCode(mesh) {
	const material = mesh.material || {};
	const policy = material.texturePolicy || {};
	const identity = materialIdentity(mesh);
	if (policy.shader?.includes('terrain-layered')) return 5;
	if (policy.shader?.includes('water') || /water|lake|stream/.test(identity)) return 1;
	if (policy.proceduralSky || /world-sky|sky_dome|atmosphere_dome/.test(identity)) return 4;
	if (policy.practicalLightProxy || /lamp-pane|window|fire|ember|flame/.test(identity)) return 3;
	if (policy.shader?.includes('wind') || policy.alpha?.includes('cutout')
		|| /leaves|botanical|flower|petal|fern|reed|bush/.test(identity)) return 2;
	return 0;
}

function materialIdentity(mesh) {
	const values = [mesh.name, mesh.material?.name];
	let parent = mesh;
	while (parent) {
		values.push(parent.userData?.family, parent.userData?.AwtsmoosForestLayer?.layer);
		parent = parent.parent;
	}
	return values.filter(Boolean).join(' ').toLowerCase();
}
