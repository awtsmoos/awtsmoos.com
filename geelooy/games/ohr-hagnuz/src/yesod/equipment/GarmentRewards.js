/** B"H
 * @module GarmentRewards
 * Which quests or long-play milestones unlock garments.
 */
export const QuestGarmentRewards = {
  first_light: 'WHITE_LINEN',
  sources: 'GOLD_ROBE',
  market_words: 'DARK_ROBE',
  garden_sparks: 'GARMENT_KITTEL',
  river_crossing: 'MANTLE_NEHI',
  cave_sod: 'TZITZIT_LIGHT',
  hidden_tzaddik: 'GARMENT_GARTEL',
  eit_chamber: 'CLOAK_HITBONENUS',
  letter_forge: 'DARK_ROBE',
  niggun_bridge: 'GARMENT_GARTEL'
};

export const MilestoneGarmentRewards = {
  5: 'CLOAK_HITBONENUS',
  12: 'MANTLE_NEHI',
  25: 'CROWN_THREAD'
};

export const garmentRewardForQuest = (id) => QuestGarmentRewards[id] || null;
export const garmentRewardForDebateMilestone = (count) => MilestoneGarmentRewards[count] || null;
