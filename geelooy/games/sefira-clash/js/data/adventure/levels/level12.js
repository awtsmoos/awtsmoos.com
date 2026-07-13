//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level12 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Kelipah Shell Road bends combat around armored low tunnels. */
export const level12 = adventureMap({
	no: 12,
	name: 'Kelipah Shell Road',
	theme: 'shell',
	hue: 24,
	difficulty: 'Medium',
	description: 'Break two shell guards and carry their road treasure to safety.',
	idea: 'Low ceilings encourage grounded punishes and shield discipline.',
	objective: { type: 'collect-and-defeat', perutas: 5 },
	exit: 'Defeat the shell guards, collect five Perutas, and leave the road.',
	progression: ['grounded attacks', 'shield punish', 'low tunnel recovery'],
	enemies: ['Shell Guard', 'Road Kelipah'],
	rows: [
		'...###..P....###....P..###.....',
		'S.P..B....P..C..K....P.......E',
		'=======..=======..=======..====',
		'....O........W........*........'
	]
});
