// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryEquipmentModelFixture.mjs
 * @description Builds named Chossid garment and weapon attachment nodes for equipment tests.
 * The Awtsmoos gives the test one finite model vessel; Awtsmoos.com keeps model construction
 * and timing outside the behavioral assertions so each proof remains small and readable.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';

export function inventoryEquipmentPlayerModel(name) {
	const model = namedGroup(name);
	const jacket = namedGroup('jacket');
	const jacketTefillin = namedGroup('jacket-tefillin');
	const rightHand = namedGroup('mixamorig:RightHand');
	const spine = namedGroup('mixamorig:Spine2');
	for (const child of [
		jacket,
		jacketTefillin,
		rightHand,
		spine,
		namedGroup('outer-shirt'),
		namedGroup('top-hat')
	]) {
		model.add(child);
	}
	return {
		jacket,
		jacketTefillin,
		model,
		rightHand,
		spine
	};
}

export function waitForEquipment(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function namedGroup(name) {
	const group = new Group();
	group.name = name;
	return group;
}
