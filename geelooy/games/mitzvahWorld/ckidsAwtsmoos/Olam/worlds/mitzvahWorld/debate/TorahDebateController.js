/**
 * B"H
 * @file TorahDebateController.js
 *
 * Chapter 14: The Court Of Four Lights.
 *
 * The Awtsmoos contracts the argument into a small pure controller. It does
 * not own rendering, storage, or NPCs. It receives a deck, passages, and a
 * player-like vessel, then returns stable state transitions for UI and tests.
 */

import { TORAH_DEBATE_DECKS } from '../data/debate/TorahDebateDecks.js';
import { CHUMASH_PASSAGES } from '../data/manifests/ChumashPassages.js';
import { resolveDebateType } from '../data/debate/TorahDebateRules.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class TorahDebateController {
  constructor({ decks = TORAH_DEBATE_DECKS, passages = CHUMASH_PASSAGES } = {}) {
    this.decks = decks;
    this.passages = passages;
    this.active = null;
  }

  open(deckId, player = null) {
    const deck = this.decks[deckId];
    if (!deck) throw new Error(`Unknown Torah debate deck: ${deckId}`);

    this.active = {
      deckId,
      title: deck.title,
      player,
      claimIndex: 0,
      claims: clone(deck.claims),
      rewards: clone(deck.rewards),
      log: [`Opened debate: ${deck.title}`],
      completed: false
    };

    return this.snapshot();
  }

  selectPassage(passageId) {
    if (!this.active) throw new Error('No active Torah debate.');
    const passage = this.passages[passageId];
    if (!passage) throw new Error(`Unknown passage: ${passageId}`);
    this.active.selectedPassageId = passageId;
    this.active.log.push(`Selected ${passage.ref}`);
    return this.snapshot();
  }

  playPirush(type) {
    if (!this.active) throw new Error('No active Torah debate.');
    const passage = this.passages[this.active.selectedPassageId];
    if (!passage?.pirushim?.[type]) throw new Error(`Passage cannot use pirush type: ${type}`);

    const claim = this.active.claims[this.active.claimIndex];
    const strength = resolveDebateType(type, claim.type);
    const damage = strength === 'strong' ? 12 : strength === 'weak' ? 4 : 7;
    claim.hp = Math.max(0, claim.hp - damage);
    this.active.log.push(`${type} hit ${claim.id} for ${damage} (${strength})`);

    if (claim.hp <= 0) this.active.claimIndex += 1;
    if (this.active.claimIndex >= this.active.claims.length) this.complete();

    return this.snapshot();
  }

  complete() {
    if (!this.active || this.active.completed) return this.snapshot();
    this.active.completed = true;
    this.active.log.push('Debate complete');

    const player = this.active.player;
    const rewards = this.active.rewards || {};
    if (player?.gainXp && rewards.xp) player.gainXp(rewards.xp);
    if (player?.inventory?.addItem && Array.isArray(rewards.items)) {
      rewards.items.forEach(itemId => player.inventory.addItem({ id: itemId, className: 'TorahPassage', name: itemId }, 1));
    }
    return this.snapshot();
  }

  close() {
    const ended = this.snapshot();
    this.active = null;
    return ended;
  }

  snapshot() {
    return this.active ? clone(this.active) : null;
  }
}

export default TorahDebateController;
