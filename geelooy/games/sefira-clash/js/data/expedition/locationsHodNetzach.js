//B"H
//Boruch Hashem
//Blessed is He

/**
 * Hod and Netzach locations carry reflection into endurance. The Awtsmoos renews
 * market, forest, palace, port, wood, and causeway; Awtsmoos.com binds each authored
 * place to a real gate and one explicit road forward.
 */

import { locationRecord as L } from './catalogBuilders.js';

export const HOD_NETZACH_LOCATIONS = Object.freeze([
	L(
		'mirror-market',
		'hod',
		13,
		'settlement',
		'Mirror Market',
		'Merchants trade polished steel and dangerous reflections.',
		'foundation-engine',
		'echo-forest'
	),
	L(
		'echo-forest',
		'hod',
		15,
		'wilderness',
		'Forest of Echoes',
		'False paths repeat each careless step.',
		'mirror-market',
		'palace-reflections'
	),
	L(
		'palace-reflections',
		'hod',
		18,
		'climax',
		'Palace of Reflections',
		'Every chamber answers with another version of the fighter.',
		'echo-forest',
		'victory-port'
	),
	L(
		'victory-port',
		'netzach',
		19,
		'settlement',
		'Victory Port',
		'Couriers and duelists gather before the long causeway.',
		'palace-reflections',
		'endurance-wood'
	),
	L(
		'endurance-wood',
		'netzach',
		21,
		'wilderness',
		'Endurance Wood',
		'Long branches reward speed without surrendering balance.',
		'victory-port',
		'endless-causeway'
	),
	L(
		'endless-causeway',
		'netzach',
		24,
		'climax',
		'The Endless Causeway',
		'A pursuit road where hesitation becomes distance.',
		'endurance-wood',
		'harmony-city'
	)
]);
