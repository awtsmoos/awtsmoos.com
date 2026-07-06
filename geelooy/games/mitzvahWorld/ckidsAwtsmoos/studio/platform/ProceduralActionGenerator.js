// B"H
export const SHARED_CHOSSID_RIG = Object.freeze({
  id:"chossid_mixamorig_shared_rig",
  skeleton:"mixamorig",
  constraints:["feet-grounded", "hips-balance", "spine-counter-rotation", "hands-reachable", "head-look-target", "blendable-root-motion"],
  requiredBones:["hips", "spine", "head", "leftArm", "rightArm", "leftLeg", "rightLeg", "leftFoot", "rightFoot"]
});

const ACTIONS = Object.freeze({
  idle:{ group:"locomotion", duration:2.4, energy:.1, loops:true, constraints:["breathing", "soft-sway"] },
  walk:{ group:"locomotion", duration:1.2, energy:.35, loops:true, constraints:["alternating-feet", "root-forward"] },
  run:{ group:"locomotion", duration:.82, energy:.7, loops:true, constraints:["flight-light", "root-forward"] },
  sprint:{ group:"locomotion", duration:.62, energy:.92, loops:true, constraints:["long-stride", "forward-lean"] },
  slowWalk:{ group:"locomotion", duration:1.8, energy:.22, loops:true, constraints:["short-stride", "careful-footfall"] },
  limp:{ group:"locomotion", duration:1.6, energy:.28, loops:true, constraints:["asymmetric-stride", "injured-side"] },
  turn:{ group:"locomotion", duration:.75, energy:.25, constraints:["root-yaw", "feet-pivot"] },
  wave:{ group:"gesture", duration:1.2, energy:.3, constraints:["right-hand-arc", "friendly-face"] },
  talkHands:{ group:"gesture", duration:2.2, energy:.35, loops:true, constraints:["hand-emphasis", "eye-contact"] },
  point:{ group:"gesture", duration:.9, energy:.32, constraints:["arm-extend", "head-look-target"] },
  pray:{ group:"ritual", duration:4, energy:.18, loops:true, constraints:["hands-near-chest", "gentle-sway"] },
  bless:{ group:"ritual", duration:2.5, energy:.3, constraints:["hands-forward", "calm-posture"] },
  pickup:{ group:"interaction", duration:1.1, energy:.42, constraints:["bend-knees", "hand-to-ground"] },
  loot:{ group:"interaction", duration:1.4, energy:.38, constraints:["kneel-or-bend", "hands-search"] },
  openDoor:{ group:"interaction", duration:1.2, energy:.28, constraints:["reach-handle", "pull-or-push"] },
  knock:{ group:"interaction", duration:.9, energy:.24, constraints:["hand-tap-door", "body-square"] },
  sit:{ group:"interaction", duration:1.3, energy:.28, constraints:["hips-descend", "feet-stable"] },
  stand:{ group:"interaction", duration:1.1, energy:.3, constraints:["hips-rise", "balance"] },
  eat:{ group:"interaction", duration:2.6, energy:.2, loops:true, constraints:["hand-to-mouth", "small-nods"] },
  drink:{ group:"interaction", duration:1.7, energy:.18, constraints:["cup-tilt", "head-tilt"] },
  hug:{ group:"social", duration:2.2, energy:.32, constraints:["arms-wrap", "soft-lean"] },
  celebrate:{ group:"social", duration:1.8, energy:.7, constraints:["arms-up", "bounce"] },
  hurt:{ group:"combat", duration:.55, energy:.65, constraints:["impact-recoil", "protect-center"] },
  stagger:{ group:"combat", duration:1.1, energy:.58, constraints:["off-balance", "recover-feet"] },
  fall:{ group:"combat", duration:1.2, energy:.8, constraints:["ragdoll-entry", "safe-ground"] },
  recover:{ group:"combat", duration:1.5, energy:.55, constraints:["get-up", "restore-balance"] },
  meleeStrike:{ group:"combat", duration:.8, energy:.85, constraints:["weapon-arc", "hips-twist"] },
  rangedAim:{ group:"combat", duration:1.1, energy:.5, loops:true, constraints:["two-hand-aim", "focus-target"] },
  cast:{ group:"combat", duration:1.4, energy:.62, constraints:["hand-channel", "spine-lift"] },
  castStorm:{ group:"combat", duration:2.2, energy:.95, constraints:["both-hands-raise", "storm-release"] },
  heal:{ group:"combat", duration:1.8, energy:.55, constraints:["hands-soft-glow", "target-care"] },
  block:{ group:"combat", duration:.65, energy:.6, constraints:["forearms-shield", "brace-feet"] },
  dodge:{ group:"combat", duration:.55, energy:.8, constraints:["side-step", "head-clear"] }
});

const ALIASES = Object.freeze({ talk:"talkHands", punch:"meleeStrike", meleeSlash:"meleeStrike", bowShoot:"rangedAim", acceptQuest:"bless", giveItem:"point" });

export function actionVocabulary() {
  return Object.keys(ACTIONS);
}

export function normalizeActionName(name = "idle") {
  return ACTIONS[name] ? name : ALIASES[name] || "idle";
}

export function generateProceduralAction(name = "idle", options = {}) {
  const actionName = normalizeActionName(name);
  const spec = ACTIONS[actionName];
  const intensity = Math.max(.1, Math.min(2, Number(options.intensity || 1)));
  const duration = Number((spec.duration / intensity).toFixed(3));
  return {
    id:`action_${actionName}`,
    name:actionName,
    source:name,
    rig:options.rig?.id || SHARED_CHOSSID_RIG.id,
    parametric:true,
    blendable:true,
    reusable:["gameplay", "movie-maker", "cutscene", "ai-director"],
    duration,
    loop:Boolean(spec.loops),
    energy:Math.min(1, spec.energy * intensity),
    group:spec.group,
    constraints:[...SHARED_CHOSSID_RIG.constraints, ...spec.constraints],
    metadata:{ footIK:spec.group === "locomotion" || spec.group === "combat", lookAt:["gesture", "interaction", "combat"].includes(spec.group), rootMotion:spec.group === "locomotion" }
  };
}

export function generateActionLibrary(requested = actionVocabulary(), options = {}) {
  const names = [...new Set(requested.map(normalizeActionName))];
  return {
    rig:options.rig || SHARED_CHOSSID_RIG,
    actions:names.map(name => generateProceduralAction(name, options)),
    coverage:{ requested:requested.length, generated:names.length, groups:[...new Set(names.map(name => ACTIONS[name].group))] }
  };
}

export default { SHARED_CHOSSID_RIG, actionVocabulary, normalizeActionName, generateProceduralAction, generateActionLibrary };
