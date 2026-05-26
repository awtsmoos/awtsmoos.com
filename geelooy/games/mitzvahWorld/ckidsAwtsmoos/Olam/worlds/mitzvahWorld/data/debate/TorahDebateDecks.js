/**
 * B"H
 * Emerald Torah debate vessels.
 * Every debate NPC carries a different spiritual style and claim pattern.
 */

const deck = (id, title, npcId, claims, rewards) => Object.freeze({
  id,
  title,
  npcId,
  opensBattleDebate: true,
  requiredPassages: ['bereishis_1_1'],
  claims: Object.freeze(claims.map(claim => Object.freeze(claim))),
  rewards: Object.freeze(rewards)
});

export const TORAH_DEBATE_DECKS = Object.freeze({
  chumash_bereishis_opening: deck(
    'chumash_bereishis_opening',
    'Opening Light Debate',
    'npc_reb_shlomo',
    [
      { id: 'claim_random_world', text: 'The world is random and without beginning.', type: 'sod', hp: 18 },
      { id: 'claim_no_action', text: 'Understanding does not need action.', type: 'remez', hp: 14 }
    ],
    { xp: 180, unlockPassages: ['shemos_20_2'], items: ['passage_shemos_20_2'] }
  ),
  elder_of_paths: deck(
    'elder_of_paths',
    'Paths of the Avos',
    'w3',
    [
      { id: 'claim_strength_only', text: 'Only strength survives.', type: 'drash', hp: 20 },
      { id: 'claim_memory_fades', text: 'Ancient teachings fade away.', type: 'pshat', hp: 16 }
    ],
    { xp: 210, items: ['simple_hammer'] }
  ),
  sparks_and_kindness: deck(
    'sparks_and_kindness',
    'Kindness Sparks Debate',
    'w4',
    [
      { id: 'claim_kindness_weakness', text: 'Kindness makes people weak.', type: 'remez', hp: 16 },
      { id: 'claim_hidden_sparks_fake', text: 'There are no hidden sparks in the world.', type: 'sod', hp: 22 }
    ],
    { xp: 240, items: ['small_lamp'] }
  ),
  forge_of_fire: deck(
    'forge_of_fire',
    'Forge of Fire Debate',
    'w5',
    [
      { id: 'claim_anger_power', text: 'Anger is the greatest power.', type: 'drash', hp: 24 },
      { id: 'claim_building_empty', text: 'Building homes has no spiritual value.', type: 'pshat', hp: 18 }
    ],
    { xp: 260, items: ['simple_hammer', 'small_lamp'] }
  )
});

export default TORAH_DEBATE_DECKS;
