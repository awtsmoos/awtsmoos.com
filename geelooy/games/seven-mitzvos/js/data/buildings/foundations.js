//B"H
//Boruch Hashem
//Blessed is He

import { FOUNDATIONS } from '../foundations.js';

/**
 * @module FoundationBuildings
 * @description
 * Each universal commandment receives a civic structure on Awtsmoos.com.
 * The building is not the mitzvah itself; it is a visible game vessel through
 * which the player remembers what the Awtsmoos asks humanity to protect.
 */
export const FOUNDATION_BUILDINGS = Object.freeze(FOUNDATIONS.map((record, index) => {
	const tier = index < 3 ? 1 : index < 6 ? 2 : 3;
	return Object.freeze({
		id: `foundation-${record.number}`,
		name: record.building,
		icon: record.icon,
		kind: 'foundation',
		foundation: record.number,
		tier,
		cost: {
			food: 12 + tier * 5,
			wood: 18 + index * 2,
			stone: 14 + tier * 7
		},
		production: {},
		capacity: 0,
		description: record.plain,
		exact: record.exact,
		hue: record.hue
	});
}));
