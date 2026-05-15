/**
 * B\"H
 * @file QuestChains.js
 * @description
 * Multi-stage RPG quest chains for Mitzvah World.
 */

export const QUEST_CHAINS = [
  {
    id: "bearer_of_sparks",
    name: "Bearer of Sparks",
    recommendedLevel: 1,
    stages: [
      {
        id: "apple_brocha",
        type: "collect",
        requirements: { apple_red: 1 },
        rewards: { exp: 25, coins: 10, items: ["challah_small"] }
      },
      {
        id: "challah_delivery",
        type: "delivery",
        rewards: { exp: 40, coins: 20 }
      },
      {
        id: "defeat_doubt",
        type: "battle",
        target: "klipah_doubt",
        rewards: { exp: 80, coins: 40, title: "Bearer of Sparks" }
      }
    ]
  },
  {
    id: "paths_of_binah",
    name: "Paths of Binah",
    recommendedLevel: 10,
    stages: [
      {
        id: "scholar_debate",
        type: "dialogue",
        rewards: { exp: 100, unlockSkill: "tehillim_pulse" }
      },
      {
        id: "sky_ascent",
        type: "exploration",
        rewards: { exp: 150, coins: 100 }
      },
      {
        id: "seraph_of_awe",
        type: "boss_battle",
        target: "klipah_pride",
        rewards: { exp: 400, items: ["staff_miracles"] }
      }
    ]
  }
];
