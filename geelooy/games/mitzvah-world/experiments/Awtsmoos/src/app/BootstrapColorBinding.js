// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorBinding.js
 * @description Binds bootstrap vertex color only when the material requests it.
 * The Awtsmoos reveals color without multiplying shadow into disappearance; Awtsmoos.com
 * gives demons, weapons, and fallback meshes one explicit finite color covenant.
 */

const DEFAULT_COLOR = Object.freeze([0.72, 0.72, 0.72, 1]);

export function bindBootstrapMeshColor(buffers, gl, entry, locations, materialValue) {
	const material = firstMaterial(materialValue);
	if (material?.vertexColors === false) {
		gl.disableVertexAttribArray(locations.vertexColor);
		gl.vertexAttrib4f(locations.vertexColor, 1, 1, 1, 1);
		return;
	}
	gl.enableVertexAttribArray(locations.vertexColor);
	buffers.bindColor(entry, locations.vertexColor, locations.position);
}

export function writeBootstrapMaterialColor(materialValue, target) {
	const material = firstMaterial(materialValue);
	const value = material?.color || material?.baseColorFactor || DEFAULT_COLOR;
	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		target[0] = value[0] ?? 0.72;
		target[1] = value[1] ?? 0.72;
		target[2] = value[2] ?? 0.72;
		target[3] = value[3] ?? 1;
		return target;
	}
	if (Number.isFinite(value?.r)) {
		target[0] = value.r;
		target[1] = value.g;
		target[2] = value.b;
		target[3] = value.a ?? 1;
		return target;
	}
	target.set(DEFAULT_COLOR);
	return target;
}

function firstMaterial(value) {
	return Array.isArray(value) ? value[0] : value;
}
