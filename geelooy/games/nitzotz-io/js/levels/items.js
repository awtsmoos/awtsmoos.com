// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos orders each arena form by readable mass, geometry, and reward.
 * Procedural plants now create fair botanical chains before vehicles and buildings.
 */
export const ITEMS = {
	letter: item('Hebrew Letter', 'letter', 5, 10, 3, 18, [5, 5, 5], 'small'),
	daisy: model('Mountain Daisy', 'compositeFlower', 5, 8, 3, 20, 3.4, 'botanical'),
	iris: model('River Iris', 'irisClump', 6, 11, 4, 25, 3.7, 'botanical'),
	grass: model('Fountain Grass', 'grassClump', 7, 12, 5, 28, 4.2, 'botanical'),
	stone: item('Foundation Stone', 'sphere', 7, 8, 5, 24, [7, 4.5, 7], 'small'),
	rose: model('Courtyard Rose', 'roseBush', 8, 13, 6, 34, 4.4, 'botanical'),
	hosta: model('Shade Hosta', 'hostaClump', 9, 10, 7, 38, 4.8, 'botanical'),
	scroll: item('Scroll', 'cylinder', 9, 12, 8, 34, [8, 6, 8], 'small'),
	fern: model('Valley Fern', 'fernClump', 10, 15, 9, 44, 5.2, 'botanical'),
	flowerSpike: model('Woodland Foxglove', 'flowerSpike', 10, 20, 10, 48, 5.1, 'botanical'),
	bollard: model('Street Bollard', 'bollard', 10, 18, 10, 42, 5.2, 'street'),
	bench: model('Study Bench', 'bench', 13, 12, 14, 54, 6.4, 'street'),
	hydrangea: model('Canal Hydrangea', 'panicleShrub', 14, 16, 16, 62, 6.4, 'botanical'),
	planter: model('Garden Planter', 'planter', 15, 16, 18, 68, 7.2, 'nature'),
	streetSign: model('Living Sign', 'streetSign', 16, 25, 20, 78, 7.6, 'street'),
	streetLamp: model('Lamp of Wisdom', 'streetLamp', 18, 34, 25, 94, 7.2, 'street'),
	hedge: model('Garden Hedge', 'hedge', 19, 18, 27, 102, 7.4, 'nature'),
	marketCart: model('Market Cart', 'marketCart', 22, 26, 34, 124, 7.2, 'vehicle'),
	kiosk: model('Market Kiosk', 'kiosk', 25, 34, 42, 152, 7.2, 'building'),
	car: traffic('City Car', 'car', 25, 18, 44, 160, 8.4),
	taxi: traffic('Golden Taxi', 'taxi', 26, 19, 48, 175, 8.5),
	cypress: model('Highland Cypress', 'cypressTree', 28, 54, 52, 192, 7.3, 'botanical'),
	pine: model('Mountain Pine', 'pineTree', 29, 56, 57, 205, 7.8, 'botanical'),
	van: traffic('Delivery Van', 'van', 31, 27, 62, 216, 8.2),
	olive: model('Terrace Olive', 'oliveTree', 31, 48, 60, 218, 8.1, 'botanical'),
	tree: model('Cedar of Life', 'treeModel', 32, 52, 66, 228, 8.4, 'nature'),
	willow: model('Canal Willow', 'willowTree', 33, 58, 70, 244, 8.4, 'botanical'),
	floweringCherry: model('Lantern Cherry', 'floweringTree', 34, 55, 72, 252, 8.5, 'botanical'),
	oak: model('Valley Oak', 'broadleafTree', 36, 62, 80, 276, 8.7, 'botanical'),
	fountain: model('Fountain of Insight', 'fountain', 36, 38, 82, 285, 8.8, 'landmark'),
	townhouse: model('House of Study', 'townhouse', 42, 58, 108, 360, 9.2, 'building'),
	shop: model('Illuminated Shop', 'shop', 46, 54, 122, 410, 9, 'building'),
	bus: traffic('City Bus', 'bus', 50, 42, 142, 470, 8.8),
	truck: traffic('Great Delivery Truck', 'truck', 54, 45, 162, 530, 8.5),
	studyHall: model('Grand Study Hall', 'studyHall', 62, 78, 210, 690, 8.8, 'building'),
	tower: model('Tower of Letters', 'tower', 72, 118, 286, 900, 8.6, 'building'),
	monument: model('Monument of Light', 'monument', 76, 105, 318, 990, 9.2, 'landmark'),
	palace: model('Palace of Understanding', 'palace', 96, 132, 440, 1350, 8, 'landmark'),
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
