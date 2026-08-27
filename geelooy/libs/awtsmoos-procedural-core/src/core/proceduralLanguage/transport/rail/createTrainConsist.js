//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTrainConsist.js
 * @description Creates an articulated train consist from independent rail-car artifacts, explicit coupling edges, longitudinal placement, and an optional joined editable preview mesh.
 * The Awtsmoos joins many carriages without dissolving each carriage's identity; Awtsmoos.com lets a train remain both a graph of cars and, when desired, one editable mesh sight.
 */

import { joinEditableMeshes } from '../../mesh/joinEditableMeshes.js';
import { moveMeshVertices } from '../../mesh/transformMeshSelection.js';
import { generateRailArtifact } from './generateRailArtifact.js';

export function createTrainConsist(inputs = [], options = {}) {
	const gap = Number(options.gap ?? 0.8);
	let cursor = 0;
	const members = inputs.map((input, index) => {
		const artifact = normalizeArtifact(input);
		const length = artifact.definition.dimensions.length;
		const centerY = cursor + length / 2;
		cursor += length + gap;
		return Object.freeze({
			id: artifact.id,
			index,
			artifact,
			position: Object.freeze([0, centerY, 0])
		});
	});
	const couplings = members.slice(0, -1).map((member, index) => Object.freeze({
		id: `coupling:${index}`,
		from: member.id,
		to: members[index + 1].id,
		type: 'rail-coupler'
	}));
	const joinedMesh = options.joinMesh === false
		? null
		: joinConsistMeshes(members, options.id || 'train-consist');
	return Object.freeze({
		schema: 'awtsmoos.train-consist',
		version: 1,
		id: String(options.id || 'train-consist'),
		family: 'rail',
		members: Object.freeze(members),
		couplings: Object.freeze(couplings),
		mesh: joinedMesh,
		metadata: Object.freeze({ ...(options.metadata || {}) })
	});
}

function normalizeArtifact(input) {
	return input?.schema === 'awtsmoos.transport-artifact'
		? input
		: generateRailArtifact(input);
}

function joinConsistMeshes(members, id) {
	const meshes = members.map(member => {
		return moveMeshVertices(member.artifact.mesh, 'all', member.position);
	});
	return joinEditableMeshes(meshes, {
		id: `${id}:mesh`,
		metadata: { family: 'rail', assembly: 'train-consist' }
	});
}
