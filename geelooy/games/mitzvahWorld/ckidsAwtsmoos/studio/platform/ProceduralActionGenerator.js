// B"H
import { CANONICAL_ACTIONS, normalizePlatformActionName, platformActionNames } from "../../platform/MitzvahPlatformCatalog.js";

export const SHARED_CHOSSID_RIG = Object.freeze({
  id:"chossid_mixamorig_shared_rig",
  skeleton:"mixamorig",
  constraints:["feet-grounded", "hips-balance", "spine-counter-rotation", "hands-reachable", "head-look-target", "blendable-root-motion"],
  requiredBones:["hips", "spine", "head", "leftArm", "rightArm", "leftLeg", "rightLeg", "leftFoot", "rightFoot"]
});

export function actionVocabulary() {
  return platformActionNames();
}

export function normalizeActionName(name = "idle") {
  return normalizePlatformActionName(name);
}

export function generateProceduralAction(name = "idle", options = {}) {
  const actionName = normalizeActionName(name);
  const spec = CANONICAL_ACTIONS[actionName];
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
    loop:Boolean(spec.loop),
    energy:Math.min(1, spec.energy * intensity),
    group:spec.group,
    constraints:[...SHARED_CHOSSID_RIG.constraints, ...spec.constraints],
    metadata:{
      footIK:spec.group === "locomotion" || spec.group === "combat",
      lookAt:["gesture", "interaction", "combat", "ritual", "social"].includes(spec.group),
      rootMotion:Boolean(spec.rootMotion || spec.group === "locomotion"),
      speech:Boolean(spec.speech),
      weapon:spec.weapon || null,
      spell:Boolean(spec.spell),
      replaySerializable:true,
      aiJsonName:actionName
    }
  };
}

export function generateActionLibrary(requested = actionVocabulary(), options = {}) {
  const names = [...new Set(requested.map(normalizeActionName))];
  return {
    rig:options.rig || SHARED_CHOSSID_RIG,
    actions:names.map(name => generateProceduralAction(name, options)),
    coverage:{ requested:requested.length, generated:names.length, groups:[...new Set(names.map(name => CANONICAL_ACTIONS[name].group))] }
  };
}

export default { SHARED_CHOSSID_RIG, actionVocabulary, normalizeActionName, generateProceduralAction, generateActionLibrary };
