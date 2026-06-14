import { fighter } from './animation-probe-lib.mjs';
import { authoredPose } from '../js/render/fighter/capsule/authored/index.js';
import { dist } from '../js/render/fighter/capsule/math.js';

function assert(ok, msg) { if (!ok) throw new Error(msg); }
function finite(p, name) { assert(p && Number.isFinite(p.x) && Number.isFinite(p.y), `bad ${name}`); }
function check(name, patch, options = {}) {
  const p = authoredPose(fighter(patch));
  for (const [k, v] of Object.entries(p)) if (k !== 'face') finite(v, `${name}:${k}`);
  const shoulder = Math.abs(p.rightShoulder.x - p.leftShoulder.x);
  const hips = Math.abs(p.rightHip.x - p.leftHip.x);
  const headGap = dist(p.head, p.neck);
  assert(shoulder >= 68, `${name}: shoulder too small`);
  assert(shoulder > hips * 2, `${name}: weak hero silhouette`);
  assert(headGap <= 26, `${name}: detached head`);
  if (!options.highKick) assert(p.leftFoot.y > p.leftKnee.y && p.rightFoot.y > p.rightKnee.y, `${name}: bad feet`);
  return { name, shoulder, hips, headGap: +headGap.toFixed(1) };
}
const cases = [
  check('idle', {}),
  check('run', { vx: 8, grounded: true, motionClock: 25 }),
  check('jump', { grounded: false, vy: -8 }),
  check('fall', { grounded: false, vy: 8 }),
  check('punch', { attack: { id: 'chargePunch', startup: 9, active: 6, recovery: 8 }, attackFrame: 8 }),
  check('kick', { attack: { id: 'roundhouse', startup: 5, active: 8, recovery: 8 }, attackFrame: 8 }, { highKick: true }),
  check('hit', { stun: 24, damage: 150, vx: -7 })
];
console.log(JSON.stringify({ ok: true, cases }, null, 2));
