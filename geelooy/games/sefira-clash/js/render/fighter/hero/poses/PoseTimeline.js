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
