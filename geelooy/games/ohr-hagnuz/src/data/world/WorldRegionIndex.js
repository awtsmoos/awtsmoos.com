/**
 * B"H
 * @module WorldRegionIndex
 * @description Canonical RPG world regions, act gates, gifts, skills, Musag ecology, and story purpose.
 *
 * Chapter 311: The world received a spine. The Awtsmoos creates every place
 * from nothing every instant, yet a player needs derech: Village to Garden,
 * Garden to Court, Court to Market, Market to Forgetting, Forgetting to
 * Declaration, Declaration to hidden Ohr. This index makes every region know
 * what it teaches, what it requires, and what it restores.
 */
const region = (id, name, act, role, requires, unlocks, skills, gifts, musag, objective) => ({ id, name, act, role, requires, unlocks, skills, gifts, musag, objective });

export const WorldRegions = {
  village: region('village', 'Village of Beginnings', 1, 'tutorial', [], ['garden'], ['Learning', 'Giving', 'Observation'], [], ['helem', 'nekudah', 'ahavah', 'anavah'], 'Learn movement, interaction, sefer reading, mitzvah, journal, and non-combat debate.'),
  garden: region('garden', 'Garden of Ungiven Things', 2, 'gift collection', ['first_light'], ['hall_separation', 'levi_road', 'poor_gate'], ['Giving', 'Observation'], ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim'], ['netinah', 'seder', 'terumah', 'bikkurim'], 'Collect entrusted gifts and learn they are not inventory trophies.'),
  hall_separation: region('hall_separation', 'Hall of Separation', 2, 'Terumah dungeon', ['garden_of_gifts'], ['levi_road'], ['Giving', 'Learning'], ['terumah'], ['bitul', 'gevurah', 'kedushah'], 'Restore Terumah to the Kohen and defeat pride.'),
  levi_road: region('levi_road', 'Road of Levi Songs', 2, 'Levi dungeon', ['terumah_to_kohen'], ['poor_gate'], ['Song', 'Pilgrimage'], ['maaser_rishon'], ['simcha', 'levi_song', 'shir'], 'Return Maaser Rishon through song.'),
  poor_gate: region('poor_gate', 'Poor Gate', 2, 'kindness dungeon', ['maaser_to_levi'], ['jerusalem'], ['Kindness', 'Giving'], ['maaser_ani'], ['peah', 'rachamim', 'ani_gate', 'tzedakah'], 'Feed the stranger, orphan, and widow before commerce can claim the story.'),
  jerusalem: region('jerusalem', 'Jerusalem Ascent', 3, 'pilgrimage ascent', ['maaser_ani_to_poor'], ['orchard', 'court'], ['Pilgrimage', 'Prayer'], ['maaser_sheni'], ['malchus', 'yerushalayim', 'aliyah', 'oneg', 'daat'], 'Resolve Maaser Sheni as sacred joy.'),
  orchard: region('orchard', 'Orchard of Seven Species', 3, 'Bikkurim agriculture', ['maaser_sheni_ascent'], ['court'], ['Agriculture', 'Observation'], ['bikkurim'], ['bikkurim', 'hakaras_hatov', 'pri_tov'], 'Return first fruit and restore flavor.'),
  court: region('court', 'Court of Rightful Receivers', 3, 'order validation', ['bikkurim_first_fruit'], ['market'], ['Debate', 'Declaration'], [], ['emes', 'mishpat', 'seder', 'hakraah'], 'Prove order matters: receivers are not interchangeable.'),
  market: region('market', 'Market of Exchange', 4, 'antagonist act', ['rightful_receivers'], ['forgetting'], ['Debate', 'Observation'], [], ['safek', 'merchant_logic', 'broken_contract', 'emes'], 'Defeat the Merchant of Exchange: not everything has a price.'),
  forgetting: region('forgetting', 'House of Forgetting', 5, 'major dungeon', ['not_selling_giving'], ['sea_fire', 'declaration'], ['Memory', 'Restoration'], [], ['shikcha', 'zechirah', 'forgotten_teacher', 'forgotten_student', 'flavorless_fruit'], 'Clear forgotten blessings, teachers, students, gifts, joy, and fruit.'),
  sea_fire: region('sea_fire', 'Sea of Fire', 5, 'purification gate', ['house_cleared'], ['declaration'], ['Prayer', 'Restoration'], [], ['yirah', 'kaparah', 'ohr_chozer'], 'Burn away false completion without destroying the player.'),
  declaration: region('declaration', 'Final Declaration', 6, 'ending', ['house_cleared'], ['hidden_orchard'], ['Declaration'], [], ['vidui', 'vidui_maaser'], 'Speak only what the action ledger can prove.'),
  hidden_orchard: region('hidden_orchard', 'Hidden Orchard', 7, 'postgame mastery', ['fruit_has_flavor'], ['ohr_realm'], ['Memory', 'Prayer', 'Declaration'], [], ['tzimtzum', 'deveikus'], 'Master hidden paths after the ending.'),
  ohr_realm: region('ohr_realm', 'Ohr HaGanuz Realm', 7, 'postgame completion', ['hidden_orchard'], [], ['Declaration', 'Restoration'], [], ['hidden_light', 'ohr_hagnuz', 'kesser'], 'Complete the Dex, skills, and hidden light board.')
};

export const regionById = id => WorldRegions[id] || null;
export const regionsByAct = act => Object.values(WorldRegions).filter(region => region.act === act);
export const regionForGift = giftId => Object.values(WorldRegions).find(region => region.gifts.includes(giftId)) || null;
export const nextRegionIds = id => regionById(id)?.unlocks || [];
export const regionObjective = id => regionById(id)?.objective || '';
