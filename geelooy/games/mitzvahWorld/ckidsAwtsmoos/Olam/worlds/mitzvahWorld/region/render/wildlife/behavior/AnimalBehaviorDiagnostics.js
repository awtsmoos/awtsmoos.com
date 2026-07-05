// B"H
/** @file AnimalBehaviorDiagnostics.js @description Counts visible animal life states. */
export function collectAnimalBehaviorDiagnostics(actors = []) {
  const out = { eatingCount:0, fleeCount:0, attackBackCount:0, restCount:0, idleCount:0 };
  for (const actor of actors) {
    const state = String(actor?.userData?.state || actor?.userData?.motion?.state || actor?.__creatureState?.state || "");
    if (/graze|eat|drink|forage|hopPeck|nibble|bugCrouch/i.test(state)) out.eatingCount++;
    if (/flee|panic|alarm|jumpAway|takeoff/i.test(state)) out.fleeCount++;
    if (/attack|pounce|charge|shove|kick|peck/i.test(state)) out.attackBackCount++;
    if (/rest|idle|landNest|socialIdle/i.test(state)) out.restCount++;
    if (/idle|wander/.test(state)) out.idleCount++;
  }
  return out;
}

export default { collectAnimalBehaviorDiagnostics };
