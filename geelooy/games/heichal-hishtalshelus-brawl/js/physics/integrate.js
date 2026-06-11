import { GAME } from '../core/constants.js';
/** B"H — integration lowers intention into position: will becomes x/y. */
export function integrate(f){ f.prevY=f.y; f.vy=Math.min(GAME.maxFall,f.vy+GAME.gravity); f.x+=f.vx; f.y+=f.vy; f.vx*=f.grounded?GAME.friction:GAME.airFriction; }
