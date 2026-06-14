import { fighter } from './animation-probe-lib.mjs';
import { heroPose } from '../js/render/fighter/hero/pose.js';
import { dist } from '../js/render/fighter/hero/math.js';

function assert(ok, msg) { if (!ok) throw new Error(msg); }
function check(name, patch, options = {}) {
  const p = heroPose(fighter(patch));
  const shoulder = Math.abs(p.rightShoulder.x - p.leftShoulder.x);
  const hips = Math.abs(p.rightHip.x - p.leftHip.x);
  const headGap = dist(p.head, p.neck);
  assert(shoulder >= 78, `${name}: shoulders ${shoulder}`);
  assert(shoulder / hips >= 2.35, `${name}: ratio ${shoulder / hips}`);
  assert(headGap <= 28, `${name}: head detached ${headGap}`);
  if (!options.highKick) assert(p.leftFoot.y > p.leftKnee.y && p.rightFoot.y > p.rightKnee.y, `${name}: feet/knees`);
  return { name, shoulder, hips, ratio: +(shoulder / hips).toFixed(2), headGap: +headGap.toFixed(1) };
}
const cases = [
  check('idle', {}),
  check('run', { vx: 8, grounded: true, motionClock: 22 }),
  check('jump', { grounded: false, vy: -8 }),
  check('punch', { attack: { id: 'chargePunch', startup: 9, active: 6, recovery: 8 }, attackFrame: 8 }),
  check('kick', { attack: { id: 'roundhouse', startup: 5, active: 8, recovery: 8 }, attackFrame: 8 }, { highKick: true }),
  check('stun', { stun: 24, damage: 160, vx: -7 })
];
console.log(JSON.stringify({ ok: true, cases }, null, 2));
