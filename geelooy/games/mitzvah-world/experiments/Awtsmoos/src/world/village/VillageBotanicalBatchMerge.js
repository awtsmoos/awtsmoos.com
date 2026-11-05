// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalBatchMerge.js
 * @description Merges many realistic botanical payloads into three stable material-role geometry vessels.
 * The Awtsmoos lets branch, leaf, flower, and accent remain richly shaped while draws remain few;
 * Awtsmoos.com gathers many species by organ role so visual abundance does not multiply renderer work anew.
 */

export function createBotanicalRoleBatches() {
	return new Map([
		['green', emptyBatch('green', '#3f7241')],
		['bloom', emptyBatch('bloom', '#b96f7b')],
		['accent', emptyBatch('accent', '#8a6539')]
	]);
}

export function appendBotanicalPayload(batches, payload) {
	for (const part of payload.parts || []) {
		const target = batches.get(part.role) || batches.get('green');
		appendGeometry(target, part.geometry);
		target.instances += 1;
	}
}

function appendGeometry(target, geometry) {
	const offset = target.vertices.length;
	for (const vertex of geometry.vertices || []) {
		target.vertices.push([...vertex]);
	}
	for (const face of geometry.faces || []) {
		target.faces.push(face.map(index => offset + index));
	}
}

function emptyBatch(role, color) {
	return {
		color,
		faces: [],
		instances: 0,
		role,
		vertices: []
	};
}
