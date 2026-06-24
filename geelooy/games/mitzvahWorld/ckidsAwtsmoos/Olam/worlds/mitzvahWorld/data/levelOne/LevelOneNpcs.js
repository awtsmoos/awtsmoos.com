// B"H
/** NPCs carry role metadata copied into userData by NivrahFactory. */
export const LEVEL_ONE_NPCS = Object.freeze([
  { id:'village_rebbe', type:'npcChossid', position:[-4,0,-9], props:{ displayName:'The Village Rebbe', role:'first_quest_giver', dialogueId:'village_rebbe_intro', markerType:'quest', shlichusId:'first_siddur_pages', interactable:true } },
  { id:'market_shliach', type:'npcChossid', position:[16,0,-17], props:{ displayName:'Market Shliach', role:'merchant', dialogueId:'market_shliach_shop', markerType:'shop', merchantId:'market_shliach', interactable:true } },
  { id:'school_melamed', type:'npcChossid', position:[-17,0,-29], props:{ displayName:'Melamed', role:'torah_teacher', dialogueId:'melamed_learning', markerType:'debate', debateDeckId:'chumash_bereishis_opening', interactable:true } },
  { id:'village_tailor', type:'npcChossid', position:[10,0,-12], props:{ displayName:'Village Tailor', role:'clothing_switcher', dialogueId:'tailor_clothing', markerType:'dialogue', clothingId:'blue_bekeshe', interactable:true } },
  { id:'village_farmer', type:'npcChossid', position:[-27,0,-25], props:{ displayName:'Village Farmer', role:'farming_teacher', dialogueId:'farmer_first_crop', markerType:'dialogue', farmId:'village_wheat_patch', interactable:true } },
  { id:'lava_trial_guide', type:'npcChossid', position:[23,0,12], props:{ displayName:'Reb Eish, Lava Trial Guide', role:'lava_trial_master', dialogueId:'lava_trial_guide', markerType:'lava_trial', shlichusId:'lava_trials_of_courage', interactable:true, opensMenu:'lavaMenu', portalId:'nearby_lava_trials' } },
  { id:'forest_keeper', type:'npcChossid', position:[-38,0,36], props:{ displayName:'Forest Keeper', role:'ecology_teacher', dialogueId:'forest_keeper', markerType:'dialogue', shlichusId:'living_forest_proof', interactable:true } },
  { id:'village_carpenter', type:'npcChossid', position:[31,0,-8], props:{ displayName:'Village Carpenter', role:'door_house_master', dialogueId:'village_carpenter', markerType:'dialogue', shlichusId:'house_door_reality', interactable:true } },
  { id:'animal_guardian', type:'npcChossid', position:[-12,0,34], props:{ displayName:'Animal Guardian', role:'wildlife_memory_keeper', dialogueId:'animal_guardian', markerType:'dialogue', shlichusId:'animal_care_and_guardians', interactable:true } }
]);
