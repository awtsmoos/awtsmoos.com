/** B"H * @module QuestIndex */
import { MidgameQuests } from './QuestIndexMidgame.js';
import { ShlichusQuests } from './QuestIndexShlichus.js';

const CoreQuests = {
  first_light: {
    title: 'First Light',
    giver: 'ג',
    start: 'The guide asks you to gather one hidden spark א near the village.',
    need: { spark: 1 },
    done: 'The first spark is bound into your vessel.'
  },
  sources: {
    title: 'Path of Sources',
    giver: 'ס',
    start: 'The sage asks you to win one debate and return with a clear source.',
    need: { debateWon: 1 },
    done: 'The sage accepts your source and grants sparks.'
  },
  market_words: {
    title: 'Weighed Words',
    giver: 'נ',
    start: 'The merchant scribe needs one lost parchment פ from the market roads.',
    need: { scroll: 1 },
    done: 'The scribe weighs the words and opens another trade of wisdom.'
  },
  garden_sparks: {
    title: 'Garden Sparks',
    giver: 'ש',
    start: 'The shepherd asks for three sparks א from the southern garden.',
    need: { spark: 3 },
    done: 'The garden sings; the sparks are gathered.'
  },
  river_crossing: {
    title: 'River Crossing',
    giver: 'י',
    start: 'The gatekeeper asks you to sweeten two wild musagim before crossing deeper.',
    need: { wildWon: 2 },
    done: 'The gatekeeper lets your path widen.'
  },
  cave_sod: {
    title: 'Cave of Sod',
    giver: 'ק',
    start: 'The mekubal asks you to bring one scroll פ from the cave of sod.',
    need: { scroll: 1 },
    done: 'The cave teaching is sealed in light.'
  },
  hidden_tzaddik: {
    title: 'Hidden Tzaddik',
    giver: 'צ',
    start: 'The tzaddik asks for five completed debates and a full heart.',
    need: { debateWon: 5 },
    done: 'A hidden blessing expands your max light.'
  }
};

export const QuestIndex = { ...CoreQuests, ...MidgameQuests, ...ShlichusQuests };
export const questById = (id) => QuestIndex[id] || null;
