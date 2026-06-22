/**
 * B"H
 * @module GiftLawIndex
 * @description The halachic rule-spine for Ohr HaGnuz: I Did Not Forget.
 *
 * Chapter 204: The world stopped being loot and became entrusted holiness. The
 * Awtsmoos has no body and no form, yet produce, sparks, scrolls, first fruits,
 * and poor gifts now carry an address. The player does not merely collect; the
 * player returns each entrusted light to its proper receiver, in order.
 */
export const GiftOrder = ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim'];

export const GiftLawIndex = {
  terumah: {
    id: 'terumah', name: 'Terumah', glyph: '▲', order: 10, receiver: 'kohen', counter: 'terumahGiven',
    line: 'I separated the first lifted portion and gave it to the Kohen.',
    source: 'Bikkurim 1: the covenant of gifts to Aaron.',
    wrong: 'Terumah cannot remain in your house while you speak of completion.'
  },
  maaser_rishon: {
    id: 'maaser_rishon', name: 'First Tithe', glyph: '◆', order: 20, receiver: 'levi', counter: 'leviGiven',
    line: 'I gave it to the Levite.', source: 'Maaser Sheini 11:12-13.',
    wrong: 'The song-road is blocked until the Levi receives his portion.'
  },
  maaser_ani: {
    id: 'maaser_ani', name: 'Poor Tithe', glyph: '◇', order: 30, receiver: 'poor', counter: 'poorGiven',
    line: 'I gave it to the stranger, orphan, and widow.', source: 'Maaser Sheini 11:12.',
    wrong: 'A gate with a poor person outside cannot call itself complete.'
  },
  maaser_sheni: {
    id: 'maaser_sheni', name: 'Second Tithe', glyph: '●', order: 40, receiver: 'jerusalem', counter: 'secondResolved',
    line: 'I removed the holy from the house.', source: 'Maaser Sheini 11:7-14.',
    wrong: 'Second tithe must be brought, redeemed, eaten, or removed before declaration.'
  },
  bikkurim: {
    id: 'bikkurim', name: 'First Fruits', glyph: '◈', order: 50, receiver: 'jerusalem', counter: 'bikkurimGiven',
    line: 'I brought the first fruit to the place of choice.', source: 'Bikkurim 1.',
    wrong: 'First fruit is not a trophy. It rises to Jerusalem.'
  }
};

export const giftById = id => GiftLawIndex[id] || null;
export const orderedGifts = () => GiftOrder.map(id => GiftLawIndex[id]);
