/**
 * B"H
 * @module GiftLawIndex
 * @description The concrete Rambam spine: gifts are not loot; they are entrusted routes.
 *
 * Chapter 302: The orchard testified. The Awtsmoos has no body and no form,
 * yet every apple of meaning trembled with an address. Terumah rose to the
 * Kohen, song returned to the Levi, hunger found mercy, joy climbed to
 * Jerusalem, and first fruit remembered gratitude. This file makes that story
 * playable: each gift has a region, receiver, skill pressure, Musag pressure,
 * consequence, reward, and declaration line.
 */
export const GiftOrder = ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim'];

const chain = (region, dungeon, musag, skills, reward, consequence) => ({ region, dungeon, musag, skills, reward, consequence });

export const GiftLawIndex = {
  terumah: {
    id: 'terumah', name: 'Terumah', glyph: '▲', order: 10, act: 2, receiver: 'kohen', counter: 'terumahGiven',
    line: 'I separated the first lifted portion and gave it to the Kohen.', source: 'Bikkurim 1: the covenant of gifts to Aaron.',
    start: 'Find the lifted portion in the Garden of Ungiven Things after learning that not every first thing belongs to the finder.',
    wrong: 'Terumah cannot remain in your house while you speak of completion.',
    chain: chain('Garden of Ungiven Things', 'Hall of Separation', ['Bitul', 'Seder', 'Kedushah'], ['Giving', 'Learning'], 'Kohen blessing remembers the opening words of declaration.', 'Pride fog thickens and objective markers dim until the Kohen receives it.')
  },
  maaser_rishon: {
    id: 'maaser_rishon', name: 'Maaser Rishon', glyph: '◆', order: 20, act: 2, receiver: 'levi', counter: 'leviGiven',
    line: 'I gave it to the Levite.', source: 'Maaser Sheini 11:12-13.',
    start: 'Carry the tenth that lost its song toward the Road of Levi Songs.',
    wrong: 'The song-road is blocked until the Levi receives his portion.',
    chain: chain('Road of Levi Songs', 'Bridge of Broken Niggunim', ['Simcha', 'Niggun', 'Seder'], ['Song', 'Pilgrimage'], 'Levi teaches a battle-response that weakens Transaction enemies.', 'Noise encounters replace song encounters until the Levi is restored.')
  },
  maaser_ani: {
    id: 'maaser_ani', name: 'Maaser Ani', glyph: '◇', order: 30, act: 2, receiver: 'poor', counter: 'poorGiven',
    line: 'I gave it to the stranger, orphan, and widow.', source: 'Maaser Sheini 11:12.',
    start: 'Follow the empty bowls to the Poor Gate and learn that compassion is not optional content.',
    wrong: 'A gate with a poor person outside cannot call itself complete.',
    chain: chain('Poor Gate', 'House of Empty Tables', ['Rachamim', 'Chesed', 'Peah'], ['Kindness', 'Giving'], 'The poor bless the player with joyShared, unlocking warmer endings.', 'Indifference shadows make prices rise in the Market of Exchange.')
  },
  maaser_sheni: {
    id: 'maaser_sheni', name: 'Maaser Sheni', glyph: '●', order: 40, act: 3, receiver: 'jerusalem', counter: 'secondResolved',
    line: 'I removed the holy from the house.', source: 'Maaser Sheini 11:7-14.',
    start: 'Bring holy enjoyment upward: it must be eaten in purpose, redeemed in truth, or removed before declaration.',
    wrong: 'Second tithe must be brought, redeemed, eaten, or removed before declaration.',
    chain: chain('Jerusalem Ascent', 'Steps of Sacred Joy', ['Malchus', 'Simcha', 'Daat'], ['Pilgrimage', 'Prayer'], 'Jerusalem opens the Court of Rightful Receivers.', 'Utility arguments from the Merchant become stronger until sacred joy is restored.')
  },
  bikkurim: {
    id: 'bikkurim', name: 'Bikkurim', glyph: '◈', order: 50, act: 3, receiver: 'jerusalem', counter: 'bikkurimGiven',
    line: 'I brought the first fruit to the place of choice.', source: 'Bikkurim 1.',
    start: 'Grow or recover first fruit from the Orchard of Seven Species and carry it with gratitude.',
    wrong: 'First fruit is not a trophy. It rises to Jerusalem.',
    chain: chain('Orchard of Seven Species', 'Flavorless Fruit Grove', ['Bikkurim', 'HakarasHatov', 'Emes'], ['Agriculture', 'Observation'], 'Flavor returns to fruit and final declaration can speak gratitude.', 'Fruit becomes flavorless and healing items lose strength until gratitude returns.')
  }
};

export const giftById = id => GiftLawIndex[id] || null;
export const orderedGifts = () => GiftOrder.map(id => GiftLawIndex[id]);
export const giftObjective = id => {
  const gift = giftById(id);
  return gift ? `${gift.name}: ${gift.start} Receiver: ${gift.receiver}. Region: ${gift.chain.region}.` : '';
};
export const giftCompletionCount = ledger => GiftOrder.filter(id => (ledger?.given?.[id] || 0) > 0).length;
