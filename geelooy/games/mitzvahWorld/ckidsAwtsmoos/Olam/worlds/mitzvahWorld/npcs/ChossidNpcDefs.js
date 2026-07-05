/**
 * B"H
 * @file ChossidNpcDefs.js
 * @description
 * Visible chossid NPC placements. Every one uses the same Chossid GLB model,
 * but each receives distinct dialogue and runtime metadata.
 */

export const CHOSSID_NPC_DEFS = Object.freeze([
  Object.freeze({
    id: "npc_reb_avraham",
    displayName: "Reb Avraham",
    role: "field teacher",
    questId: "reb_avraham_deer_tokens",
    position: [2.4, 0, -3.5],
    rotation: [0, 0.25, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Avraham.",
      "I have a gentle field lesson: bring back 2 deer antler tokens.",
      "The first avodah is chesed. Help one person and the void begins to glow.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_jill",
    displayName: "Jill",
    role: "kid helper",
    questId: "jill_gifts",
    position: [-2.7, 0, -4.2],
    rotation: [0, -0.3, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Jill.",
      "Oh no! I misplaced 3 little gifts. Can you bring them back?",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_miriam",
    displayName: "Miriam",
    role: "craft helper",
    questId: "miriam_feathers",
    position: [4.8, 0, 2.8],
    rotation: [0, 2.1, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Miriam.",
      "Can you find 4 feathers for the craft table?",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_moshe",
    displayName: "Reb Moshe",
    position: [-5.2, 0, 3.1],
    rotation: [0, 1.25, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Moshe.",
      "Every quest is a shlichus. Check on the houses; every door matters.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_aaron",
    displayName: "Reb Aharon",
    position: [10, 0, -8],
    rotation: [0, -0.7, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Aharon.",
      "Love peace and pursue peace. Bring lonely sparks back together.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_david",
    displayName: "Reb David",
    position: [-10, 0, -8],
    rotation: [0, 0.7, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb David.",
      "A niggun can be a weapon when the world forgets its song.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_shlomo",
    displayName: "Reb Shlomo",
    position: [12, 0, 8],
    rotation: [0, 2.6, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Shlomo.",
      "Wisdom builds cities. Generated models are vessels for higher purpose.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_eliyahu",
    displayName: "Reb Eliyahu",
    position: [-12, 0, 8],
    rotation: [0, -2.6, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Eliyahu.",
      "When you see a shadow, prepare a mitzvah. That is battle strategy.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_meir",
    displayName: "Reb Meir",
    position: [18, 0, 0],
    rotation: [0, -1.5, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Meir.",
      "The trees now have substance. Look for branches, not paper.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_shimon",
    displayName: "Reb Shimon",
    position: [-18, 0, 0],
    rotation: [0, 1.5, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Shimon.",
      "There are hidden enemies near the village. Refine them into sparks.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_yosei",
    displayName: "Reb Yosei",
    position: [0, 0, 18],
    rotation: [0, 3.14, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Yosei.",
      "Dialogue is not decoration. It is how the world gives missions.",
      "May your next mitzvah reveal more light in this world."
    ]
  }),

  Object.freeze({
    id: "npc_reb_judah",
    displayName: "Reb Judah",
    position: [0, 0, -18],
    rotation: [0, 0, 0],
    scale: 1.05,
    hp: 100,
    faction: "chossidim",
    isFriendly: true,
    proximity: 8,
    dialogues: [
      "B\\\"H! I am Reb Judah.",
      "If the Emerald Void feels empty, fill it with Torah, people, and action.",
      "May your next mitzvah reveal more light in this world."
    ]
  })
]);
