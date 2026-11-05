// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorkspaceModel.js
 * @description Projects compiled and source movie documents into editor panel records.
 * The Awtsmoos renews one story as timeline, sequence, rig, graph, material, and cast;
 * Awtsmoos.com keeps every panel derived from the same source and compiled timeline.
 */

export function createMovieWorkspaceModel(project) {
	const source = project.sourceDocument || project;
	return {
		cameraRigs: cameraRigRecords(source, project),
		characters: (source.characters || []).map(character => ({
			costume: character.costume || {},
			id: character.id,
			label: character.label || character.id,
			position: character.position || { x: 0, z: 0 }
		})),
		compiled: project.compiled || {},
		graphs: [...(source.graphs || []), ...(source.materialGraphs || [])],
		json: JSON.stringify(source, null, 2),
		sequences: (source.sequences || []).map(sequence => ({
			clips: (sequence.tracks || []).reduce((sum, track) => sum + track.clips.length, 0),
			id: sequence.id,
			tracks: sequence.tracks?.length || 0
		})),
		timeline: (project.tracks || []).map(track => ({
			clips: track.clips.map(clip => ({
				duration: clip.duration,
				id: clip.id,
				start: clip.start
			})),
			id: track.id,
			target: track.target,
			type: track.type
		}))
	};
}

export function updateMaterialNode(source, graphId, nodeId, serializedValue) {
	const clone = structuredClone(source);
	const graphs = [...(clone.graphs || []), ...(clone.materialGraphs || [])];
	const graph = graphs.find(item => item.id === graphId);
	const node = graph?.nodes?.find(item => item.id === nodeId);
	if (!node) throw new Error(`Unknown graph node: ${graphId}/${nodeId}`);
	try {
		node.value = JSON.parse(serializedValue);
	} catch {
		node.value = serializedValue;
	}
	return clone;
}

function cameraRigRecords(source, project) {
	const custom = (source.cameraRigs || []).map(rig => ({
		id: rig.id,
		kind: 'custom',
		uses: countRigUses(project, rig.id)
	}));
	const used = new Set((project.tracks || [])
		.filter(track => track.type === 'camera')
		.flatMap(track => track.clips)
		.map(clip => clip.rig)
		.filter(Boolean));
	for (const id of used) {
		if (!custom.some(rig => rig.id === id)) custom.push({ id, kind: 'preset', uses: countRigUses(project, id) });
	}
	return custom;
}

function countRigUses(project, rigId) {
	return (project.tracks || [])
		.filter(track => track.type === 'camera')
		.flatMap(track => track.clips)
		.filter(clip => clip.rig === rigId)
		.length;
}
