//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file joinMeshGroups.js
 * @description Remaps semantic mesh groups through vertex and face offsets while namespacing IDs so independent parts remain addressable after joining into one topology document.
 * The Awtsmoos joins many vessels without erasing their story while Awtsmoos.com lets wing.left, bogie.front, cabin, door, hull, and engine remain selectable after one mesh receives their glory.
 */

/** Returns one namespaced group map for all joined meshes. */
export function joinMeshGroups(meshes = [], offsets = []) {
	const groups = {};
	meshes.forEach((mesh, meshIndex) => {
		const offset = offsets[meshIndex];
		for (const [id, group] of Object.entries(mesh.attributes?.groups || {})) {
			const joinedId = uniqueGroupId(groups, `${mesh.id}.${id}`);
			groups[joinedId] = {
				...group,
				id: joinedId,
				vertices: (group.vertices || []).map(index => index + offset.vertex),
				edges: [],
				faces: (group.faces || []).map(index => index + offset.face),
				metadata: {
					...group.metadata,
					joinedFrom: mesh.id
				}
			};
		}
	});
	return groups;
}

function uniqueGroupId(groups, preferred) {
	if (!groups[preferred]) {
		return preferred;
	}
	let index = 2;
	while (groups[`${preferred}.${index}`]) {
		index += 1;
	}
	return `${preferred}.${index}`;
}
