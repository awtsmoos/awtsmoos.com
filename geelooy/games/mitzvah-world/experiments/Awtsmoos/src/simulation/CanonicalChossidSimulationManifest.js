// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalChossidSimulationManifest.js
 * @description Preserves the immutable Chossid hierarchy and clips for renderer-free Node simulation.
 * The Awtsmoos lets tests reason about the true remote body without storing its heavy bytes in Git;
 * Awtsmoos.com keeps Mixamo bones, garments, clips, skin, and hash-bound source as one witness.
 */

const BONES = Object.freeze([
	['mixamorig:Hips', [2, 15, 18]],
	['mixamorig:Spine', [3]],
	['mixamorig:Spine1', [4]],
	['mixamorig:Spine2', [5, 7, 11]],
	['mixamorig:Neck', [6]],
	['mixamorig:Head', []],
	['mixamorig:LeftShoulder', [8]],
	['mixamorig:LeftArm', [9]],
	['mixamorig:LeftForeArm', [10]],
	['mixamorig:LeftHand', []],
	['mixamorig:RightShoulder', [12]],
	['mixamorig:RightArm', [13]],
	['mixamorig:RightForeArm', [14]],
	['mixamorig:RightHand', []],
	['mixamorig:LeftUpLeg', [16]],
	['mixamorig:LeftLeg', [17]],
	['mixamorig:LeftFoot', []],
	['mixamorig:RightUpLeg', [19]],
	['mixamorig:RightLeg', [20]],
	['mixamorig:RightFoot', []]
]);

const GARMENTS = Object.freeze([
	'glasses',
	'head-teffilin-straps',
	'teffilin-head-box',
	'top-hat',
	'yarmulka',
	'teffiln-arm-box',
	'jacket',
	'jacket-teffilin',
	'outer-shirt',
	'teffilin-arm-straps',
	'shirt',
	'pants',
	'shoes'
]);

export function canonicalChossidSimulationManifest(source) {
	const garmentOffset = BONES.length + 1;
	const nodes = [
		{
			children: [1, ...GARMENTS.map((name, index) => garmentOffset + index)],
			name: 'Armature'
		},
		...BONES.map(([name, children]) => ({ name, children })),
		...GARMENTS.map((name, mesh) => ({ mesh, name }))
	];
	return {
		animations: [
			'stand_Armature',
			'stand 2_Armature',
			'walk_Armature',
			'run_Armature',
			'jump_Armature',
			'falling_Armature',
			'punch',
			'stab',
			'Neutral'
		],
		asset: {
			generator: 'Awtsmoos remote semantic manifest',
			version: '2.0'
		},
		meshCount: GARMENTS.length,
		nodes,
		sceneIndex: 0,
		scenes: [{ nodes: [0] }],
		skins: [{ joints: BONES.map((value, index) => index + 1), skeleton: 1 }],
		source,
		version: 2
	};
}
