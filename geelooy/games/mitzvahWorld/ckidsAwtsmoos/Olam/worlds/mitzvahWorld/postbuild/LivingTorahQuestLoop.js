// B"H
/**
 * @file LivingTorahQuestLoop.js
 * @description The melamed speaks, Torah becomes a quest, and coins learn purpose.
 */
import { LEVEL_ONE_LEARNING_PROMPTS, LEVEL_ONE_SEFORIM, LEVEL_ONE_SHLICHUS_MOVES, LEVEL_ONE_TORAH_SKILLS } from "../data/levelOne/LevelOneLearning.js?compact=true&v=full-shlichus-moves-20260622-bh1";
import { QUEST_LEDGER } from "../data/manifests/QuestLedger.js?compact=true&v=full-shlichus-moves-20260622-bh1";
import { MarketplaceRuntime } from "../economy/MarketplaceRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { RuntimeQuestAdapter } from "../runtime/RuntimeQuestAdapter.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureWorldStateLedger } from "../runtime/WorldStateLedger.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { NpcInteractionRuntime } from "../npcs/NpcInteractionRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const KEY = "__awtsmoosLivingTorahQuestLoop";
const NPC_ID = "melamed-r-shneur";
const QUEST_ID = "first_sefer_ask";

function makeStore(ledger) {
  return { get:(path, fallback = 0) => ledger.get(path, fallback), set:(path, value) => ledger.set(path, value) };
}
function makeNpc() {
  return { name:NPC_ID, userData:{ npcId:NPC_ID, displayName:"R' Shneur the Melamed", hasTorahDebate:true, hasMission:true, missionId:QUEST_ID, debateDeckId:"chumash_bereishis", markerType:"torah_quest" } };
}
function makePlayer() { return { coins:18, inventory:{ wood_bundle:1 }, reputation:{ village:0 }, knowledge:{} }; }
function applyLearning(player) {
  const skill = LEVEL_ONE_TORAH_SKILLS.alef_focus;
  player.knowledge.alef_focus = { title:skill.title, xp:(skill.xp || 0) + 10, unlocks:skill.unlocks };
  player.reputation.village += 1;
  return player.knowledge.alef_focus;
}
function buySefer(player) {
  const market = new MarketplaceRuntime({ village_siddur_book:5 });
  return market.buy({ buyer:player, itemId:"village_siddur_book", qty:1, demand:1 });
}
function buildSummary({ interaction, quest, purchase, knowledge, player }) {
  return { loopId:"npc_torah_quest_loop", npcId:NPC_ID, questId:QUEST_ID, interaction, quest, purchase, knowledge, sefer:LEVEL_ONE_SEFORIM.siddur_basic, prompt:LEVEL_ONE_LEARNING_PROMPTS.first_sefer_ask, moveBook:LEVEL_ONE_SHLICHUS_MOVES, questLedger:QUEST_LEDGER, playerSnapshot:{ coins:player.coins, inventory:player.inventory, reputation:player.reputation } };
}
export async function ensureLivingTorahQuestLoop(context = {}) {
  const olam = context.olam || context;
  if (!olam) return null;
  if (olam[KEY]) return olam[KEY];
  const ledger = ensureWorldStateLedger(context), player = makePlayer(), npc = makeNpc();
  const interaction = new NpcInteractionRuntime().interact(npc, {});
  const quest = new RuntimeQuestAdapter(makeStore(ledger)).progress("torah", QUEST_ID, 1);
  const knowledge = applyLearning(player), purchase = buySefer(player);
  const summary = buildSummary({ interaction, quest, purchase, knowledge, player });
  ledger.set("loops.npcTorahQuest", summary);
  ledger.event("npc_torah_quest_loop_ready", summary);
  olam[KEY] = { summary, userData:{ stats:{ ready:true, questId:QUEST_ID, npcId:NPC_ID, events:ledger.data.events.length } } };
  return olam[KEY];
}
