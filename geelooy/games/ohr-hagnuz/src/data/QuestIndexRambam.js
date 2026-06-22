/**
 * B"H
 * @module QuestIndexRambam
 * @description The real beginning-middle-end spine: gifts, receivers, declaration.
 */
const q = (title, giver, act, order, start, need, done, extra = {}) => ({ title, giver, act, order, start, need, done, ...extra });
export const RambamQuests = {
  garden_of_gifts: q('Garden of Ungiven Things', 'ג', 1, 12, 'Walk east. Collect Terumah ▲, First Tithe ◆, Poor Tithe ◇, Second Tithe ●, and Bikkurim ◈.', { terumah: 1, maaser_rishon: 1, maaser_ani: 1, maaser_sheni: 1, bikkurim: 1 }, 'The house is full of entrusted holiness.', { next: 'rightful_receivers' }),
  rightful_receivers: q('Rightful Receivers', '♔', 2, 52, 'Give the gifts in order: Kohen ♔, Levi ♬, Poor ♙, Jerusalem ⌁, Sea of Fire ♨.', { terumahGiven: 1, leviGiven: 1, poorGiven: 1, secondResolved: 1, bikkurimGiven: 1 }, 'Each gift found its address.', { prereq: ['garden_of_gifts'], next: 'not_selling_giving' }),
  not_selling_giving: q('Giving, Not Selling', 'נ', 3, 88, 'Defeat the Merchant of Exchange and prove holiness is given, not traded.', { debateWon: 1 }, 'The market admits that gifts cannot be reduced to price.', { prereq: ['rightful_receivers'], next: 'house_cleared' }),
  house_cleared: q('I Removed the Holy from the House', 'ג', 4, 142, 'Enter the House of Forgetting and unlock every declaration line.', { terumahGiven: 1, leviGiven: 1, poorGiven: 1, secondResolved: 1, bikkurimGiven: 1 }, 'The house no longer imprisons holiness.', { prereq: ['not_selling_giving'], next: 'fruit_has_flavor' }),
  fruit_has_flavor: q('Fruit Has Flavor Again', '⌁', 5, 160, 'Speak the final declaration when all six lines are awake.', { terumahGiven: 1, leviGiven: 1, poorGiven: 1, secondResolved: 1, bikkurimGiven: 1 }, 'Ohr HaGnuz is revealed as the world seen in rightful order.', { prereq: ['house_cleared'], finale: true })
};
