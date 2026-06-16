import { resolvePose } from '../js/render/v3/character/animation/AnimationController.js';
import { ANIMATION_STATES } from '../js/render/v3/character/animation/StateMap.js';
const base = { x: 200, y: 300, vx: 0, vy: 0, face: 1, grounded: true, motionClock: 44, damage: 20 };
const attack = id => ({ id, startup: 5, active: 5, recovery: 10, charge: id.includes('charge') ? .7 : 0 });
const cases = [
  ['idle', {}], ['run', { vx: 5 }], ['sprint', { vx: 9 }], ['brake', { vx: 1.1, input: { x: 0 } }],
  ['turnaround', { vx: 4, input: { x: -1 } }], ['rising', { grounded: false, vy: -8 }], ['peak', { grounded: false, vy: 0 }],
  ['fastFall', { grounded: false, vy: 15, fastFalling: true }], ['landing', { landingLag: 4 }],
  ['chargeHold', { chargeGlow: .8 }], ['punch', { attack: attack('jab'), attackFrame: 2 }],
  ['punchActive', { attack: attack('chargePunch'), attackFrame: 7, comboCount: 6 }], ['rapid', { rapidAttack: { id:'rapidPunch', rapid:true }, rapidAttackFrame: 3 }],
  ['kick', { attack: attack('roundhouse'), attackFrame: 7 }], ['meteor', { attack: attack('meteorKick'), attackFrame: 7 }],
  ['hit', { stun: 38, vx: -8, hitstop: 6 }], ['shield', { blocking: true }], ['death', { dead: true }], ['respawn', { respawnTimer: 30 }]
];
const seen = cases.map(([name, patch]) => inspect(name, { ...base, ...patch }));
console.log(JSON.stringify({ ok: true, vocabulary: ANIMATION_STATES.length, seen }, null, 2));
function inspect(label, f) { const p = resolvePose(f); for (const [k, v] of Object.entries(p)) if (v && typeof v === 'object' && 'x' in v && !Number.isFinite(v.x + v.y)) throw new Error(label + ' bad ' + k); return { label, state: p.anim.name, head: round(p.head), rightHand: round(p.rightHand), rightFoot: round(p.rightFoot) }; }
function round(p) { return { x: Math.round(p.x), y: Math.round(p.y) }; }
