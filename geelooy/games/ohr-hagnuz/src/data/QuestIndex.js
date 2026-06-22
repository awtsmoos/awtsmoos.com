/**
 * B"H
 * @module QuestIndex
 * @description Unified quest spine with the Rambam gift campaign fused into the old route.
 */
import { MidgameQuests } from './QuestIndexMidgame.js';
import { ShlichusQuests } from './QuestIndexShlichus.js';
import { RambamQuests } from './QuestIndexRambam.js';

const q = (title, giver, act, order, start, need, done, extra = {}) => ({ title, giver, act, order, start, need, done, ...extra });
const CoreQuests = {
  first_light: q('First Light', 'ג', 1, 10, 'Talk to the Village Guide, gather one spark א, then walk east toward the Garden of Ungiven Things.', { spark: 1 }, 'The first spark is bound into your vessel.', { next: 'garden_of_gifts' }),
  child_spark: q('The Lost Child Spark', 'C', 1, 15, 'Find one more spark and learn bitul from smallness.', { spark: 2 }, 'Wonder becomes your first teacher.', { prereq: ['first_light'], next: 'elder_memory' }),
  elder_memory: q('Elder of Memory', 'E', 1, 18, 'Read one sefer so memory becomes a map.', { book: 1 }, 'Memory opens the way.', { prereq: ['child_spark'], next: 'village_minyan' }),
  village_minyan: q('Village Minyan', '⌂', 1, 20, 'Fulfill three mitzvah stations ✡.', { mitzvah: 3 }, 'The minyan is warmed.', { prereq: ['elder_memory'], next: 'sefarim_path' }),
  sefarim_path: q('Path of Sefarim', 'ב', 1, 30, 'Learn three sefarim in the Beis Midrash.', { book: 3 }, 'The bookshelf opens deeper learning.', { prereq: ['village_minyan'], next: 'sources' }),
  sources: q('Path of Sources', 'ס', 2, 40, 'Win one debate and return with a clear source.', { debateWon: 1 }, 'The sage accepts your source.', { prereq: ['sefarim_path'], next: 'market_words' }),
  market_words: q('Weighed Words', 'נ', 2, 50, 'Bring one parchment פ from market roads or purchase.', { scroll: 1 }, 'The scribe weighs the words.', { prereq: ['sources'], next: 'dancing_chossid' }),
  dancing_chossid: q('Dancing Chossid', 'D', 3, 54, 'Sweeten one wild musag.', { wildWon: 1 }, 'The first niggun enters your feet.', { prereq: ['market_words'], next: 'river_crossing' }),
  river_crossing: q('River Crossing', 'י', 3, 70, 'Sweeten two wild musagim before crossing deeper.', { wildWon: 2 }, 'The path widens.', { prereq: ['dancing_chossid'], next: 'academy_gate' }),
  academy_gate: q('Academy Gate', 'ר', 3, 80, 'Win two debates and gather five sparks.', { debateWon: 2, spark: 5 }, 'The academy gate recognizes you.', { prereq: ['river_crossing'], next: 'hidden_tzaddik' }),
  hidden_tzaddik: q('Hidden Tzaddik', 'צ', 5, 136, 'Bring seven completed debates and a listening heart.', { debateWon: 7 }, 'A hidden blessing expands your max light.', { prereq: ['academy_gate'], next: 'final_ohr_hagnuz' }),
  final_ohr_hagnuz: q('Ohr HaGnuz Revealed', 'ג', 5, 170, 'Complete the declaration in the House of Forgetting.', { debateWon: 8 }, 'The village becomes a vessel for the hidden light.', { prereq: ['fruit_has_flavor'], finale: true })
};
export const QuestIndex = { ...MidgameQuests, ...ShlichusQuests, ...CoreQuests, ...RambamQuests };
export const questById = id => QuestIndex[id] || null;
export const orderedQuestIds = () => Object.keys(QuestIndex).sort((a, b) => (QuestIndex[a].order || 999) - (QuestIndex[b].order || 999));
