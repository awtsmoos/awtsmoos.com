import { buildSkeleton } from '../js/skeleton/buildSkeleton.js';
import { solveSkeleton } from '../js/skeleton/solveSkeleton.js';

/**
 * B"H
 * Skeleton pose probe matrix.
 *
 * Chapter: The Awtsmoos renews each invisible bone before canvas appears. This
 * probe checks run, landing, fast-fall, charge punch, meteor kick, hitstun, and
 * panic high damage for finite bones, pose intent, visual style, and cloth.
 */
const cases = [
  ['run', { grounded: true, vx: 9, vy: 0 }],
  ['landing', { grounded: true, landingLag: 4, preLandingVy: 18, vx: 2, vy: 0 }],
  ['fastFall', { grounded: false, fastFalling: true, vx: 4, vy: 12 }],
  ['chargePunch', { grounded: true, attackFrame: 2, chargeGlow: 0.7, attack: { id: 'chargePunch', startup: 6, active: 4, recovery: 10, aim: { x: 1, y: -0.2 } } }],
  ['meteorKick', { grounded: false, attackFrame: 3, vx: 2, vy: 8, attack: { id: 'meteorKick', startup: 5, active: 5, recovery: 12, aim: { x: 0.4, y: 1 } } }],
  ['hitstun', { grounded: false, stun: 12, damage: 130, vx: -5, vy: -3 }],
  ['panicHighDamage', { grounded: true, damage: 190, stocks: 1, vx: -7, vy: 0 }]
];
const report = cases.map(([name, patch], index) => runCase(name, patch, index));
console.log(JSON.stringify({ ok: true, cases: report }, null, 2));

function runCase(name, patch, index) {
  const fighter = baseFighter(index, patch);
  fighter.bones = buildSkeleton(fighter);
  solveSkeleton(fighter);
  assert(fighter.poseIntent, name + ': poseIntent missing');
  assert(fighter.visualStyle?.body && fighter.visualStyle?.style && fighter.visualStyle?.clothing, name + ': visualStyle incomplete');
  assert(fighter.clothState, name + ': cloth state missing');
  assertFiniteBones(fighter, name);
  assertFiniteCloth(fighter, name);
  return { name, kind: fighter.anim.kind, mood: fighter.poseIntent.mood, damageBand: fighter.anim.damageBand, clothing: fighter.visualStyle.clothing.kind };
}
function baseFighter(index, patch) {
  return { id: 'probe-' + index, name: 'Probe', x: 140 + index * 12, y: 260, vx: 0, vy: 0, face: 1, damage: 30, stocks: 2, grounded: true, fastFalling: false, dna: { height: 1.02, hue: 190 + index * 17, arm: 1, leg: 1 }, motionClock: 25 + index * 9, chargeGlow: 0, attackFrame: 0, aiMind: { role: { name: index % 2 ? 'Hunter' : 'Survivor' }, koIntent: { active: index % 2 === 1 } }, ...patch };
}
function assertFiniteBones(f, label) { for (const [id, bone] of Object.entries(f.bones)) { if (!bone.root || !bone.tip) continue; assert(Number.isFinite(bone.root.x) && Number.isFinite(bone.root.y), label + ': ' + id + ' root is not finite'); assert(Number.isFinite(bone.tip.x) && Number.isFinite(bone.tip.y), label + ': ' + id + ' tip is not finite'); } }
function assertFiniteCloth(f, label) { for (const [name, chain] of Object.entries(f.clothState || {})) { if (!Array.isArray(chain)) continue; assert(chain.length <= 8, label + ': runaway cloth chain ' + name); for (const p of chain) assert(Number.isFinite(p.x) && Number.isFinite(p.y), label + ': non-finite cloth point'); } }
function assert(condition, message) { if (!condition) throw new Error(message); }
