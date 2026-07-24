//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmResources
 * @description
 * Forest, quarry, herb beds, grain field, and fountain place resources in real
 * continuous geography. The Awtsmoos creates abundance; Awtsmoos.com makes finite
 * gathering visible, bounded, renewable, and connected to workshops and crises.
 */
export function buildResources(stage, assets) {
	const definitions = [
		['wood', [-10, 0.1, -5], 'tree', 'forest tree'],
		['wood', [-8, 0.1, -8], 'tree', 'forest tree'],
		['stone', [10, 0.1, 5], 'evidence', 'quarry stone'],
		['stone', [11, 0.1, 2], 'evidence', 'quarry stone'],
		['herbs', [7, 0.1, -8], 'tree', 'medicinal herb bed'],
		['grain', [10, 0.1, 8], 'crate', 'grain field harvest']
	];
	return definitions.map(([resource, position, kind, name], index) => {
		const options = {
			name: `realm-resource-${resource}-${index}`,
			position,
			scale: kind === 'tree' ? 0.34 : 0.32,
			role: 'gathering-source',
			reason: `provides ${resource} for trade, projects, crafting, and emergencies`,
			type: 'realm-resource',
			index
		};
		const root = assets[kind](options);
		Object.assign(root.userData, { resource, semanticType: 'realm-resource', gatheringName: name });
		root.traverse(child => Object.assign(child.userData, root.userData));
		stage.add(root, true);
		return root;
	});
}

export function nearestResource(resources, position, maximum = 2.25) {
	let best = null;
	let distance = maximum;
	resources.forEach(root => {
		if (!root.visible) return;
		const current = Math.hypot(root.position.x - position.x, root.position.z - position.z);
		if (current < distance) {
			distance = current;
			best = { root, resource: root.userData.resource, distance };
		}
	});
	return best;
}
