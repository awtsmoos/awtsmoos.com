// B"H
/**
 * Trainers grant identity abilities, ranked Torah passages, and tutorial
 * direction. A starter path may speak in fantasy names, but the trainer anchors
 * it into a real passage in the spellbook and action bar.
 */
import { trainerForPath, TRAINERS } from "./TrainerRegistry.js";
import { AbilityIndex, abilityRankInfo } from "../../tochen/torah/AbilityIndex.js";
import { learnPassage } from "../torah/TorahSpellbookRuntime.js";
import { assignActionSlot } from "../torah/TorahActionBarState.js";

const COST_BASE = 6;
const PATH_PASSAGE = Object.freeze({ learner:"shemaUnity", helper:"tehillimSong", guardian:"amidahArrow", builder:"chumashLight" });

function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
function stateOf(target = {}) { const p = playerOf(target) || target; p.trainerState ||= { abilityRanks:{}, trainedAt:[], learnedAbilities:[] }; return p.trainerState; }
function levelOf(olam) { return Math.max(1, Number(playerOf(olam)?.level || olam?.level || 1)); }
function perutahOf(olam) { return Number(playerOf(olam)?.perutah ?? olam?.perutah ?? 0); }
function setPerutah(olam, value) { const p = playerOf(olam) || olam; if (p) p.perutah = Math.max(0, Number(value || 0)); }
function passageIdForTrainer(trainer) { return AbilityIndex[trainer?.ability] ? trainer.ability : (PATH_PASSAGE[trainer?.path] || "shemaUnity"); }
function costForRank(rank) { return COST_BASE + Math.max(0, rank - 1) * 8; }

export function ensureTrainerState(target = {}) {
  return stateOf(target);
}

export function trainerOffers(olamOrPath = "learner") {
  const olam = typeof olamOrPath === "object" ? olamOrPath : null;
  const path = typeof olamOrPath === "string" ? olamOrPath : "learner";
  const state = stateOf(olam || {});
  const level = olam ? levelOf(olam) : 1;
  const coins = olam ? perutahOf(olam) : Infinity;
  return TRAINERS.map(trainer => {
    const passageId = passageIdForTrainer(trainer);
    const ability = AbilityIndex[passageId];
    const info = abilityRankInfo(passageId);
    const current = state.abilityRanks[passageId] || 0;
    const next = current + 1;
    const max = info.max || 1;
    const required = info.unlockLevel + Math.max(0, next - 1);
    const cost = costForRank(next);
    return { ...trainer, selected:trainer.path === path, pathAbility:trainer.ability, passageId, ability:passageId, abilityName:ability?.name || passageId, currentRank:current, nextRank:Math.min(next, max), maxRank:max, requiredLevel:required, cost, trainable:next <= max && level >= required && coins >= cost, state:next <= max ? "trainable" : "max-rank", reason:next > max ? "max-rank" : level < required ? "level-required" : coins < cost ? "low-perutah" : "ready" };
  });
}

export function trainerPayload(path = "learner") {
  const selected = trainerForPath(typeof path === "string" ? path : "learner");
  const choices = trainerOffers(path);
  return { trainer:selected, choices, trainers:choices };
}

export function rankedPassage(olamOrTopic = "kindness", passage = null) {
  if (typeof olamOrTopic === "string") return { topic:olamOrTopic, rank:1, text:"A small steady mitzvah is stronger than a loud empty motion." };
  const olam = olamOrTopic;
  const move = passage || {};
  const rank = stateOf(olam).abilityRanks[move.id] || 1;
  const info = abilityRankInfo(move.id);
  const damage = Math.round(Number(move.damage || 0) * (1 + (rank - 1) * (info.damageStep || 0)));
  const cost = Math.max(0, Math.round(Number(move.cost || move.koachCost || 0) * (1 + (rank - 1) * (info.costStep || 0))));
  return { ...move, rank, damage, cost };
}

export function trainAbilityAtTrainer(olam, path = "learner", options = {}) {
  const player = playerOf(olam);
  if (!player) return { ok:false, error:"missing-player" };
  const trainer = trainerForPath(path);
  const offer = trainerOffers(olam).find(o => o.path === trainer.path);
  if (!offer) return { ok:false, error:"missing-trainer" };
  if (!offer.trainable && !options.free) return { ok:false, error:offer.reason, offer };
  const state = stateOf(olam);
  if (!options.free) setPerutah(olam, perutahOf(olam) - offer.cost);
  state.abilityRanks[offer.passageId] = offer.nextRank;
  if (!state.learnedAbilities.includes(offer.passageId)) state.learnedAbilities.push(offer.passageId);
  state.trainedAt.push({ ability:offer.passageId, pathAbility:offer.pathAbility, rank:offer.nextRank, trainerId:trainer.id, at:Date.now(), cost:options.free ? 0 : offer.cost });
  state.trainedAt = state.trainedAt.slice(-40);
  const move = learnPassage(olam, offer.passageId, { silent:options.silent });
  if (move && offer.nextRank === 1) assignActionSlot(olam, options.slot || 1, { type:"passage", passageId:offer.passageId });
  const payload = { ok:true, trainer, offer:{ ...offer, currentRank:offer.nextRank }, move, perutah:perutahOf(olam), trainerState:state };
  emit(olam, "trainer", payload);
  emit(olam, "effectsOverlay", { text:`TRAINED ${offer.abilityName} R${offer.nextRank}`, color:"#d7c8ff" });
  return payload;
}

export function createTrainerRuntime(store = {}) {
  const state = stateOf(store);
  return {
    train(path = "learner") {
      const trainer = trainerForPath(path);
      const passageId = passageIdForTrainer(trainer);
      if (!state.learnedAbilities.includes(passageId)) state.learnedAbilities.push(passageId);
      state.abilityRanks[passageId] = Math.max(1, state.abilityRanks[passageId] || 1);
      globalThis.dispatchEvent?.(new CustomEvent("mitzvah-world:trained", { detail:{ trainer, learned:state.learnedAbilities } }));
      return { ...trainer, passageId };
    },
    trainOlam:trainAbilityAtTrainer,
    known() { return state.learnedAbilities.slice(); },
    offers:trainerOffers,
    payload:trainerPayload
  };
}

export default createTrainerRuntime;
