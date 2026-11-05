// B"H
// Boruch Hashem
// Blessed is He

/** @file PlatformShowcaseRecipes.js @description The deterministic visible platform recipe set. */
export function platformShowcaseRecipes() {
	return [
		{
			id: 'platform-voxel-hill',
			seed: 613,
			type: 'terrain.marching-cubes',
			uv: { mode: 'planar', scale: 0.09 },
			options: {
				field: 'sphere',
				isoLevel: 0,
				origin: [0, 0, 0],
				radius: 3.8,
				resolution: [12, 12, 12],
				size: [9, 9, 9]
			}
		},
		{
			id: 'platform-river',
			seed: 613,
			type: 'environment.river',
			options: {
				bankWidth: 1.25,
				depth: 0.65,
				flowSpeed: 1.15,
				points: [[-14, 0, 0], [-8, -0.1, -2], [0, -0.2, 1], [8, -0.28, -1], [14, -0.38, 0]],
				width: 2.8
			}
		},
		{
			id: 'platform-well',
			seed: 613,
			type: 'environment.well',
			options: { radius: 1.45, segments: 28, wallHeight: 1.05 }
		},
		{
			id: 'platform-language-landmark',
			seed: 613,
			type: 'mesh.text',
			options: { text: 'beveled golden cube 2m collision' }
		},
		{
			id: 'platform-water-shader',
			seed: 613,
			type: 'material.water',
			options: { opacity: 0.84, waveAmplitude: 0.06 }
		}
	];
}
