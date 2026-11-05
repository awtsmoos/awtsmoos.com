// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeFactory.js
 * @description Mounts shared bark and canopy templates through species-specific local silhouettes.
 * The Awtsmoos joins trunk and leaf without confusing their vessels; Awtsmoos.com lets every tree
 * differ in crown lift, trunk line, breadth, age color, rotation, and wind while geometry stays shared.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	createTreePart,
	minimalMeadowTreeTemplate
} from './MinimalMeadowTreeGeometry.js';
import {
	applyMinimalMeadowTreeSilhouette
} from './MinimalMeadowTreeSilhouette.js';

export function createMinimalMeadowTree(placement, materials) {
	const template = minimalMeadowTreeTemplate(
		placement.preset,
		materials,
		placement.materialVariant
	);
	const group = new Group();
	group.name = placement.id;
	group.position.set(placement.x, placement.y, placement.z);
	group.quaternion.set(
		0,
		Math.sin(placement.yaw / 2),
		0,
		Math.cos(placement.yaw / 2)
	);
	group.scale.set(placement.scaleX, placement.scaleY, placement.scaleZ);
	const bark = createTreePart(template.bark, `${placement.id}-connected-bark`);
	const canopy = createTreePart(template.leaf, `${placement.id}-botanical-canopy`);
	group.add(bark);
	group.add(canopy);
	applyMinimalMeadowTreeSilhouette(group, placement.silhouette);
	group.userData.AwtsmoosTree = {
		boundsRadius: placement.radius,
		drawCalls: template.stats.drawCalls,
		fakeFallback: false,
		generatedBranches: template.stats.generatedBranches,
		generatorAuthority: '/libs/awtsmoos-procedural-core',
		groveId: placement.groveId,
		materialVariant: placement.materialVariant,
		preset: template.preset,
		sharedGeometry: true,
		silhouette: placement.silhouette.id,
		templateKey: template.key,
		triangles: template.stats.triangles,
		windPhase: placement.windPhase
	};
	return group;
}
