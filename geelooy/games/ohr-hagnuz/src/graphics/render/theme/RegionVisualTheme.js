// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RegionVisualTheme.js
 * @description Resolves one coherent overhead palette from the canonical map id.
 *
 * The Awtsmoos is one while worlds wear many garments. Awtsmoos.com receives a
 * single visual theme per map so grass, water, roads, trees, and ruins agree.
 */
const VERDANT = {
	id: 'verdant',
	grass: ['#173a2f', '#2d6a3f', '#1f5135', '#62a35a', '#e4c06b'],
	road: ['#74604c', '#4d382e', '#9c876c', '#3f6b3e'],
	water: ['#2f6d70', '#1d555c', '#113844', '#a6d9cf', '#6f8650'],
	props: ['#59665b', '#718c4d', '#827766', '#355d39', '#d1ae5f'],
	tree: ['#173d24', '#28633a', '#3e814b'],
	density: 1
};

const THEMES = [
	[/Tehom|Sea_Of_Fire/i, {
		id: 'ember', grass: ['#241d21', '#49302c', '#352326', '#8a4c3f', '#e09a58'],
		road: ['#4b3a38', '#241b1b', '#75605a', '#5b4031'],
		water: ['#413144', '#291f35', '#171421', '#c79ab5', '#75604c'],
		props: ['#50494d', '#6f5443', '#74635f', '#493c39', '#d48b54'],
		tree: ['#282024', '#4b302f', '#74483b'], density: 0.8
	}],
	[/YudDalet|Snow|Frost/i, {
		id: 'frost', grass: ['#314344', '#587072', '#40585b', '#91b2ae', '#e3d9ad'],
		road: ['#706b61', '#4d4944', '#a59e8d', '#667669'],
		water: ['#4e7d86', '#315d69', '#183d4c', '#c7eef0', '#7f927b'],
		props: ['#707b7a', '#82927c', '#8d8b82', '#536c61', '#d8cc9d'],
		tree: ['#244a47', '#3f6d67', '#8fb4ad'], density: 0.85
	}],
	[/Gimmel|Desert|Rambam_Garden|Levi_Road/i, {
		id: 'desert', grass: ['#5c5533', '#7f7742', '#655d35', '#a89a50', '#e0b866'],
		road: ['#8a6b47', '#5d4631', '#b49569', '#6d7240'],
		water: ['#3b7d78', '#28625f', '#174544', '#b1e3d4', '#78864c'],
		props: ['#7e725c', '#7f8149', '#9a8567', '#67713f', '#dfb85f'],
		tree: ['#3d542b', '#61743b', '#8d9a4a'], density: 0.72
	}],
	[/Atzilut|Ohr|Keter|Final_Declaration/i, {
		id: 'luminous', grass: ['#3d493e', '#687a58', '#506445', '#a0b577', '#f3d98c'],
		road: ['#91816a', '#655847', '#c1ae8c', '#7c8b61'],
		water: ['#5e8f91', '#3d7075', '#27525c', '#dcf4e7', '#8b9e68'],
		props: ['#827f73', '#889865', '#aca18d', '#657756', '#f1d783'],
		tree: ['#466044', '#6f875b', '#a7b978'], density: 0.9
	}],
	[/YudVav|Mikvah|Reeds|Marsh/i, {
		id: 'marsh', grass: ['#132f2b', '#285848', '#1c4438', '#4d8465', '#d0b767'],
		road: ['#655548', '#3d302a', '#887460', '#315b3e'],
		water: ['#245f63', '#174b52', '#0d343f', '#8fd0c5', '#607c46'],
		props: ['#4f6258', '#657f47', '#756b5e', '#2c573d', '#c6a95c'],
		tree: ['#123a2d', '#225943', '#397458'], density: 1.2
	}]
];

export function resolveRegionVisualTheme(mapId = '') {
	const matched = THEMES.find(([pattern]) => pattern.test(String(mapId)));
	return matched?.[1] || VERDANT;
}
