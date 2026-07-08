// B"H
/** Creates living-being descriptions from JSON without renderer assumptions. */
import { normalizeAnimationTimeline } from "../animation/AnimationIntentMapper.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function createLivingBeing(def = {}, world = {}) {
  const id = def.id || def.name || `being_${Math.random().toString(36).slice(2)}`;
  return { id, name:def.name || id, role:def.role || "villager", home:def.home || null, work:def.work || null, memory:def.memory || {}, schedule:def.schedule || [], dialogueIds:def.dialogues || [], questIds:def.quests || [], animationTimeline:normalizeAnimationTimeline(def.animations || [{ intent:"idle" }]), worldId:world.id || null };
}
export function createLivingBeings(universe = {}) { return (universe.characters || []).map(c => createLivingBeing(c, universe.world || {})); }
