// B"H
/** NPCs now carry role metadata copied into userData by NivrahFactory. */
export const LEVEL_ONE_NPCS = Object.freeze([
  { id: 'village_rebbe', type: 'npcChossid', position: [-4, 0, -9], props: { displayName: 'The Village Rebbe', role: 'first_quest_giver', dialogueId: 'village_rebbe_intro', markerType: 'quest', shlichusId: 'first_siddur_pages', interactable: true } },
  { id: 'market_shliach', type: 'npcChossid', position: [16, 0, -17], props: { displayName: 'Market Shliach', role: 'merchant', dialogueId: 'market_shliach_shop', markerType: 'shop', merchantId: 'market_shliach', interactable: true } },
  { id: 'school_melamed', type: 'npcChossid', position: [-17, 0, -29], props: { displayName: 'Melamed', role: 'torah_teacher', dialogueId: 'melamed_learning', markerType: 'debate', debateDeckId: 'chumash_bereishis_opening', interactable: true } },
  { id: 'village_tailor', type: 'npcChossid', position: [10, 0, -12], props: { displayName: 'Village Tailor', role: 'clothing_switcher', dialogueId: 'tailor_clothing', markerType: 'dialogue', clothingId: 'blue_bekeshe', interactable: true } },
  { id: 'village_farmer', type: 'npcChossid', position: [-27, 0, -25], props: { displayName: 'Village Farmer', role: 'farming_teacher', dialogueId: 'farmer_first_crop', markerType: 'dialogue', farmId: 'village_wheat_patch', interactable: true } }
]);
