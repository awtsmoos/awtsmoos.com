/** B"H * @module QuestIndexMidgame */
export const MidgameQuests = {
  eit_chamber: {
    title: 'Chamber of Eit',
    giver: 'ט',
    start: 'The timekeeper asks you to win three debates and bring one key ** from the chamber.',
    need: { debateWon: 3, key: 1 },
    done: 'The chamber of time opens its next moment.'
  },
  letter_forge: {
    title: 'Forge of Letters',
    giver: '֚',
    start: 'The smith needs two scrolls פ to forge a new garment of meaning.',
    need: { scroll: 2 },
    done: 'The letters glow as a new vessel is forged.'
  },
  niggun_bridge: {
    title: 'Niggun Bridge',
    giver: '֬',
    start: 'The wandering chassid asks you to sweeten two doubts and find three sparks.',
    need: { wildWon: 2, spark: 3 },
    done: 'The bridge sings; you can cross without fear.'
  }
};
