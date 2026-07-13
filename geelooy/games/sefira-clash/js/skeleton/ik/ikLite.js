//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ik lite vessel in this instant, revealing
 * its focused js skeleton ik service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Ordered hyper-real IK vessel.
 *
 * Chapter 103: feet first find the earth, legs then solve toward those honest
 * feet, arms solve as living chains, and the head crowns the body. Order itself
 * becomes mercy against folded crab-poses.
 */
import { armConstraint } from './armConstraint.js';
import { legConstraint } from './legConstraint.js';
import { headConstraint } from './headConstraint.js';
import { footConstraint } from './footConstraint.js';

/**
 * Reveals the ik lite behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pose The pose value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 */
export function ikLite(pose, f, metrics) {
	pose.groundY = Number.isFinite(f?.y) ? f.y : pose.groundY;
	footConstraint(pose, f, metrics);
	legConstraint(pose, 'left');
	legConstraint(pose, 'right');
	armConstraint(pose, 'left');
	armConstraint(pose, 'right');
	headConstraint(pose);
	return pose;
}
