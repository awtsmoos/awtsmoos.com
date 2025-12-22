
// B"H
// js/data/moves.js

import { physicalMoves } from './moves/physical.js';
import { mysticalMoves } from './moves/mystical.js';
import { amalekMoves } from './moves/amalek_moves.js';
import { expansionMoves } from './moves/expansion_moves.js';
import { letterMoves } from './moves/letters.js';
import { moves66 } from './moves/the_66_moves.js';
import { digitalMoves } from './moves/digital_moves.js';

export const moves = {
    ...physicalMoves,
    ...mysticalMoves,
    ...amalekMoves,
    ...expansionMoves,
    ...letterMoves,
    ...moves66,
    ...digitalMoves
};
