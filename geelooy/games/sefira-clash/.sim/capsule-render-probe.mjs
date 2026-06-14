import { fighter } from './animation-probe-lib.mjs';
import { capsulePoints } from '../js/render/fighter/capsule/points.js';

function finitePoint(name, p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error(`bad point ${name}`);
}

function check(name, patch) {
  const f = fighter(patch);
  const p = capsulePoints(f);
  for (const [key, value] of Object.entries(p)) if (key !== 'face') finitePoint(key, value);
  const headGap = Math.hypot(p.head.x - p.neck.x, p.head.y - p.neck.y);
  const shoulderW = Math.abs(p.rightShoulder.x - p.leftShoulder.x);
  const hipW = Math.abs(p.rightHip.x - p.leftHip.x);
  if (headGap > 32 || headGap < 12) throw new Error(`${name}: detached head gap ${headGap}`);
  if (shoulderW <= hipW) throw new Error(`${name}: shoulders not wider than hips`);
  if (p.leftFoot.y < p.leftKnee.y || p.rightFoot.y < p.rightKnee.y) throw new Error(`${name}: feet above knees`);
  return { name, headGap: +headGap.toFixed(1), shoulderW, hipW };
}

const cases = [
  check('idle', {}),
  check('run', { vx: 7, input: { x: 1 }, motionClock: 19 }),
  check('panic', { damage: 180, vx: -6, stun: 16 }),
  check('charge', { attack: { id: 'chargePunch', fullCharge: true }, attackFrame: 12 }),
  check('rapid', { rapidAttack: { id: 'jab1', rapid: true }, rapidAttackFrame: 3 })
];
console.log(JSON.stringify({ ok: true, cases }, null, 2));
