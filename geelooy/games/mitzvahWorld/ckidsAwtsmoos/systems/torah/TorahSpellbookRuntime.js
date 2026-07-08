// B"H
/** @file TorahSpellbookRuntime.js @description Spellbook runtime with strict read/learn mission hooks, including already-known passages. */
import { AbilityIndex, quoteMove, allQuoteMoves } from "../../tochen/torah/AbilityIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { SeferIndex } from "../../tochen/torah/SeferIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureBag, addBagItem, hasBagItem } from "../inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureCodex, emitCodex } from "./TorahCodexRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureTorahSkills } from "./TorahSkillRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
function emptyBook() { return { learned:{}, readSefarim:{}, mastery:{} }; }
function objectiveKeys(prefix, id, move) { return [prefix, `${prefix}:${id}`, move?.seferId ? `${prefix}:${move.seferId}` : null, move?.name ? `${prefix}:${move.name}` : null].filter(Boolean); }
function progressLearnObjectives(olam, passageId, move) { for (const key of objectiveKeys("learn", passageId, move)) progressActiveObjectives(olam, key, 1); }
export function ensureSpellbook(olam) {
  const p = playerOf(olam); if (!p) return null;
  ensureBag(olam); ensureCodex(olam); ensureTorahSkills(olam); p.spellbook ||= emptyBook();
  for (const s of Object.values(SeferIndex)) if (s.starter || hasBagItem(olam, `sefer_${s.id}`)) for (const id of s.passages) learnPassage(olam, id, { silent:true, noEmit:true, noMission:true });
  return p.spellbook;
}
export function ownedSefarim(olam) { ensureBag(olam); return Object.values(SeferIndex).filter(s => hasBagItem(olam, `sefer_${s.id}`) || s.starter); }
export function readSefer(olam, seferId) {
  const s = SeferIndex[seferId]; if (!s) return false;
  const book = ensureSpellbook(olam); addBagItem(olam, `sefer_${seferId}`, { silent:true });
  book.readSefarim[seferId] = (book.readSefarim[seferId] || 0) + 1;
  progressActiveObjectives(olam, "readSefer", 1); progressActiveObjectives(olam, `readSefer:${seferId}`, 1);
  for (const id of s.passages) learnPassage(olam, id, { silent:false, noEmit:true });
  emit(olam, "seferReader", { open:true, sefer:s, passages:s.passages.map(id => quoteMove(id)).filter(Boolean) });
  emitSpellbookUi(olam); return s;
}
export function learnPassage(olam, passageId, options = {}) {
  const ability = AbilityIndex[passageId], p = playerOf(olam); if (!ability || !p) return false;
  p.spellbook ||= emptyBook(); const move = quoteMove(passageId); const already = Boolean(p.spellbook.learned[passageId]);
  p.spellbook.learned[passageId] ||= { id:passageId, learnedAt:Date.now(), uses:0, move };
  p.learnedSkills ||= []; if (!p.learnedSkills.includes(passageId)) p.learnedSkills.push(passageId);
  if (!options.noMission) progressLearnObjectives(olam, passageId, move);
  if (!options.silent && !already) emit(olam, "effectsOverlay", { text:`NEW PASSAGE: ${move.name}`, color:"#d7c8ff" });
  if (!options.noEmit) emitSpellbookUi(olam); return move;
}
export function spellbookPayload(olam) {
  const book = ensureSpellbook(olam) || emptyBook();
  const learned = Object.values(book.learned).map(entry => ({ ...entry.move, uses:entry.uses || 0, mastery:book.mastery[entry.id] || 0 }));
  return { open:false, sefarim:ownedSefarim(olam), learned, allMoves:allQuoteMoves(), mastery:book.mastery };
}
export function emitSpellbookUi(olam, open = false) { const payload = spellbookPayload(olam); payload.open = open; emit(olam, "torahSpellbook", payload); emit(olam, "knowledgeMenu", { open, updateKnowledge:payload.learned }); emit(olam, "skillBar", { updateSkills:payload.learned }); emitCodex(olam, false); return payload; }
export function openSpellbook(olam) { emit(olam, "effectsOverlay", { text:"TORAH SPELLBOOK", color:"#d7c8ff" }); return emitSpellbookUi(olam, true); }
export function notePassageUse(olam, passageId) { const book = ensureSpellbook(olam); const entry = book?.learned?.[passageId]; if (!entry) return false; entry.uses += 1; book.mastery[passageId] = entry.uses >= 12 ? 3 : entry.uses >= 5 ? 2 : entry.uses >= 2 ? 1 : 0; emitSpellbookUi(olam); return entry; }
export default { ensureSpellbook, ownedSefarim, readSefer, learnPassage, spellbookPayload, emitSpellbookUi, openSpellbook, notePassageUse };
