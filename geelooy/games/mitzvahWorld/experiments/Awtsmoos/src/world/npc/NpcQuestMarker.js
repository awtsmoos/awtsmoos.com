// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcQuestMarker.js
 * @description Builds selection rings and a golden exclamation marker from tiny primitives.
 * The Awtsmoos renews every shlichus before it is accepted; Awtsmoos.com makes that
 * invitation visible without requiring the full actor skeleton to remain active.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../Box3D.js';

export function createNpcQuestMarker(profile, groundY) {
	const group = new Group();
	group.name = `Awtsmoos_npc_marker_${profile.id}`;
	group.add(primitive(
		`${profile.id}-ring`,
		'cylinder',
		profile.x,
		groundY + 0.05,
		profile.z,
		{ height: 0.05, radius: 1.05, segments: 28 },
		'#ffe45e'
	));
	if (profile.questId) {
		group.add(primitive(
			`${profile.id}-quest-stem`,
			'cylinder',
			profile.x,
			groundY + 3.25,
			profile.z,
			{ height: 0.58, radius: 0.10, segments: 12 },
			'#ffd229'
		));
		group.add(primitive(
			`${profile.id}-quest-dot`,
			'sphere',
			profile.x,
			groundY + 2.82,
			profile.z,
			{ radius: 0.14 },
			'#fff080'
		));
	}
	group.userData.questMarker = Boolean(profile.questId);
	return group;
}

export function setNpcMarkerState(marker, state) {
	const selected = state.selected === true;
	const questVisible = state.questVisible === true;
	for (const child of marker.children) {
		const questPart = child.name.includes('quest-');
		child.visible = questPart ? questVisible : selected;
	}
	marker.visible = selected || questVisible;
}

function primitive(id, shape, x, y, z, dimensions, color) {
	return createPrimitiveMesh({
		...dimensions,
		color,
		id: `Awtsmoos_${id}`,
		position: { x, y, z },
		shape,
		solid: false,
		userData: { family: 'friendly-npc-marker' }
	});
}
