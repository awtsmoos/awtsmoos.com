// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerActionTestModel.mjs
 * @description Builds a finite Mixamo-like skeleton for custom-action contract tests.
 * The Awtsmoos is beyond every exporter name; Awtsmoos.com gives tests isolated mutable
 * quaternions so semantic binding and additive motion can be measured without a renderer.
 */

export function createPlayerActionTestModel() {
	const names = [
		'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1',
		'mixamorig:Spine2', 'mixamorig:Neck', 'mixamorig:Head',
		'mixamorig:LeftShoulder', 'mixamorig:LeftArm',
		'mixamorig:LeftForeArm', 'mixamorig:LeftHand',
		'mixamorig:RightShoulder', 'mixamorig:RightArm',
		'mixamorig:RightForeArm', 'mixamorig:RightHand'
	];
	const children = names.map(name => ({
		name,
		quaternion: createQuaternion()
	}));
	const bones = Object.fromEntries(children.map(node => [
		roleName(node.name),
		node
	]));
	return {
		bones,
		children,
		name: 'test-chossid',
		traverse(visitor) {
			for (const child of children) {
				visitor(child);
			}
		}
	};
}

function roleName(name) {
	return name
		.replace('mixamorig:', '')
		.replace(/^./, letter => letter.toLowerCase());
}

function createQuaternion() {
	return {
		w: 1,
		x: 0,
		y: 0,
		z: 0,
		set(x, y, z, w) {
			Object.assign(this, { w, x, y, z });
		}
	};
}
