// B"H

/**
 * Every gameplay item names either a true procedural model or a geometric effect.
 * `meshScale` maps native model dimensions into readable arena size.
 */
export const ITEMS = {
	letter: item('Hebrew Letter', 'letter', 5, 10, 3, 18, [5, 5, 5], 'small'),
	stone: item('Foundation Stone', 'sphere', 7, 8, 5, 24, [7, 4.5, 7], 'small'),
	scroll: item('Scroll', 'cylinder', 9, 12, 8, 34, [8, 6, 8], 'small'),
	bollard: model('Street Bollard', 'bollard', 10, 18, 10, 42, 5.2, 'street'),
	bench: model('Study Bench', 'bench', 13, 12, 14, 54, 6.4, 'street'),
	planter: model('Garden Planter', 'planter', 15, 16, 18, 68, 7.2, 'nature'),
	streetSign: model('Living Sign', 'streetSign', 16, 25, 20, 78, 7.6, 'street'),
	streetLamp: model('Lamp of Wisdom', 'streetLamp', 18, 34, 25, 94, 7.2, 'street'),
	hedge: model('Garden Hedge', 'hedge', 19, 18, 27, 102, 7.4, 'nature'),
	marketCart: model('Market Cart', 'marketCart', 22, 26, 34, 124, 7.2, 'vehicle'),
	kiosk: model('Market Kiosk', 'kiosk', 25, 34, 42, 152, 7.2, 'building'),
	car: traffic('City Car', 'car', 25, 18, 44, 160, 8.4),
	taxi: traffic('Golden Taxi', 'taxi', 26, 19, 48, 175, 8.5),
	van: traffic('Delivery Van', 'van', 31, 27, 62, 216, 8.2),
	tree: model('Cedar of Life', 'treeModel', 32, 52, 66, 228, 8.4, 'nature'),
	fountain: model('Fountain of Insight', 'fountain', 36, 38, 82, 285, 8.8, 'landmark'),
	townhouse: model('House of Study', 'townhouse', 42, 58, 108, 360, 9.2, 'building'),
	shop: model('Illuminated Shop', 'shop', 46, 54, 122, 410, 9.0, 'building'),
	bus: traffic('City Bus', 'bus', 50, 42, 142, 470, 8.8),
	truck: traffic('Great Delivery Truck', 'truck', 54, 45, 162, 530, 8.5),
	studyHall: model('Grand Study Hall', 'studyHall', 62, 78, 210, 690, 8.8, 'building'),
	tower: model('Tower of Letters', 'tower', 72, 118, 286, 900, 8.6, 'building'),
	monument: model('Monument of Light', 'monument', 76, 105, 318, 990, 9.2, 'landmark'),
	palace: model('Palace of Understanding', 'palace', 96, 132, 440, 1350, 8.0, 'landmark'),
	timeOrb: pickup('Time Crystal', 'star', 10, 16, 6, 90, [7, 7, 7], 'time'),
	magnetOrb: pickup('Gathering Light', 'ring', 11, 14, 7, 110, [8, 8, 8], 'magnet'),
	surgeOrb: pickup('Ohr Surge', 'star', 12, 18, 8, 130, [9, 9, 9], 'surge')
};

export function itemDefinition(kind) {
	return ITEMS[kind] || ITEMS.letter;
}

export function weightedKinds(weights) {
	return Object.entries(weights).flatMap(([kind, weight]) => Array(Math.max(1, Math.round(weight))).fill(kind));
}

function item(label, shape, r, h, mass, sparks, meshScale, category, extra = {}) {
	return { label, shape, r, h, mass, sparks, meshScale, category, ...extra };
}

function model(label, modelName, r, h, mass, sparks, scale, category) {
	return item(label, null, r, h, mass, sparks, [scale, scale, scale], category, { model: modelName });
}

function traffic(label, modelName, r, h, mass, sparks, scale) {
	return { ...model(label, modelName, r, h, mass, sparks, scale, 'vehicle'), traffic: true };
}

function pickup(label, shape, r, h, mass, sparks, meshScale, power) {
	return item(label, shape, r, h, mass, sparks, meshScale, 'pickup', { power });
}
