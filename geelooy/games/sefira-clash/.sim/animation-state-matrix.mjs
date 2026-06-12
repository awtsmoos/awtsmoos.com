import { buildSkeleton } from '../js/skeleton/buildSkeleton.js';
import { solveSkeleton } from '../js/skeleton/solveSkeleton.js';

/**
 * B"H
 * Animation state matrix.
 * Synthetic visual states report mood, kind, key bones, visual style, and cloth.
 */
const states = [
  ['idle grounded', {}], ['run right', { vx: 8 }], ['run left', { vx: -8, face: -1 }], ['jump rise', { grounded: false, vy: -8 }], ['fall', { grounded: false, vy: 7 }], ['fast fall', { grounded: false, fastFalling: true, vy: 13 }], ['landing', { landingLag: 5, preLandingVy: 17 }], ['charge', { chargeGlow: .6 }], ['punch startup', { attackFrame: 1, attack: attack('jab') }], ['punch active', { attackFrame: 8, attack: attack('dashPunch') }], ['punch recovery', { attackFrame: 16, attack: attack('chargePunch') }], ['kick startup', { attackFrame: 1, attack: attack('roundhouse') }], ['kick active', { attackFrame: 7, attack: attack('aerialKick') }], ['kick recovery', { attackFrame: 17, attack: attack('meteorKick') }], ['high damage panic', { damage: 190, stocks: 1, vx: -6 }]
];
const report = states.map(([name, patch], i) => inspect(name, patch, i));
console.log(JSON.stringify({ ok: true, states: report }, null, 2));
function attack(id) { return { id, startup: 5, active: 5, recovery: 10, aim: { x: 1, y: id === 'meteorKick' ? 1 : 0 } }; }
function inspect(name, patch, i) { const f = { id: 'matrix-' + i, x: 160, y: 260, vx: 0, vy: 0, face: 1, grounded: true, damage: 20, stocks: 2, dna: { height: 1 + (i % 3) * .03, hue: 120 + i * 13, arm: 1, leg: 1 }, motionClock: 40 + i, aiMind: { role: { name: i % 2 ? 'Hunter' : 'Denier' }, koIntent: { active: i % 2 === 1 } }, ...patch }; f.bones = buildSkeleton(f); solveSkeleton(f); assertFinite(f, name); return { name, kind: f.anim.kind, mood: f.poseIntent.mood, damageBand: f.anim.damageBand, style: f.visualStyle.style, clothing: f.visualStyle.clothing.kind, head: roundPoint(f.bones.head.tip), hand: roundPoint(f.bones.rightLowerArm.tip), foot: roundPoint(f.bones.rightCalf.tip) }; }
function roundPoint(p) { return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }; }
function assertFinite(f, name) { for (const bone of Object.values(f.bones)) if (bone.root && bone.tip && (![bone.root.x, bone.root.y, bone.tip.x, bone.tip.y].every(Number.isFinite))) throw new Error(name + ': non-finite bone'); for (const chain of Object.values(f.clothState || {})) if (Array.isArray(chain) && (!chain.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)) || chain.length > 8)) throw new Error(name + ': bad cloth'); }
