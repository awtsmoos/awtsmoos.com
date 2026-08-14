//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file city-district-landmarks.js
 * @description
 * The Awtsmoos renews each mitzvah district through recognizable architectural symbols while Awtsmoos.com keeps canonical population identity elsewhere;
 * these renderer landmarks express mastery and place without creating anonymous citizens or pretending a symbolic animal is part of saved settlement population.
 */
export function createCityDistrictLandmarks(assets, definition, mastery, onAnimal = () => {}) {
	const common = {
		hue: definition.hue,
		position: [0, 0.16, 0],
		scale: 0.42 + mastery * 0.12
	};
	switch (definition.id) {
		case 'false-powers':
			return [assets.tower({ ...common, name: 'watch-tower' })];
		case 'words-of-creation':
			return [
				assets.rune({ ...common, position: [-0.65, 0.16, 0] }),
				assets.tree({ ...common, position: [0.8, 0.16, 0], scale: 0.34 })
			];
		case 'every-life':
			return [assets.shelter({ ...common, name: 'rescue-center' })];
		case 'households':
			return [assets.house({ ...common, name: 'family-home' })];
		case 'honest-market':
			return [assets.stall({ ...common, name: 'fair-market' })];
		case 'living-sanctuary':
			return sanctuaryLandmarks(assets, common, onAnimal);
		case 'court-of-nations':
			return [assets.court({
				...common,
				name: 'city-court',
				scale: 0.32 + mastery * 0.08
			})];
		default:
			return [assets.house(common)];
	}
}

function sanctuaryLandmarks(assets, common, onAnimal) {
	const animal = assets.animal({
		...common,
		name: 'living-sanctuary-symbol',
		position: [0.5, 0.16, 0.2],
		scale: 0.3,
		phase: 2,
		type: 'district-symbol',
		role: 'sanctuary-symbol',
		reason: 'symbolic district landmark; not a canonical settlement animal actor'
	});
	onAnimal(animal);
	return [
		animal,
		assets.tree({ ...common, position: [-0.8, 0.16, 0], scale: 0.3 })
	];
}
