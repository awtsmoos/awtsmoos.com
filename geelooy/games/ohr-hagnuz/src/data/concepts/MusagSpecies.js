/**
 * B"H
 * @module MusagSpecies
 * @description Launch MusagDex species: discovery, sweetening, mastery, evolution, and route identity.
 *
 * Chapter 305: Concepts stopped being dictionary words. The Awtsmoos creates
 * worlds from ayin every instant, and each Musag now walks like a living spark:
 * seen in a region, sweetened in a debate, mastered through practice, evolved
 * by skill, and taught back to the player as a usable way of restoring order.
 */
const m = (id, name, element, route, region, weakness, evolvesTo, teaching, skill) => ({
  id, name, element, route, region, weakness, evolvesTo, teaching, skill,
  seen: 0, sweetened: 0, mastered: false,
  ranks: ['Seen', 'Sweetened', 'Mastered'],
  requirement: `${skill} level and ${route} route practice`,
  reward: `${name} teaching enters the Journal and strengthens ${skill}.`
});

export const MusagSpecies = {
  helem: m('helem', 'Helem', 'Concealment', 'Kabbalah', 'Village of Beginnings', 'Observation', 'tzimtzum', 'Not every hidden thing is absent.', 'Memory'),
  tzimtzum: m('tzimtzum', 'Tzimtzum', 'Concealment', 'Kabbalah', 'Hidden Orchard', 'Prayer', 'ohr_chozer', 'A boundary can reveal purpose.', 'Observation'),
  ohr_chozer: m('ohr_chozer', 'Ohr Chozer', 'Revelation', 'Kabbalah', 'Sea of Fire', 'Humility', null, 'Returned light rises higher.', 'Prayer'),
  safek: m('safek', 'Safek', 'Question', 'Gemara', 'Market of Exchange', 'Mishnah', 'hakraah', 'Doubt asks for honest structure.', 'Debate'),
  hakraah: m('hakraah', 'Hakraah', 'Truth', 'Gemara', 'Court of Rightful Receivers', 'Chassidus', null, 'Resolution must be earned.', 'Learning'),
  nekudah: m('nekudah', 'Nekudah', 'Point', 'Chassidus', 'Village of Beginnings', 'Expansion', 'hisbonenus', 'A tiny point can contain a world.', 'Observation'),
  hisbonenus: m('hisbonenus', 'Hisbonenus', 'Wisdom', 'Chassidus', 'House of Forgetting', 'Noise', null, 'Think until the hidden point blooms.', 'Learning'),
  simcha: m('simcha', 'Simcha', 'Joy', 'Niggun', 'Road of Levi Songs', 'Indifference', 'oneg', 'Joy breaks locked roads.', 'Song'),
  oneg: m('oneg', 'Oneg', 'Joy', 'Niggun', 'Jerusalem Ascent', 'Utility', null, 'Pleasure becomes holy when it has an address.', 'Pilgrimage'),
  netinah: m('netinah', 'Netinah', 'Giving', 'Rambam', 'Garden of Ungiven Things', 'Transaction', 'tzedakah', 'Giving restores relationship.', 'Giving'),
  tzedakah: m('tzedakah', 'Tzedakah', 'Giving', 'Rambam', 'Poor Gate', 'Cruelty', null, 'Justice and kindness are one gate.', 'Kindness'),
  seder: m('seder', 'Seder', 'Order', 'Mishnah', 'Court of Rightful Receivers', 'Chaos', 'mishpat', 'Order lets kindness land.', 'Learning'),
  mishpat: m('mishpat', 'Mishpat', 'Order', 'Mishnah', 'Court of Rightful Receivers', 'Bribery', null, 'Judgment protects the gift.', 'Debate'),
  bikkurim: m('bikkurim', 'Bikkurim', 'Gratitude', 'Rambam', 'Orchard of Seven Species', 'Entitlement', 'hakaras_hatov', 'First fruit remembers the Source.', 'Agriculture'),
  hakaras_hatov: m('hakaras_hatov', 'Hakaras HaTov', 'Gratitude', 'Chassidus', 'Jerusalem Ascent', 'Forgetfulness', null, 'Gratitude gives flavor back.', 'Prayer'),
  shikcha: m('shikcha', 'Shikcha', 'Forgetting', 'Mishnah', 'House of Forgetting', 'Memory', 'zechirah', 'Forgotten gifts still call.', 'Memory'),
  zechirah: m('zechirah', 'Zechirah', 'Memory', 'Mishnah', 'House of Forgetting', 'Despair', null, 'Memory is a form of return.', 'Memory'),
  peah: m('peah', 'Peah', 'Giving', 'Rambam', 'Poor Gate', 'Ownership', 'rachamim', 'Leave a corner for another.', 'Kindness'),
  rachamim: m('rachamim', 'Rachamim', 'Mercy', 'Chassidus', 'Poor Gate', 'Cold Logic', null, 'Mercy sees the person before the rule.', 'Kindness'),
  teshuvah: m('teshuvah', 'Teshuvah', 'Return', 'Rambam', 'House of Forgetting', 'Hopelessness', 'kaparah', 'The path back is part of creation.', 'Restoration'),
  kaparah: m('kaparah', 'Kaparah', 'Return', 'Rambam', 'Sea of Fire', 'Pride', null, 'Repair can burn without destroying.', 'Prayer'),
  bitul: m('bitul', 'Bitul', 'Humility', 'Chassidus', 'Hall of Separation', 'Ego', 'anavah', 'Make room for the truth.', 'Giving'),
  anavah: m('anavah', 'Anavah', 'Humility', 'Mishnah', 'Village of Beginnings', 'Honor', null, 'Humility carries greatness safely.', 'Observation'),
  emes: m('emes', 'Emes', 'Truth', 'Mishnah', 'Court of Rightful Receivers', 'Exchange', 'yosher', 'Truth does not bargain with falsehood.', 'Debate'),
  yosher: m('yosher', 'Yosher', 'Truth', 'Mishnah', 'Jerusalem Ascent', 'Crookedness', null, 'Straightness is a road.', 'Pilgrimage'),
  ahavah: m('ahavah', 'Ahavah', 'Love', 'Chassidus', 'Village of Beginnings', 'Fearful Distance', 'chesed', 'Love moves toward the other.', 'Kindness'),
  chesed: m('chesed', 'Chesed', 'Love', 'Chassidus', 'Poor Gate', 'Withholding', null, 'Overflow must become action.', 'Giving'),
  yirah: m('yirah', 'Yirah', 'Awe', 'Kabbalah', 'Sea of Fire', 'Mockery', 'gevurah', 'Awe guards holiness.', 'Prayer'),
  gevurah: m('gevurah', 'Gevurah', 'Awe', 'Kabbalah', 'Hall of Separation', 'Excess', null, 'Strength knows where to stop.', 'Debate'),
  daat: m('daat', 'Daat', 'Connection', 'Chassidus', 'Jerusalem Ascent', 'Distraction', 'deveikus', 'Knowledge must attach to life.', 'Learning'),
  deveikus: m('deveikus', 'Deveikus', 'Connection', 'Chassidus', 'Hidden Orchard', 'Fragmentation', null, 'Connection is the hidden orchard gate.', 'Prayer'),
  malchus: m('malchus', 'Malchus', 'Kingship', 'Kabbalah', 'Jerusalem Ascent', 'Anarchy', 'kesser', 'Receive in order to reveal.', 'Pilgrimage'),
  kesser: m('kesser', 'Kesser', 'Crown', 'Kabbalah', 'Ohr HaGanuz Realm', 'Selfhood', null, 'The crown belongs above the head.', 'Declaration'),
  terumah: m('terumah', 'Terumah', 'Gift', 'Rambam', 'Garden of Ungiven Things', 'Pride', 'kedushah', 'Lift the first portion.', 'Giving'),
  kedushah: m('kedushah', 'Kedushah', 'Gift', 'Rambam', 'Hall of Separation', 'Mixture', null, 'Holiness means set apart for purpose.', 'Learning'),
  levi_song: m('levi_song', 'Levi Song', 'Song', 'Niggun', 'Road of Levi Songs', 'Noise', 'shir', 'Song carries the tithe.', 'Song'),
  shir: m('shir', 'Shir', 'Song', 'Niggun', 'Road of Levi Songs', 'Silence of Despair', null, 'A song can transport a gift.', 'Song'),
  ani_gate: m('ani_gate', 'Ani Gate', 'Mercy', 'Rambam', 'Poor Gate', 'Indifference', 'rachamim', 'The poor gate is part of the palace.', 'Kindness'),
  yerushalayim: m('yerushalayim', 'Yerushalayim', 'Joy', 'Rambam', 'Jerusalem Ascent', 'Utility', 'aliyah', 'Joy ascends when it is shared before G-d.', 'Pilgrimage'),
  aliyah: m('aliyah', 'Aliyah', 'Ascent', 'Rambam', 'Jerusalem Ascent', 'Heaviness', null, 'Going up changes what eating means.', 'Pilgrimage'),
  merchant_logic: m('merchant_logic', 'Merchant Logic', 'Transaction', 'Gemara', 'Market of Exchange', 'Netinah', 'broken_contract', 'Not every exchange is a covenant.', 'Debate'),
  broken_contract: m('broken_contract', 'Broken Contract', 'Transaction', 'Gemara', 'Market of Exchange', 'Emes', null, 'A contract without truth collapses.', 'Debate'),
  forgotten_teacher: m('forgotten_teacher', 'Forgotten Teacher', 'Memory', 'Mishnah', 'House of Forgetting', 'Gratitude', 'mesorah', 'A teacher forgotten still teaches silence.', 'Memory'),
  mesorah: m('mesorah', 'Mesorah', 'Memory', 'Mishnah', 'House of Forgetting', 'Novelty Worship', null, 'Received wisdom is a living road.', 'Learning'),
  forgotten_student: m('forgotten_student', 'Forgotten Student', 'Memory', 'Chassidus', 'House of Forgetting', 'Impatience', 'chinuch', 'A student is a future world.', 'Kindness'),
  chinuch: m('chinuch', 'Chinuch', 'Memory', 'Chassidus', 'House of Forgetting', 'Neglect', null, 'Education restores tomorrow.', 'Learning'),
  flavorless_fruit: m('flavorless_fruit', 'Flavorless Fruit', 'Gratitude', 'Rambam', 'House of Forgetting', 'Bikkurim', 'pri_tov', 'Fruit without thanks loses taste.', 'Agriculture'),
  pri_tov: m('pri_tov', 'Pri Tov', 'Gratitude', 'Rambam', 'Orchard of Seven Species', 'Waste', null, 'Good fruit remembers its firstness.', 'Agriculture'),
  hidden_light: m('hidden_light', 'Hidden Light', 'Revelation', 'Kabbalah', 'Ohr HaGanuz Realm', 'Coarseness', 'ohr_hagnuz', 'Hidden light appears when vessels align.', 'Declaration'),
  ohr_hagnuz: m('ohr_hagnuz', 'Ohr HaGanuz', 'Revelation', 'Kabbalah', 'Ohr HaGanuz Realm', 'Final Forgetting', null, 'The end reveals the beginning.', 'Declaration'),
  vidui: m('vidui', 'Vidui', 'Declaration', 'Rambam', 'Final Declaration', 'False Completion', 'vidui_maaser', 'Confession is truthful alignment.', 'Declaration'),
  vidui_maaser: m('vidui_maaser', 'Vidui Maaser', 'Declaration', 'Rambam', 'Final Declaration', 'Missing Gifts', null, 'I did not forget; I restored.', 'Declaration')
};

export const musagById = id => MusagSpecies[id] || null;
export const allMusagSpecies = () => Object.values(MusagSpecies);
export const musagByRegion = region => allMusagSpecies().filter(musag => musag.region === region);
export const musagEvolutionPairs = () => allMusagSpecies().filter(musag => musag.evolvesTo).map(musag => [musag.id, musag.evolvesTo]);

export const speciesByEncounter = encounter => {
  const raw = String(encounter?.speciesId || encounter?.id || encounter?.name || '').toLowerCase();
  const id = raw.replace(/^wild musag:\s*/i, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return MusagSpecies[id] || allMusagSpecies().find(musag => musag.name.toLowerCase() === raw || musag.id === id) || null;
};
