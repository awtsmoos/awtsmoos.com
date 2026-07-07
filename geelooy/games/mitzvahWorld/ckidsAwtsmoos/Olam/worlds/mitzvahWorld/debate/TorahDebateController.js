// B"H
/**
 * @file TorahDebateController.js
 * @description Existing Torah debate decks now expose the runtime API used by
 * NPCs/tests: open, selectPassage, playPirush, close, and reward completion.
 */
import { TORAH_DEBATE_DECKS } from "../data/debate/TorahDebateDecks.js";
import { TORAH_DEBATE_TYPES } from "../data/debate/TorahDebateRules.js";

function playerOf(olam) {
  return olam && (olam.player || olam.chossid) ? (olam.player || olam.chossid) : null;
}

function gainXp(player, xp) {
  if (player && typeof player.gainXp === "function" && xp) player.gainXp(xp);
}

function itemObject(item) {
  return typeof item === "string" ? { id:item, name:item } : item;
}

function addItems(player, items) {
  const inv = player && player.inventory ? player.inventory : null;
  if (!inv || typeof inv.addItem !== "function" || !Array.isArray(items)) return;
  for (const item of items) inv.addItem(itemObject(item), item?.amount || 1);
}

function passagePirush(passage, type) {
  return passage && passage.pirushim ? passage.pirushim[type] : null;
}

function cloneClaims(deck) {
  return (deck?.claims || []).map(claim => ({ ...claim, currentHp:Number(claim.hp || 1) }));
}

export class TorahDebateController {
  constructor({ olam = null, passages = {}, rewards = {}, decks = TORAH_DEBATE_DECKS } = {}) {
    this.olam = olam;
    this.passages = passages;
    this.rewards = rewards;
    this.decks = decks;
    this.active = null;
  }

  getPassage(id) {
    return this.passages[id] || null;
  }

  snapshot() {
    if (!this.active) return null;
    const a = this.active;
    return { active:true, deckId:a.deck.id, completed:a.completed, selectedPassageId:a.selectedPassageId || null, claimIndex:a.claimIndex, claims:a.claims.map(claim => ({ ...claim })), remaining:a.claims.filter(claim => claim.currentHp > 0).length, rewardsGranted:a.rewardsGranted };
  }

  open(deckId, player = playerOf(this.olam)) {
    const deck = this.decks[deckId];
    if (!deck) throw new Error(`Unknown debate deck: ${deckId}`);
    this.active = { deck, player, claims:cloneClaims(deck), selectedPassageId:null, claimIndex:0, completed:false, rewardsGranted:false, openedAt:Date.now() };
    return this.snapshot();
  }

  selectPassage(passageId) {
    if (!this.active) throw new Error("No active Torah debate");
    if (this.active.deck.requiredPassages?.length && !this.active.deck.requiredPassages.includes(passageId)) throw new Error(`Unknown passage or passage not accepted for deck: ${passageId}`);
    this.active.selectedPassageId = passageId;
    return this.snapshot();
  }

  playPirush(type = "pshat") {
    if (!this.active) throw new Error("No active Torah debate");
    if (!this.active.selectedPassageId) throw new Error("No passage selected");
    if (!TORAH_DEBATE_TYPES[type]) throw new Error(`Unknown pirush type: ${type}`);
    const claim = this.active.claims.find(item => item.currentHp > 0);
    if (!claim) return this.finish();
    claim.lastPirush = type;
    claim.currentHp = 0;
    this.active.claimIndex += 1;
    return this.active.claims.every(item => item.currentHp <= 0) ? this.finish() : this.snapshot();
  }

  finish() {
    if (!this.active) throw new Error("No active Torah debate");
    if (!this.active.rewardsGranted) {
      const reward = this.active.deck.rewards || {};
      gainXp(this.active.player, reward.xp || 0);
      addItems(this.active.player, reward.items || []);
      this.active.rewardsGranted = true;
    }
    this.active.completed = true;
    return this.snapshot();
  }

  close() {
    const state = this.snapshot();
    this.active = null;
    return state || { active:false, completed:false };
  }

  startDebate(passageId, type) {
    const passage = this.getPassage(passageId);
    if (!passagePirush(passage, type)) throw new Error(`Passage cannot use pirush type: ${type}`);
    return { passageId, type, state:"active", startedAt:Date.now() };
  }

  complete(result = {}) {
    const rewards = this.rewards[result.outcome] || this.rewards.default || {};
    const player = playerOf(this.olam);
    gainXp(player, rewards.xp);
    addItems(player, rewards.items);
    return { ok:true, rewards };
  }
}

export default TorahDebateController;
