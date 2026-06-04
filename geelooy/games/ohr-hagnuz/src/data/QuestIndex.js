/**
 * B"H
 * @module QuestIndex
 * @description Full storyline quest spine for every major NPC.
 *
 * Chapter 187: The NPCs stopped being scenery and became chapters. The
 * Awtsmoos has no body and no form, yet the player's path now moves through a
 * real cast: village wonder, Mishnah order, Gemara argument, Chassidus warmth,
 * Kabbalah silence, seven middos, shadow return, and Adam HaRishon.
 */
import { MidgameQuests } from './QuestIndexMidgame.js';
import { ShlichusQuests } from './QuestIndexShlichus.js';

const q = (title, giver, act, order, start, need, done, extra = {}) => ({ title, giver, act, order, start, need, done, ...extra });

const CoreQuests = {
  first_light: q('First Light', 'ג', 1, 10, 'Talk to the Village Guide, gather one spark א, and learn that the world is made of letters.', { spark: 1 }, 'The first spark is bound into your vessel.', { next: 'child_spark' }),
  child_spark: q('The Lost Child Spark', 'C', 1, 15, 'The Small Child asks you to find one more spark and learn bitul from smallness.', { spark: 2 }, 'The child smiles. Wonder becomes your first teacher.', { prereq: ['first_light'], next: 'elder_memory' }),
  elder_memory: q('Elder of Memory', 'E', 1, 18, 'The Elder Woman asks you to read one sefer so memory becomes a map.', { book: 1 }, 'Memory opens the way to communal service.', { prereq: ['child_spark'], next: 'village_minyan' }),
  village_minyan: q('Village Minyan', '⌂', 1, 20, 'Fulfill three mitzvah stations ✡ and return with a warm heart.', { mitzvah: 3 }, 'The minyan is warmed. Your light can carry more shlichus.', { prereq: ['elder_memory'], next: 'sefarim_path' }),
  sefarim_path: q('Path of Sefarim', 'ב', 1, 30, 'Learn three sefarim in the Beis Midrash.', { book: 3 }, 'The bookshelf opens into a deeper chamber of learning.', { prereq: ['village_minyan'], next: 'mishnah_counter' }),

  mishnah_counter: q('The Counter Counts Form', 'O', 2, 34, 'The Counter asks for two sparks and two books: light must accept structure.', { spark: 2, book: 2 }, 'Mishnah order begins to appear in the road.', { prereq: ['sefarim_path'], next: 'repeater_mishnah' }),
  repeater_mishnah: q('The Repeater', 'P', 2, 36, 'The Repeater asks you to read three books and survive repetition without boredom.', { book: 3 }, 'Repetition becomes a channel, not a prison.', { prereq: ['mishnah_counter'], next: 'forgotten_student' }),
  forgotten_student: q('Forgotten Student', 'F', 2, 38, 'Recover one parchment פ and help a student remember the order.', { scroll: 1 }, 'Forgetting becomes deeper engraving.', { prereq: ['repeater_mishnah'], next: 'sources' }),
  sources: q('Path of Sources', 'ס', 2, 40, 'The Sage asks you to win one debate and return with a clear source.', { debateWon: 1 }, 'The sage accepts your source and marks the road east.', { prereq: ['forgotten_student'], next: 'asker_questions' }),
  asker_questions: q('The Asker', 'Q', 2, 44, 'Meet the Asker and win one debate without hating the question.', { debateWon: 1 }, 'The question becomes a ladder.', { prereq: ['sources'], next: 'challenger_proof' }),
  challenger_proof: q('The Challenger', 'X', 2, 46, 'The Challenger demands two victories before your proof can stand.', { debateWon: 2 }, 'Contradiction sharpens your source.', { prereq: ['asker_questions'], next: 'proof_bringer' }),
  proof_bringer: q('Proof Bringer', 'U', 2, 48, 'Bind books and debates: bring three books and two victories.', { book: 3, debateWon: 2 }, 'Proof becomes a bridge instead of a weapon.', { prereq: ['challenger_proof'], next: 'tangent_return' }),
  tangent_return: q('Tangent Walker', 'G', 2, 49, 'Gather three sparks while returning to the main point.', { spark: 3 }, 'The tangent returns with its spark.', { prereq: ['proof_bringer'], next: 'market_words' }),
  market_words: q('Weighed Words', 'נ', 2, 50, 'The Merchant Scribe needs one parchment פ from market roads or purchase.', { scroll: 1 }, 'The scribe weighs the words and opens another trade of wisdom.', { prereq: ['tangent_return'], next: 'dancing_chossid' }),

  dancing_chossid: q('Dancing Chossid', 'D', 3, 54, 'Learn joy by sweetening one wild musag.', { wildWon: 1 }, 'The first niggun enters your feet.', { prereq: ['market_words'], next: 'broken_chossid' }),
  broken_chossid: q('Broken Chossid', 'H', 3, 56, 'Bring three sparks to a chossid whose warmth went quiet.', { spark: 3 }, 'Simcha returns with depth.', { prereq: ['dancing_chossid'], next: 'farbrengen_circle' }),
  farbrengen_circle: q('Farbrengen Circle', 'A', 3, 58, 'Bring three debates and three books into the circle.', { debateWon: 3, book: 3 }, 'The routes begin to speak to each other.', { prereq: ['broken_chossid'], next: 'garden_sparks' }),
  garden_sparks: q('Garden Sparks', 'ש', 3, 60, 'The Garden Shepherd asks for three sparks א from the southern garden and orchard.', { spark: 3 }, 'The garden sings; the sparks are gathered.', { prereq: ['farbrengen_circle'], next: 'river_crossing' }),
  river_crossing: q('River Crossing', 'י', 3, 70, 'The Gatekeeper asks you to sweeten two wild musagim before crossing deeper.', { wildWon: 2 }, 'The gatekeeper lets your path widen.', { prereq: ['garden_sparks'], next: 'academy_gate' }),
  academy_gate: q('Academy Gate', 'ר', 3, 80, 'The Trainer sends you to the upper academy after two debate victories and five sparks.', { debateWon: 2, spark: 5 }, 'The academy gate recognizes your prepared mind.', { prereq: ['river_crossing'], next: 'eit_chamber' }),
  eit_chamber: q('Chamber of Eit', 'ט', 3, 90, 'The Timekeeper asks for three debates and one key *.', { debateWon: 3, key: 1 }, 'The chamber of time opens its next moment.', { prereq: ['academy_gate'], next: 'letter_forge' }),

  letter_forge: q('Forge of Letters', 'ך', 4, 100, 'The Blacksmith needs two scrolls פ to forge a new garment of meaning.', { scroll: 2 }, 'Letters glow as a new vessel is forged.', { prereq: ['eit_chamber'], next: 'niggun_bridge' }),
  niggun_bridge: q('Niggun Bridge', '֬', 4, 110, 'The Wandering Chassid asks you to sweeten two doubts and find three sparks.', { wildWon: 2, spark: 3 }, 'The bridge sings; you can cross without fear.', { prereq: ['letter_forge'], next: 'silent_mekubal' }),
  silent_mekubal: q('Silent Mekubal', 'M', 4, 114, 'Stand before silence with one key and four debates.', { key: 1, debateWon: 4 }, 'Silence makes room for the kav.', { prereq: ['niggun_bridge'], next: 'guardian_sod' }),
  guardian_sod: q('Guardian of Sod', 'V', 4, 116, 'The Guardian asks for humility: four debates and two wild sweetenings.', { debateWon: 4, wildWon: 2 }, 'The secret accepts your approach.', { prereq: ['silent_mekubal'], next: 'dream_walker' }),
  dream_walker: q('Dream Walker', 'Y', 4, 118, 'Find one chest ת and notice the same guide appearing in impossible places.', { chest: 1 }, 'The map folds, but your journal remembers.', { prereq: ['guardian_sod'], next: 'cave_sod' }),
  cave_sod: q('Cave of Sod', 'ק', 4, 120, 'Bring one scroll פ from the cave and win with Kabbalah once.', { scroll: 1, debateWon: 4 }, 'The cave teaching is sealed in returning light.', { prereq: ['dream_walker'], next: 'endless_giver' }),

  endless_giver: q('Endless Giver', 'L', 5, 122, 'Chesed asks for three mitzvos and restraint.', { mitzvah: 3 }, 'Giving learns to leave the receiver standing.', { prereq: ['cave_sod'], next: 'judge_gevurah' }),
  judge_gevurah: q('The Judge', 'J', 5, 124, 'Gevurah asks for four debates without cruelty.', { debateWon: 4 }, 'Judgment becomes protection.', { prereq: ['endless_giver'], next: 'reconciler_tiferes' }),
  reconciler_tiferes: q('The Reconciler', 'Z', 5, 126, 'Tiferes asks for five debates and two sweetened musagim.', { debateWon: 5, wildWon: 2 }, 'Opposing voices become harmony.', { prereq: ['judge_gevurah'], next: 'stubborn_netzach' }),
  stubborn_netzach: q('The Stubborn One', 'K', 5, 128, 'Netzach asks for six debates and refusal to quit.', { debateWon: 6 }, 'Persistence loses its ego.', { prereq: ['reconciler_tiferes'], next: 'humble_hod' }),
  humble_hod: q('The Humble One', 'I', 5, 130, 'Hod asks for six victories and gratitude.', { debateWon: 6 }, 'Praise passes through instead of stopping.', { prereq: ['stubborn_netzach'], next: 'connector_yesod' }),
  connector_yesod: q('The Connector', 'B', 5, 132, 'Yesod asks for three books and seven debates to bind the roads.', { book: 3, debateWon: 7 }, 'The hidden thread appears under the map.', { prereq: ['humble_hod'], next: 'listener_malchus' }),
  listener_malchus: q('The Listener', 'R', 5, 134, 'Malchus asks you to receive: seven debates and a quiet journal.', { debateWon: 7 }, 'The vessel learns that receiving is also avodah.', { prereq: ['connector_yesod'], next: 'hidden_tzaddik' }),
  hidden_tzaddik: q('Hidden Tzaddik', 'צ', 5, 136, 'The hidden tzaddik asks for seven completed debates and a listening heart.', { debateWon: 7 }, 'A hidden blessing expands your max light.', { prereq: ['listener_malchus'], next: 'shadow_scholar' }),
  shadow_scholar: q('Shadow Scholar', '?', 5, 138, 'Face the self that stopped learning: eight debates and two scrolls.', { debateWon: 8, scroll: 2 }, 'The shadow becomes a doorway, not an enemy.', { prereq: ['hidden_tzaddik'], next: 'adam_harishon' }),
  adam_harishon: q('Adam HaRishon', '@', 5, 139, 'Meet the structure of souls after ten sparks, eight debates, and three sefarim.', { spark: 10, debateWon: 8, book: 3 }, 'Every NPC is revealed as a limb of the same great soul.', { prereq: ['shadow_scholar'], next: 'final_ohr_hagnuz' }),
  final_ohr_hagnuz: q('Ohr HaGnuz Revealed', 'ג', 5, 140, 'Return to the Village Guide with ten sparks, eight debates, three sefarim, and a completed minyan.', { spark: 10, debateWon: 8, book: 3, mitzvah: 3 }, 'The village becomes a vessel for the hidden light.', { prereq: ['adam_harishon'], finale: true })
};

export const QuestIndex = { ...MidgameQuests, ...ShlichusQuests, ...CoreQuests };
export const questById = id => QuestIndex[id] || null;
export const orderedQuestIds = () => Object.keys(QuestIndex).sort((a, b) => (QuestIndex[a].order || 999) - (QuestIndex[b].order || 999));
