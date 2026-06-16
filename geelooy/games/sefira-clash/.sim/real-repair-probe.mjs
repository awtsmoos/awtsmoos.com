import '../js/render/fighters.js';
import '../js/render/ui.js';
import { driveBots } from '../js/ai/botBrain.js';
import { resolvePose } from '../js/render/v3/character/animation/AnimationController.js';
import { readCombatIntent, rememberCombatInput } from '../js/combat/inputIntent.js';

function assert(ok, msg) { if (!ok) throw new Error(msg); }
const human = { id: 1, human: true, x: 500, y: 300, dead: false, hidden: false, respawnTimer: 0, dna: { hue: 180 }, damage: 20, stocks: 3 };
const bot = { id: 2, human: false, x: 200, y: 300, vx: 0, vy: 0, grounded: true, face: 1, dead: false, hidden: false, respawnTimer: 0, dna: { hue: 90 }, stats: {}, damage: 0, stocks: 3 };
const state = { fighters: [human, bot], map: { w: 900, blast: { bottom: 900 } } };
driveBots(state);
assert(bot.input.x > 0, 'bot should chase target');
const run = resolvePose({ ...bot, vx: 6, motionClock: 10 });
const jump = resolvePose({ ...bot, grounded: false, vy: -8, motionClock: 10 });
const punch = resolvePose({ ...bot, attack: { id: 'chargePunch', startup: 5, active: 6, recovery: 8, charge: 1, fullCharge: true }, attackFrame: 8 });
assert(Math.max(run.leftFoot.y, run.rightFoot.y) - run.head.y >= 170, 'run height');
assert(jump.leftHand.y < run.leftHand.y, 'jump hands should visibly rise');
assert(Math.abs(punch.rightHand.x - punch.rightShoulder.x) > 50, 'charged punch should visibly extend');
let f = { face: 1, grounded: true, charge: { prev: {} }, rapid: { timer: 0, punchTap: 0, kickTap: 0 } };
readCombatIntent(f, { punch: true, aimX: 1, aimY: 0 }); rememberCombatInput(f, { punch: true });
readCombatIntent(f, { punch: false, aimX: 1, aimY: 0 }); rememberCombatInput(f, { punch: false });
const rapid = readCombatIntent(f, { punch: true, aimX: 1, aimY: 0 });
assert(rapid.rapidPunch, 'double tap should rapid punch');
console.log(JSON.stringify({ ok: true, ai: bot.input, runHeight: Math.max(run.leftFoot.y, run.rightFoot.y) - run.head.y, rapidPunch: rapid.rapidPunch }, null, 2));
