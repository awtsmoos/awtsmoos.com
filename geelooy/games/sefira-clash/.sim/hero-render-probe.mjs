import { fighter } from './animation-probe-lib.mjs';
import { heroPose } from '../js/render/fighter/hero/pose.js';
import { dist } from '../js/render/fighter/hero/math.js';

function assert(ok, msg) { if (!ok) throw new Error(msg); }
function finite(p, name) { assert(p && Number.isFinite(p.x) && Number.isFinite(p.y), `bad ${name}`); }
function check(name, patch, options = {}) {
  const p = heroPose(fighter(patch));
  for (const [k, v] of Object.entries(p)) if (k !== 'face' && k !== 'scale') finite(v, `${name}:${k}`);
  assert(Number.isFinite(p.scale), `${name}: bad scale`);
  const shoulder = Math.abs(p.rightShoulder.x - p.leftShoulder.x);
  const hip = Math.abs(p.rightHip.x - p.leftHip.x);
  const height = Math.max(p.leftFoot.y, p.rightFoot.y) - p.head.y;
  const headGap = dist(p.head, p.neck);
  assert(shoulder >= 72, `${name}: shoulder ${shoulder}`);
  assert(shoulder > hip * 2.2, `${name}: weak silhouette`);
  assert(height >= 170, `${name}: height ${height}`);
  assert(headGap <= 34, `${name}: head gap ${headGap}`);
  if (!options.highKick) assert(p.leftFoot.y > p.leftKnee.y && p.rightFoot.y > p.rightKnee.y, `${name}: foot/knee`);
  return { name, shoulder, hip, height: +height.toFixed(1), headGap: +headGap.toFixed(1) };
}
const cases = [
  check('idle', {}),
  check('run', { vx: 8, grounded: true, motionClock: 20 }),
  check('jump', { grounded: false, vy: -8 }),
  check('punch', { attack: { id: 'chargePunch', startup: 9, active: 6, recovery: 8 }, attackFrame: 8 }),
  check('kick', { attack: { id: 'roundhouse', startup: 5, active: 8, recovery: 8 }, attackFrame: 8 }, { highKick: true }),
  check('hit', { stun: 20, damage: 140, vx: -7 })
];
console.log(JSON.stringify({ ok: true, cases }, null, 2));
