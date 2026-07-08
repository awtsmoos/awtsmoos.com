// B"H
import { ACTION_ALIASES, ANIMAL_RULES, CANONICAL_ACTIONS, CHOSSID_GLB_INSPECTION, platformActionNames } from "../../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { WEAPON_ACTIONS } from "../../equipment/runtime/WeaponActionCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const DEFAULT_CUSTOM_MOVIE_ACTIONS = Object.freeze([
  { id:"walkAndTalk", label:"Walk And Talk", source:"custom", target:"talkHands", clip:"walk_Armature", speech:true, rootMotion:true },
  { id:"singNiggun", label:"Sing Niggun", source:"custom", target:"talkHands", school:"singing", speech:true, loop:true },
  { id:"conductChoir", label:"Conduct Choir", source:"custom", target:"talkHands", school:"singing", speech:true },
  { id:"customSwordSpecial", label:"Custom Sword Special", source:"custom", target:"one_hand_slash_right", weapon:"sword", impact:true },
  { id:"customStaffSpecial", label:"Custom Staff Special", source:"custom", target:"staff_cast", weapon:"staff", spell:true, impact:true },
  { id:"customBowSpecial", label:"Custom Bow Special", source:"custom", target:"hebrew_letter_release", weapon:"bow", projectile:"hebrew-letter", impact:true }
]);

const GLB_ALIASES = Object.freeze({
  "walk_Armature":"walk",
  "run_Armature":"run",
  "punch":"punch",
  "stab":"knifeSlash",
  "jump_Armature":"jump",
  "falling_Armature":"death",
  "dance hip hop_Armature":"dance",
  "dance silly_Armature":"dance",
  "neutral_Armature":"idle",
  "stand_Armature":"idle",
  "stand 2_Armature":"idle",
  "hands-out":"talkHands"
});

const asList = value => Array.isArray(value) ? value : value == null ? [] : [value];

function words(value = "") {
  return String(value).split(/[|_\s.-]+/).filter(Boolean);
}

function labelFor(id = "") {
  return words(id).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || id;
}

function row(id, source, target = id, extra = {}) {
  return { id, label:labelFor(id), source, target, ...extra };
}

function animalRows() {
  const rows = [];
  for (const [species, rule] of Object.entries(ANIMAL_RULES)) {
    for (const action of rule.behavior || []) rows.push(row(action, "animal", action, { species }));
  }
  return rows;
}

export function createCustomMovieActionRows(customActions = []) {
  return asList(customActions).map(item => {
    if (typeof item === "string") return row(item, "custom", item, { custom:true });
    const id = String(item?.id || item?.name || item?.action || "").trim();
    if (!id) return null;
    return row(id, item.source || "custom", item.target || id, { custom:true, ...item, id, label:item.label || labelFor(id) });
  }).filter(Boolean);
}

function uniqueRows(rows) {
  const seen = new Map();
  for (const item of rows) if (item?.id && !seen.has(item.id)) seen.set(item.id, item);
  return [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function movieActionRows(customActions = DEFAULT_CUSTOM_MOVIE_ACTIONS) {
  const canonical = platformActionNames().map(id => row(id, "canonical", id, CANONICAL_ACTIONS[id] || {}));
  const aliases = Object.entries(ACTION_ALIASES).map(([id, target]) => row(id, "alias", target));
  const glb = (CHOSSID_GLB_INSPECTION.animations || []).map(id => row(id, "chossid-glb", GLB_ALIASES[id] || id, { rawClip:id }));
  const weapons = Object.keys(WEAPON_ACTIONS || {}).map(id => row(id, "weapon", id, { clip:WEAPON_ACTIONS[id]?.clip }));
  return uniqueRows([...canonical, ...aliases, ...glb, ...weapons, ...animalRows(), ...createCustomMovieActionRows(customActions)]);
}

export function movieActionNames(customActions = DEFAULT_CUSTOM_MOVIE_ACTIONS) {
  return movieActionRows(customActions).map(action => action.id);
}

export function normalizeMovieActionName(name = "idle", customActions = DEFAULT_CUSTOM_MOVIE_ACTIONS) {
  const raw = String(name || "idle").trim();
  if (CANONICAL_ACTIONS[raw]) return raw;
  if (ACTION_ALIASES[raw]) return ACTION_ALIASES[raw];
  if (GLB_ALIASES[raw]) return GLB_ALIASES[raw];
  if (WEAPON_ACTIONS?.[raw]) return raw;
  const custom = createCustomMovieActionRows(customActions).find(item => item.id === raw || item.name === raw || item.action === raw);
  if (custom) return custom.id;
  if (movieActionRows(customActions).some(item => item.id === raw)) return raw;
  return raw || "idle";
}

export function actionPickerModel(customActions = DEFAULT_CUSTOM_MOVIE_ACTIONS) {
  const rows = movieActionRows(customActions);
  return { total:rows.length, groups:rows.reduce((acc, item) => ((acc[item.source] ||= []).push(item), acc), {}) };
}

export default { DEFAULT_CUSTOM_MOVIE_ACTIONS, createCustomMovieActionRows, movieActionRows, movieActionNames, normalizeMovieActionName, actionPickerModel };
