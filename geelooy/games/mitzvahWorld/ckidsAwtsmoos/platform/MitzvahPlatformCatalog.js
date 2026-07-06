// B"H
export const MITZVAH_PLATFORM_SCHEMA = "mitzvah-platform-catalog-v1";

const surfaces = Object.freeze(["gameplay", "movie-maker", "replay", "studio", "ai-json"]);
const c = (group, duration, energy, constraints = [], extra = {}) => Object.freeze({
  group,
  duration,
  energy,
  constraints:Object.freeze(constraints),
  reusable:surfaces,
  ...extra
});

export const CANONICAL_ACTIONS = Object.freeze({
  idle:c("locomotion", 2.4, .1, ["breathing", "soft-sway"], { loop:true }),
  walk:c("locomotion", 1.2, .35, ["alternating-feet", "root-forward"], { loop:true, rootMotion:true }),
  run:c("locomotion", .82, .7, ["flight-light", "root-forward"], { loop:true, rootMotion:true }),
  sprint:c("locomotion", .62, .92, ["long-stride", "forward-lean"], { loop:true, rootMotion:true }),
  turn:c("locomotion", .75, .25, ["root-yaw", "feet-pivot"], { rootMotion:true }),
  look:c("locomotion", .55, .12, ["head-look-target", "eye-focus"]),
  wave:c("gesture", 1.2, .3, ["right-hand-arc", "friendly-face"]),
  point:c("gesture", .9, .32, ["arm-extend", "head-look-target"]),
  talk:c("gesture", 2.1, .28, ["mouth-shapes", "head-nods", "eye-contact"], { loop:true, speech:true }),
  talkOneHand:c("gesture", 2.2, .32, ["mouth-shapes", "one-hand-emphasis"], { loop:true, speech:true }),
  talkHands:c("gesture", 2.4, .35, ["mouth-shapes", "two-hand-emphasis"], { loop:true, speech:true }),
  talkExcited:c("gesture", 1.7, .55, ["mouth-shapes", "quick-hands", "eyebrow-lift"], { loop:true, speech:true }),
  pray:c("ritual", 4, .18, ["hands-near-chest", "gentle-sway"], { loop:true }),
  bless:c("ritual", 2.5, .3, ["hands-forward", "calm-posture"]),
  pickup:c("interaction", 1.1, .42, ["bend-knees", "hand-to-ground"]),
  loot:c("interaction", 1.4, .38, ["kneel-or-bend", "hands-search"]),
  carry:c("interaction", 1.8, .5, ["hands-load", "weighted-spine"], { loop:true }),
  drop:c("interaction", .85, .28, ["hands-release", "weight-transfer"]),
  openDoor:c("interaction", 1.2, .28, ["reach-handle", "pull-or-push"]),
  closeDoor:c("interaction", 1.05, .25, ["reach-handle", "push-or-pull"]),
  knock:c("interaction", .9, .24, ["hand-tap-door", "body-square"]),
  sit:c("interaction", 1.3, .28, ["hips-descend", "feet-stable"]),
  stand:c("interaction", 1.1, .3, ["hips-rise", "balance"]),
  eat:c("interaction", 2.6, .2, ["hand-to-mouth", "small-nods"], { loop:true }),
  drink:c("interaction", 1.7, .18, ["cup-tilt", "head-tilt"]),
  sleep:c("interaction", 3.2, .05, ["body-rest", "slow-breathing"], { loop:true }),
  wake:c("interaction", 1.8, .22, ["body-rise", "head-orient"]),
  laugh:c("social", 1.5, .35, ["shoulder-bounce", "open-face"]),
  cry:c("social", 2.4, .3, ["head-lower", "hands-near-face"], { loop:true }),
  celebrate:c("social", 1.8, .7, ["arms-up", "bounce"]),
  dance:c("social", 2.6, .75, ["rhythm-steps", "arm-swing"], { loop:true }),
  punch:c("combat", .85, .72, ["fist-extension", "hips-twist"], { impact:true }),
  kick:c("combat", .95, .82, ["leg-extension", "counter-balance"], { impact:true }),
  staffStrike:c("combat", 1.05, .85, ["two-hand-grip", "staff-arc"], { weapon:"staff", impact:true }),
  staffSpin:c("combat", 1.4, .88, ["two-hand-grip", "staff-spin"], { weapon:"staff", loop:true }),
  bowDraw:c("combat", 1.1, .5, ["two-hand-aim", "string-draw"], { weapon:"bow", loop:true }),
  bowRelease:c("combat", .5, .62, ["string-release", "follow-through"], { weapon:"bow", impact:true }),
  knifeSlash:c("combat", .82, .76, ["short-blade-arc", "close-range"], { weapon:"knife", impact:true }),
  shechitaKnifeAction:c("harvest", 1.5, .45, ["designated-tool", "careful-controlled-motion"], { weapon:"shechitaKnife", respectfulUse:true }),
  throw:c("combat", .8, .6, ["arm-cock", "projectile-release"], { impact:true }),
  castSmallSpell:c("combat", 1.1, .5, ["hand-channel", "small-release"], { spell:true }),
  castStorm:c("combat", 2.2, .95, ["both-hands-raise", "storm-release"], { spell:true }),
  castHealing:c("combat", 1.8, .55, ["hands-soft-glow", "target-care"], { spell:true }),
  block:c("combat", .65, .6, ["forearms-shield", "brace-feet"]),
  parry:c("combat", .5, .75, ["timed-deflection", "wrist-turn"]),
  dodge:c("combat", .55, .8, ["side-step", "head-clear"], { rootMotion:true }),
  hitReaction:c("combat", .55, .65, ["impact-recoil", "protect-center"]),
  death:c("combat", 1.35, .8, ["fall-safe", "disable-control"]),
  recover:c("combat", 1.5, .55, ["get-up", "restore-balance"])
});

export const ACTION_ALIASES = Object.freeze({
  slowWalk:"walk",
  limp:"walk",
  talkWithOneHand:"talkOneHand",
  talkWithBothHands:"talkHands",
  meleeStrike:"staffStrike",
  meleeSlash:"knifeSlash",
  bowShoot:"bowRelease",
  rangedAim:"bowDraw",
  cast:"castSmallSpell",
  heal:"castHealing",
  hurt:"hitReaction",
  stagger:"hitReaction",
  fall:"death",
  acceptQuest:"bless",
  giveItem:"point"
});

export const CORE_STATS = Object.freeze({
  health:100,
  strength:5,
  dexterity:5,
  speed:5,
  wisdom:5,
  intellect:5,
  stamina:100,
  faith:5,
  charisma:5,
  chochmah:3,
  binah:3,
  daas:3,
  ahavah:3,
  yirah:3,
  chesed:3,
  gevurah:3,
  tiferes:3,
  netzach:3,
  hod:3,
  yesod:3,
  malchus:3
});

export const WEAPON_ARCHETYPES = Object.freeze({
  walkingStaff:{ grip:["rightHand", "leftHand"], reach:2.1, weight:.55, momentum:.5, actions:["staffStrike", "staffSpin", "block"], scalesWith:["wisdom", "chesed"] },
  staff:{ grip:["rightHand", "leftHand"], reach:2.25, weight:.7, momentum:.72, actions:["staffStrike", "staffSpin", "block"], scalesWith:["strength", "wisdom"] },
  knife:{ grip:["rightHand"], reach:.75, weight:.18, momentum:.32, actions:["knifeSlash", "parry"], scalesWith:["dexterity", "gevurah"] },
  shechitaKnife:{ grip:["rightHand"], reach:.65, weight:.16, momentum:.2, actions:["shechitaKnifeAction"], scalesWith:["dexterity", "yirah"], designatedHarvestTool:true },
  bow:{ grip:["leftHand", "rightHand"], reach:18, weight:.45, momentum:.6, actions:["bowDraw", "bowRelease"], scalesWith:["dexterity", "daas"] },
  magicStaff:{ grip:["rightHand", "leftHand"], reach:2, weight:.5, momentum:.42, actions:["castSmallSpell", "castStorm", "castHealing"], scalesWith:["faith", "chochmah", "binah"] },
  torch:{ grip:["rightHand"], reach:.9, weight:.25, momentum:.28, actions:["carry", "castSmallSpell"], scalesWith:["stamina"] },
  hammer:{ grip:["rightHand"], reach:.8, weight:.9, momentum:.9, actions:["staffStrike", "block"], scalesWith:["strength", "malchus"] },
  axe:{ grip:["rightHand", "leftHand"], reach:1.15, weight:.85, momentum:.95, actions:["staffStrike"], scalesWith:["strength", "netzach"] }
});

export const ANIMAL_RULES = Object.freeze({
  fox:{ kosher:false, category:"wildlife", behavior:["prowl", "hunt", "flee", "protect-den"], harvest:{ proper:[], other:["fox_fur", "sharp_tooth"] } },
  goat:{ kosher:true, category:"domestic", signs:["split-hooves", "chews-cud"], behavior:["graze", "drink", "herd", "protect-young"], harvest:{ proper:["kosher_meat", "hide", "small_horn"], other:["hide", "small_horn"] } },
  cow:{ kosher:true, category:"domestic", signs:["split-hooves", "chews-cud"], behavior:["graze", "drink", "herd", "sleep"], harvest:{ proper:["kosher_meat", "hide"], other:["hide"] } },
  deer:{ kosher:true, category:"wildlife", signs:["split-hooves", "chews-cud"], behavior:["graze", "flee", "herd"], harvest:{ proper:["kosher_meat", "antler"], other:["antler", "hide"] } },
  rabbit:{ kosher:false, category:"wildlife", behavior:["graze", "burrow", "flee"], harvest:{ proper:[], other:["soft_fur"] } },
  frog:{ kosher:false, category:"ambient", behavior:["drink", "sleep", "leap"], harvest:{ proper:[], other:["pond_herb"] } },
  bird:{ kosher:false, category:"bird", behavior:["peck", "fly", "nest"], harvest:{ proper:[], other:["feather"] } },
  chicken:{ kosher:true, category:"bird", behavior:["peck", "flock", "roost"], harvest:{ proper:["kosher_poultry", "feather"], other:["feather"] } },
  boar:{ kosher:false, category:"wildlife", signs:["split-hooves-only"], behavior:["forage", "charge", "protect-young"], harvest:{ proper:[], other:["boar_hide", "tusk"] } },
  sheep:{ kosher:true, category:"domestic", signs:["split-hooves", "chews-cud"], behavior:["graze", "herd", "sleep"], harvest:{ proper:["kosher_meat", "wool_bundle", "hide"], other:["wool_bundle", "hide"] } },
  dog:{ kosher:false, category:"companion", behavior:["follow", "guard", "sleep"], harvest:{ proper:[], other:["collar_tag"] } },
  horse:{ kosher:false, category:"mount", behavior:["graze", "travel", "sleep"], harvest:{ proper:[], other:["horse_hair"] } },
  guardian_ram:{ kosher:true, category:"fantasy-guardian", signs:["split-hooves", "chews-cud"], behavior:["guard", "charge", "protect-herd"], harvest:{ proper:["kosher_meat", "wool_bundle", "curled_horn"], other:["wool_bundle", "curled_horn"] } }
});

export const CHOSSID_GLB_INSPECTION = Object.freeze({
  url:"https://models-3122d.web.app/chossid.glb",
  source:"downloaded-and-parsed-2026-07-06",
  meshes:51,
  materials:["skin", "pants", "shirt", "shoes", "lips", "gums", "hair", "glasses-frame", "glasses-glass", "eye-color", "pupil", "eye-white", "teffilinStrap", "teffilinBayis", "jacket.001", "teffilinShin", "tophat", "yamulka", "jacket", "outer-shirt"],
  skeleton:{ skin:"Armature", bones:65, prefix:"mixamorig", head:"mixamorig:Head", leftHand:"mixamorig:LeftHand", rightHand:"mixamorig:RightHand" },
  animations:["Armature.001|mixamo.com|Layer0", "Armature.001|mixamo.com|Layer0.001", "dance hip hop_Armature", "dance silly_Armature", "falling_Armature", "hands-out", "jump_Armature", "neutral_Armature", "punch", "run_Armature", "stab", "stand 2_Armature", "stand_Armature", "walk_Armature"],
  wardrobe:{ meshes:["top-hat", "yarmalka", "jacket", "jacket-teffilin", "outer-shirt", "body", "hairPlaceholder"], materialSlots:["pants", "shirt", "shoes", "jacket", "outer-shirt", "tophat", "yamulka", "hair"] },
  morphTargets:{ mouth:["O", "S"], shirt:["rolled-up"], carrierMeshes:["body", "beard", "mustache"] },
  facialControls:{ blinkMeshes:["eyelid-right-top", "eyelid-right-bottom", "eyelid-right-top.001", "eyelid-right-bottom.001"], eyebrowMeshes:["eyeBrowLeft", "eyeBrowRight"], headBone:"mixamorig:Head" }
});

export function normalizePlatformActionName(name = "idle") {
  const key = String(name || "idle").trim();
  return CANONICAL_ACTIONS[key] ? key : ACTION_ALIASES[key] || "idle";
}

export function platformActionNames() {
  return Object.keys(CANONICAL_ACTIONS);
}

export function platformActionShorthandTerms() {
  const terms = {};
  for (const name of platformActionNames()) terms[name] = name;
  for (const [alias, target] of Object.entries(ACTION_ALIASES)) terms[alias] = target;
  return terms;
}

export function speciesNames() {
  return Object.keys(ANIMAL_RULES);
}

export function animalRule(species = "fox") {
  return ANIMAL_RULES[species] || ANIMAL_RULES.fox;
}

export function harvestAnimal(species, options = {}) {
  const rule = animalRule(species);
  const proper = Boolean(options.proper || options.tool === "shechitaKnife" || options.designatedTool);
  return {
    species,
    kosherSpecies:Boolean(rule.kosher),
    properHarvest:proper,
    usableForFood:Boolean(rule.kosher && proper),
    outputs:[...(proper ? rule.harvest.proper : rule.harvest.other)],
    note:rule.kosher && !proper ? "Food output withheld by game rules; crafting materials may remain." : "Harvest resolved by game rules."
  };
}

export default {
  MITZVAH_PLATFORM_SCHEMA,
  CANONICAL_ACTIONS,
  ACTION_ALIASES,
  CORE_STATS,
  WEAPON_ARCHETYPES,
  ANIMAL_RULES,
  CHOSSID_GLB_INSPECTION,
  normalizePlatformActionName,
  platformActionNames,
  platformActionShorthandTerms,
  speciesNames,
  animalRule,
  harvestAnimal
};
