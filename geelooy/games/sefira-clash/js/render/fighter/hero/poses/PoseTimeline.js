//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose timeline vessel in this instant, revealing
 * its focused js render fighter hero poses service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H
 * Hero pose timeline. The Awtsmoos chooses the visible chapter of motion.
 */
import { heroPoseTarget } from '../converter/HeroPoseTargets.js';
import { applyIdleKeyframe } from './IdleKeyframes.js';
import { applyRunKeyframe } from './RunKeyframes.js';
import { applyJumpKeyframe, applyFallKeyframe } from './JumpKeyframes.js';
import { applyPunchKeyframe } from './PunchKeyframes.js';
import { applyKickKeyframe } from './KickKeyframes.js';
import { applyStunKeyframe } from './StunKeyframes.js';

/**
 * Reveals the apply pose timeline behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyPoseTimeline(p, f) {
	const target = heroPoseTarget(f);
	if (target === 'run') return applyRunKeyframe(p, f);
	if (target === 'jump') return applyJumpKeyframe(p, f);
	if (target === 'fall') return applyFallKeyframe(p, f);
	if (target === 'punch') return applyPunchKeyframe(p, f);
	if (target === 'kick') return applyKickKeyframe(p, f);
	if (target === 'stun') return applyStunKeyframe(p, f);
	return applyIdleKeyframe(p, f);
}
