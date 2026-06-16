/** B"H — NPC interaction schema: marks who asks, teaches, sells, farms. */
export const NPC_INTERACTION_SCHEMA = Object.freeze({
  markerTypes: Object.freeze({
    quest: { glyph: '!', name: 'questMarker' },
    debate: { glyph: '📖', name: 'torahMarker' },
    shop: { glyph: '₪', name: 'shopMarker' },
    dialogue: { glyph: '…', name: 'dialogueMarker' },
    farm: { glyph: '🌾', name: 'farmMarker' },
    clothing: { glyph: '✦', name: 'clothingMarker' }
  }),
  requiredNpcFields: Object.freeze(['id', 'displayName', 'position', 'dialogueId', 'interactable', 'proximity']),
  missionFields: Object.freeze(['hasMission', 'missionId', 'missionData']),
  debateFields: Object.freeze(['hasTorahDebate', 'debateDeckId', 'opensBattleDebate'])
});

export const LEVEL_ONE_NPC_ROLES = Object.freeze({
  village_rebbe: { interactable: true, hasMission: true, missionId: 'first_siddur_pages', markerType: 'quest', dialogueId: 'village_rebbe_intro' },
  school_melamed: { interactable: true, hasTorahDebate: true, debateDeckId: 'chumash_bereishis_opening', markerType: 'debate', dialogueId: 'melamed_learning' },
  market_shliach: { interactable: true, markerType: 'shop', merchantId: 'market_shliach', dialogueId: 'market_shliach_shop' },
  village_tailor: { interactable: true, markerType: 'clothing', clothingId: 'blue_bekeshe', dialogueId: 'tailor_clothing' },
  village_farmer: { interactable: true, markerType: 'farm', farmId: 'village_wheat_patch', dialogueId: 'farmer_first_crop' }
});

export const EMERALD_NPC_ROLES = Object.freeze({
  npc_reb_yosei: { interactable: true, hasMission: true, missionId: 'gather_emerald_wood', markerType: 'quest', missionData: { itemId: 'Wood', amount: 6 } },
  npc_reb_shlomo: { interactable: true, hasTorahDebate: true, debateDeckId: 'chumash_bereishis_opening', opensBattleDebate: true, markerType: 'debate' },
  npc_reb_moshe: { interactable: true, markerType: 'dialogue' }
});
