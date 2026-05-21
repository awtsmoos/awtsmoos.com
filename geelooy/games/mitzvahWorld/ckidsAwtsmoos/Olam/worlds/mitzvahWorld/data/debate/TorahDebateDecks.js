/**
 * B"H
 * Chapter 9: The Claim Rose Like Smoke.
 *
 * Each debate deck is a small battlefield. The NPC speaks a claim; the player
 * answers with a passage and one of the four PaRDeS approaches. Rewards unlock
 * further light without requiring a giant battle class yet.
 */

export const TORAH_DEBATE_DECKS = Object.freeze({
  chumash_bereishis_opening: Object.freeze({
    id: 'chumash_bereishis_opening',
    title: 'Opening Light Debate',
    npcId: 'npc_reb_shlomo',
    opensBattleDebate: true,
    requiredPassages: ['bereishis_1_1'],
    claims: Object.freeze([
      Object.freeze({ id: 'claim_random_world', text: 'The world is random and without beginning.', type: 'sod', hp: 18 }),
      Object.freeze({ id: 'claim_no_action', text: 'Understanding does not need action.', type: 'remez', hp: 14 })
    ]),
    rewards: Object.freeze({ xp: 180, unlockPassages: ['shemos_20_2'], items: ['passage_shemos_20_2'] })
  })
});

export default TORAH_DEBATE_DECKS;
