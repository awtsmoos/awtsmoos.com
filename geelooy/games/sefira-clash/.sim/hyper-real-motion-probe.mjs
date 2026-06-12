import { buildSkeleton } from '../js/skeleton/buildSkeleton.js';
import { solveSkeleton } from '../js/skeleton/solveSkeleton.js';

/**
 * B"H
 * Hyper-real motion probe.
 * Verifies not only file presence, but active solver wiring: composer readback,
 * force signatures, contact, cloth anchors, recoil, rhythm, damage, emotion.
 */
const f = {
  id: 'hyper', x: 200, y: 280, vx: 10, vy: 0, face: 1, grounded: true,
  damage: 180, stocks: 1, dna: { height: 1.08, hue: 210, arm: 1.05, leg: 0.98 },
  motionClock: 44, chargeGlow: 0.7, attackFrame: 2,
  attack: { id: 'dashPunch', startup: 5, active: 4, recovery: 12, aim: { x: 1, y: -0.1 } },
  aiMind: { role: { name: 'Hunter' }, koIntent: { active: true } }
};
f.bones = buildSkeleton(f);
solveSkeleton(f);
const keys = ['mass', 'forces', 'torque', 'recoil', 'rhythm', 'damage', 'emotion'];
for (const key of keys) assert(f.visualStyle?.[key], 'missing ' + key);
assert(f.visualContact?.grounded === true, 'contact not active');
assert(f.poseClothAnchors?.back, 'cloth anchors missing');
assert(f.poseReadback?.head, 'pose readback missing');
assert(f.visualStyle.forces.shoulderWhip > 0, 'force propagation inactive');
assert(f.visualStyle.recoil.attackRecoil >= 0, 'recoil missing');
assert(f.visualStyle.damage.critical === 1, 'critical damage signature missing');
console.log(JSON.stringify({ ok: true, styleKeys: keys, mood: f.poseIntent.mood, kind: f.anim.kind, readback: f.poseReadback.head, contact: f.visualContact }, null, 2));
function assert(condition, message) { if (!condition) throw new Error(message); }
