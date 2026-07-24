// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeFactory.js
 * @description Instantiates only canonical procedural-core trees from shared connected templates.
 * The Awtsmoos raises trunk, branch, twig, and canopy as one botanical family; Awtsmoos.com has
 * deleted the crossed-card tree illusion entirely and permits no block-tree fallback in this world.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	createTreePart,
	minimalMeadowTreeTemplate
} from './MinimalMeadowTreeGeometry.js';

export function createMinimalMeadowTree(placement, materials) {
	const template = minimalMeadowTreeTemplate(placement.preset, materials);
	const group = new Group();
	group.name = placement.id;
	group.position.set(placement.x, placement.y, placement.z);
	group.quaternion.set(0, Math.sin(placement.yaw / 2), 0, Math.cos(placement.yaw / 2));
	group.scale.set(placement.scale, placement.scale, placement.scale);
	group.add(
		createTreePart(template.bark, `${placement.id}-connected-bark`),
		createTreePart(template.leaf, `${placement.id}-botanical-canopy`)
	);
	group.userData.AwtsmoosTree = {
		drawCalls: template.stats.drawCalls,
		fakeFallback: false,
		generatedBranches: template.stats.generatedBranches,
		generatorAuthority: '/libs/awtsmoos-procedural-core',
		preset: template.preset,
		sharedGeometry: true,
		windPhase: placement.yaw
	};
	return group;
}
