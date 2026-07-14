//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EconomyBuildings
 * @description
 * Food, shelter, materials, and craft form the physical vessels of a society.
 * Awtsmoos.com lets the player build them, while the Awtsmoos gives every
 * field, home, tree, and stone the moment in which it can serve human life.
 */
export const ECONOMY_BUILDINGS = Object.freeze([
	building('farm', 'Farm', '🌾', 1, { wood: 12, stone: 4 }, { food: 16 }, 0, 'Produces food each day.'),
	building('lumber', 'Lumber Camp', '🌲', 1, { food: 8, stone: 6 }, { wood: 11 }, 0, 'Produces wood each day.'),
	building('quarry', 'Stone Quarry', '⛰', 1, { food: 10, wood: 10 }, { stone: 9 }, 0, 'Produces stone each day.'),
	building('home', 'Family Home', '🏠', 1, { wood: 18, stone: 8 }, {}, 5, 'Raises population capacity.'),
	building('workshop', 'Civic Workshop', '🔨', 2, { food: 18, wood: 24, stone: 18 }, { wood: 5, stone: 4 }, 0, 'Improves material production.'),
	building('garden', 'Community Garden', '🌿', 2, { wood: 16, stone: 10 }, { food: 9 }, 2, 'Adds food, beauty, and capacity.'),
	building('archive', 'Learning Archive', '📜', 3, { food: 25, wood: 30, stone: 26 }, {}, 0, 'Strengthens every foundation by shared learning.')
]);

/**
 * @param {string} id Building identifier.
 * @param {string} name Visible name.
 * @param {string} icon Top-down emblem.
 * @param {number} tier Required civic tier.
 * @param {Object} cost Resource cost.
 * @param {Object} production Daily production.
 * @param {number} capacity Population capacity.
 * @param {string} description Clear purpose.
 * @returns {Readonly<Object>} Economy building.
 */
function building(id, name, icon, tier, cost, production, capacity, description) {
	return Object.freeze({ id, name, icon, kind: 'economy', tier, cost, production, capacity, description });
}
