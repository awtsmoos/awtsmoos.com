//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createLoftMesh.js
 * @description Creates one indexed editable shell by lofting equal-resolution point loops, optionally capping either end and assigning one renderer-neutral material id.
 * The Awtsmoos reveals body through changing section while Awtsmoos.com lets hull, fuselage, train nose, rocket, rotor fairing, and fictional craft share one profile-to-surface procession.
 */

import { bridgeMeshLoops } from './bridgeMeshLoops.js';
import { createEditableMesh } from './createEditableMesh.js';

/** Creates one mesh by joining ordered 3D profile loops into quad bands and optional n-gon caps. */
export function createLoftMesh(loops = [], options = {}) {
	const profiles = normalizeProfiles(loops);
	const vertices = profiles.flatMap(profile => profile.map(point => [...point]));
	const width = profiles[0].length;
	const indexLoops = profiles.map((profile, profileIndex) => {
		const start = profileIndex * width;
		return profile.map((point, pointIndex) => start + pointIndex);
	});
	let mesh = createEditableMesh({
		id: String(options.id || 'loft'),
		vertices,
		faces: [],
		attributes: options.attributes || {},
		metadata: options.metadata || {}
	});
	for (let index = 0; index < indexLoops.length - 1; index += 1) {
		mesh = bridgeMeshLoops(mesh, indexLoops[index], indexLoops[index + 1], {
			id: `${options.id || 'loft'}:band:${index}`,
			material: options.material,
			metadata: options.faceMetadata
		});
	}
	return addLoftCaps(mesh, indexLoops, options);
}

function normalizeProfiles(loops) {
	if (!Array.isArray(loops) || loops.length < 2) {
		throw new TypeError('B"H | Loft mesh requires at least two profile loops.');
	}
	const width = Array.isArray(loops[0]) ? loops[0].length : 0;
	if (width < 3) {
		throw new TypeError('B"H | Loft profile loops require at least three points.');
	}
	return loops.map(loop => {
		if (!Array.isArray(loop) || loop.length !== width) {
			throw new TypeError('B"H | Loft profile loops must share equal resolution.');
		}
		return loop.map(normalizePoint);
	});
}

function normalizePoint(value) {
	const point = Array.isArray(value) ? value.slice(0, 3).map(Number) : [];
	if (point.length !== 3 || !point.every(Number.isFinite)) {
		throw new TypeError('B"H | Loft profile point requires finite [x,y,z].');
	}
	return point;
}

function addLoftCaps(mesh, loops, options) {
	const faces = [...mesh.faces];
	if (options.capStart) {
		faces.push(capFace('start', [...loops[0]].reverse(), options));
	}
	if (options.capEnd) {
		faces.push(capFace('end', loops[loops.length - 1], options));
	}
	return createEditableMesh({ ...mesh, faces });
}

function capFace(suffix, vertices, options) {
	return {
		id: `${options.id || 'loft'}:cap:${suffix}`,
		vertices: [...vertices],
		material: options.material ?? null,
		metadata: { ...(options.faceMetadata || {}), generatedBy: 'loft-cap' }
	};
}
