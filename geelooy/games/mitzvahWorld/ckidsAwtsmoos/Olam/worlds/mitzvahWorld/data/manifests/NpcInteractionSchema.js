/**
 * B"H
 * Chapter 4: Crowns Above The Speakers.
 *
 * The Awtsmoos hides a summons inside every human-facing point of dialogue.
 * A plain NPC is a sealed letter; a quest NPC bears an exclamation flame; a
 * Torah-debate NPC bears a luminous sefer mark. This schema lets tests and
 * builders agree before pixels are born.
 */

export const NPC_INTERACTION_SCHEMA = Object.freeze({
  markerTypes: Object.freeze({
    quest: { glyph: '!', name: 'exclamation questMarker missionMarker' },
    debate: { glyph: '📖', name: 'torah debateMarker' },
    shop: { glyph: '₪', name: 'shopMarker' },
    dialogue: { glyph: '…', name: 'dialogueMarker' }
  }),
  requiredNpcFields: Object.freeze([
    'id',
    'displayName',
    'position',
    'dialogues',
    'interactable',
    'proximity'
  ]),
  missionFields: Object.freeze(['hasMission', 'missionId', 'missionData']),
  debateFields: Object.freeze(['hasTorahDebate', 'debateDeckId', 'opensBattleDebate'])
});

export const EMERALD_NPC_ROLES = Object.freeze({
  npc_reb_yosei: Object.freeze({
    interactable: true,
    hasMission: true,
    missionId: 'gather_emerald_wood',
    markerType: 'quest',
    missionData: { itemId: 'Wood', amount: 6 }
  }),
  npc_reb_shlomo: Object.freeze({
    interactable: true,
    hasTorahDebate: true,
    debateDeckId: 'chumash_bereishis_opening',
    opensBattleDebate: true,
    markerType: 'debate'
  }),
  npc_reb_moshe: Object.freeze({
    interactable: true,
    markerType: 'dialogue'
  })
});
