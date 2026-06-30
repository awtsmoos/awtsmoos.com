// B"H
const phase = (name, frames, delta = {}) => ({ name, frames, delta });

export function buildLongRunActionPlan(repeats = 10) {
  const base = [
    phase("spawnSafety", 60, { x:0, z:0 }),
    phase("houseCollision", 180, { x:1, z:0, speed:7 }),
    phase("wallSlide", 180, { x:1, z:.7, speed:7 }),
    phase("openPathProbe", 240, { x:0, z:1, speed:7 }),
    phase("lockedDoorDeny", 120, { x:1, z:0, speed:5, interact:"door" }),
    phase("openDoorTransition", 120, { x:-1, z:0, speed:5, openDoor:true }),
    phase("triggerCutscene", 180, { x:0, z:1, speed:6 }),
    phase("friendlyNpcTarget", 120, { x:-1, z:0, speed:4, target:"npc" }),
    phase("passiveAnimalTarget", 120, { x:1, z:0, speed:4, target:"animal" }),
    phase("hostileCombat", 180, { x:1, z:1, speed:5, target:"hostile", attack:true }),
    phase("denseCruise", 360, { x:Math.SQRT1_2, z:Math.SQRT1_2, speed:7 })
  ];
  const actions = [];
  for (let i = 0; i < repeats; i++) actions.push(...base.map(a => ({ ...a, repeat:i })));
  return actions;
}

export function totalActionFrames(actions = []) {
  return actions.reduce((sum, action) => sum + action.frames, 0);
}

export default { buildLongRunActionPlan, totalActionFrames };
