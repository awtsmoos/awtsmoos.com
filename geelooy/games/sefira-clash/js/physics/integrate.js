//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the integrate vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { GAME } from '../core/constants.js';

/**
 * B"H
 * Integration lowers intention into position with remembered previous position.
 *
 * Chapter 165: collision prediction needs yesterday. prevX and prevY are saved
 * before movement so swept wall tests can catch even absurd smash velocity.
 */
export function integrate(f) {
	f.prevX = f.x;
	f.prevY = f.y;
	const gravity = GAME.gravity + (f.fastFalling ? 0.52 : 0) - (f.airDodge ? 0.42 : 0);
	const maxFall = f.fastFalling ? GAME.maxFall * 1.32 : GAME.maxFall;
	f.vy = Math.min(maxFall, f.vy + gravity);
	f.x += f.vx;
	f.y += f.vy;
	f.vx *= f.grounded ? GAME.friction : GAME.airFriction;
}
