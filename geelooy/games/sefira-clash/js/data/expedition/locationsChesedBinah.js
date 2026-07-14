//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chesed and Binah locations carry mercy into understanding. The Awtsmoos renews
 * river city, grove, bridge, city, labyrinth, and tower; Awtsmoos.com binds each
 * authored place to a real gate and one explicit next road.
 */

import { locationRecord as L } from './catalogBuilders.js';

export const CHESED_BINAH_LOCATIONS = Object.freeze([
	L(
		'river-city',
		'chesed',
		37,
		'settlement',
		'River City of Open Hands',
		'Wide bridges shelter travelers and healers.',
		'furnace-depths',
		'mercy-grove'
	),
	L(
		'mercy-grove',
		'chesed',
		39,
		'wilderness',
		'Mercy Grove',
		'Broad platforms reward protection and recovery.',
		'river-city',
		'bridge-light'
	),
	L(
		'bridge-light',
		'chesed',
		42,
		'climax',
		'Bridge of Living Light',
		'A radiant crossing binds distant banks.',
		'mercy-grove',
		'understanding-city'
	),
	L(
		'understanding-city',
		'binah',
		43,
		'settlement',
		'City of Understanding',
		'Architects map every route before they travel it.',
		'bridge-light',
		'labyrinth-forest'
	),
	L(
		'labyrinth-forest',
		'binah',
		45,
		'wilderness',
		'Labyrinth Forest',
		'Layered branches conceal deliberate objectives.',
		'understanding-city',
		'tower-forms'
	),
	L(
		'tower-forms',
		'binah',
		48,
		'climax',
		'Tower of Forms',
		'The ascent asks whether knowledge became action.',
		'labyrinth-forest',
		'storm-camp'
	)
]);
