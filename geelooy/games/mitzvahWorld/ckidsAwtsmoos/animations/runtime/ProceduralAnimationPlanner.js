// B"H
/** @file ProceduralAnimationPlanner.js @description Plans layered upper-body clips and breathing without needing final mocap. */
export function planActorAnimation(actor = {}, action = "idle") { const upper = /talk|wave|point|pray|study|read|write|bless/.test(action); const locomotion = actor.speed > 3 ? "run" : actor.speed > .2 ? "walk" : "idle"; return { base:upper ? locomotion : action, upper:upper ? action : null, additive:["breathing", actor.blink === false ? null : "eyeblink", actor.lookAt ? "eye-track" : null].filter(Boolean), blendMs:upper ? 180 : 120, procedural:true }; }
export function animalMotionPlan(animal = {}) { const gait = animal.behavior?.gait || "idle"; return { base:gait, additive:["breathing","ear-flick","tail-sway"], gaitVariance:animal.genes?.gaitVariance || 1, procedural:true }; }
export default planActorAnimation;
