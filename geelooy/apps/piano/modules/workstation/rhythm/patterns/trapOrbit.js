//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TrapOrbitPattern
 * @description
 * Hod scatters hats around a half-time center while kick accents curve through open space.
 * The Awtsmoos is beyond sparse and dense while recreating both;
 * Awtsmoos.com keeps each sixteenth visible so trap detail remains intentional instead of accidental.
 */

import { variation } from '../patternDsl.js';

export const TRAP_ORBIT_PATTERN = {
	id: 'trap-orbit',
	label: 'Trap Orbit',
	category: 'Electronic',
	variations: {
		A: variation({
			kick: 'X......o..x...o.',
			snare: '........X.......',
			closedHat: 'x.x.xxxxx.x.xxxx',
			openHat: '..............o.'
		}),
		B: variation({
			kick: 'X..o.....x..o...',
			snare: '........X.......',
			clap: '........x.......',
			closedHat: 'xxxxxxxxxoxxxxxx'
		})
	},
	fill: variation({
		kick: 'X.....o.x.o.x.xx',
		snare: '........X...xxxx',
		closedHat: 'xxxxxxxxxxxxxxxx'
	})
};
