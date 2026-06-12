import { buildSkeleton } from '../js/skeleton/buildSkeleton.js';
import { solveSkeleton } from '../js/skeleton/solveSkeleton.js';

const cases = [
  ['plant', { grounded: true, vx: 9 }],
  ['brake', { grounded: true, vx: -9, face: 1 }],
  ['landing', { grounded: true, preLandingVy: 20, landingLag: 4 }],
  ['air', { grounded: false, vy: 6 }]
];
const report = cases.map(([name, patch], i) => run(name, patch, i));
console.log(JSON.stringify({ ok: true, report }, null, 2));
function run(name, patch, i) {
  const f = base(i, patch);
  f.bones = buildSkeleton(f);
  solveSkeleton(f);
  assert(f.visualContact, name + ': visualContact missing');
  assert(f.poseReadback, name + ': poseReadback missing');
  assertFinite(f, name);
  if (name === 'landing') assert(f.visualDustImpulse?.power > 0, 'landing: dust impulse missing');
  return { name, contact: f.visualContact, readback: f.poseReadback.hip, feet: { l: f.bones.leftCalf.tip, r: f.bones.rightCalf.tip } };
}
function base(i, p) { return { id: 'contact-' + i, x: 180, y: 260, vx: 0, vy: 0, face: 1, grounded: true, damage: 20, stocks: 2, dna: { height: 1, hue: 180 + i * 20, arm: 1, leg: 1 }, motionClock: 20 + i, aiMind: { role: { name: 'Denier' }, koIntent: { active: false } }, ...p }; }
function assertFinite(f, n) { for (const b of Object.values(f.bones)) if (b.root && b.tip && ![b.root.x, b.root.y, b.tip.x, b.tip.y].every(Number.isFinite)) throw new Error(n + ': bad bone'); }
function assert(c, m) { if (!c) throw new Error(m); }
