import { LIMB_BOUNDS } from '../js/render/fighter/capsule/limbBounds.js';
import { fighter } from './animation-probe-lib.mjs';
import { capsulePoints } from '../js/render/fighter/capsule/points.js';
import { dist } from '../js/render/fighter/capsule/math.js';

if (LIMB_BOUNDS.timing.idle > 0.018) throw new Error('idle visual timing too fast');
if (LIMB_BOUNDS.timing.run > 0.07) throw new Error('run visual timing too fast');
if (LIMB_BOUNDS.timing.attack > 0.38) throw new Error('attack visual timing too fast');
const a = capsulePoints(fighter({ vx: 7, input: { x: 1 }, motionClock: 0 }));
const b = capsulePoints(fighter({ vx: 7, input: { x: 1 }, motionClock: 4 }));
const stepDelta = dist(a.leftFoot, b.leftFoot);
if (stepDelta > 12) throw new Error(`run step jitter ${stepDelta}`);
console.log(JSON.stringify({ ok: true, timing: LIMB_BOUNDS.timing, stepDelta: +stepDelta.toFixed(2) }, null, 2));
