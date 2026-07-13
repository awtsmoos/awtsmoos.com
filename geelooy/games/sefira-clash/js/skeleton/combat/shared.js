//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the shared vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import { point, exactAim, perpOf } from '../poseMath.js';
/**
 * Reveals the aim for behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 */
export const aimFor = (f, m) => exactAim(f.attack?.aim, m.facing);
/**
 * Reveals the twist torso behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} aim The aim value entering this behavior.
 * @param {*} s The s value entering this behavior.
 * @param {*} lean The lean value entering this behavior.
 * @param {*} lift The lift value entering this behavior.
 */
export function twistTorso(p, aim, s, lean, lift = 0) {
	p.chest.x -= aim.x * lean * s;
	p.chest.y += lift * s;
	p.head.x -= aim.x * lean * 0.55 * s;
	p.head.y += lift * 0.55 * s;
}
export { point, perpOf };
