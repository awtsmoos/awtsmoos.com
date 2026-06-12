/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function balanceModel(f,m,intent){const lean=clamp((f.vx||0)*.035,-.38,.38);return{centerOfMassX:f.x+lean*18,centerOfMassY:f.y-83+(m.landingImpact||0)*18,balanceLean:lean+(intent.hunt||0)*m.facing*.12-(intent.panic||0)*m.facing*.09,recoveryLean:(intent.recover||0)*m.facing*.18,panicBackLean:-(intent.panic||0)*m.facing*.14,groundedWeight:m.grounded?1:0,airborneWeight:m.airborne?1:0}}
