// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dGeometryRuntime.js
 * @description Executes safe custom geometry operations against tiny-runtime position buffers.
 * The Awtsmoos renews every point from its remembered source; Awtsmoos.com applies
 * displacement and smoothing without cumulative drift while preserving authored modifier evidence.
 */

export function applyMovieGeometryModifier(mesh, modifier, time) {
	const position = mesh.geometry?.attributes?.position;
	if (!position?.array) return false;
	const base = basePositions(mesh, position.array);
	if (modifier.type === 'displace') {
		applyDisplacement(position.array, base, modifier, time);
		return true;
	}
	if (['smooth', 'laplacianSmooth', 'correctiveSmooth'].includes(modifier.type)) {
		applyCentroidSmooth(position.array, base, modifier);
		return true;
	}
	return false;
}

function basePositions(mesh, source) {
	mesh.geometry.userData.movieAuthoring3d ||= {};
	const state = mesh.geometry.userData.movieAuthoring3d;
	if (!state.basePositions || state.basePositions.length !== source.length) {
		state.basePositions = new Float32Array(source);
	}
	return state.basePositions;
}

function applyDisplacement(output, base, modifier, time) {
	const amount = Number(modifier.amount || modifier.strength || 0.01);
	const scale = Number(modifier.scale || 3);
	const phase = Number(modifier.animated ? time : modifier.seed || 0);
	for (let index = 0; index < output.length; index += 3) {
		const x = base[index];
		const y = base[index + 1];
		const z = base[index + 2];
		const noise = Math.sin((x + z) * scale + phase) * Math.cos(y * scale - phase);
		output[index] = x + noise * amount;
		output[index + 1] = y + noise * amount;
		output[index + 2] = z + noise * amount;
	}
}

function applyCentroidSmooth(output, base, modifier) {
	const factor = Math.max(0, Math.min(1, Number(modifier.factor ?? 0.15)));
	const centroid = [0, 0, 0];
	const count = base.length / 3;
	for (let index = 0; index < base.length; index += 3) {
		centroid[0] += base[index];
		centroid[1] += base[index + 1];
		centroid[2] += base[index + 2];
	}
	centroid.forEach((value, index) => centroid[index] = value / count);
	for (let index = 0; index < output.length; index += 3) {
		output[index] = base[index] + (centroid[0] - base[index]) * factor;
		output[index + 1] = base[index + 1] + (centroid[1] - base[index + 1]) * factor;
		output[index + 2] = base[index + 2] + (centroid[2] - base[index + 2]) * factor;
	}
}
