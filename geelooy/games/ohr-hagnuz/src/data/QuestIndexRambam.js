/**
 * B"H
 * @module QuestIndexRambam
 * @description Concrete beginning-middle-end quest spine for restoring rightful place.
 *
 * Chapter 303: The quest log stopped whispering fog. The Awtsmoos renews the
 * world every instant; therefore each quest now says exactly what is broken,
 * where to go, what mechanic is tested, what unlocks, and why the declaration
 * cannot lie.
 */
const q = (title, giver, act, order, start, need, done, extra = {}) => ({ title, giver, act, order, start, need, done, ...extra });

export const RambamQuests = {
  garden_of_gifts: q(
    'Garden of Ungiven Things', 'ג', 1, 12,
    'Travel east from the Village after talk, spark, sefer, mitzvah, and journal. Enter the Garden and collect the five entrusted gifts: ▲ ◆ ◇ ● ◈.',
    { spark: 1, book: 1, mitzvah: 1, terumah: 1, maaser_rishon: 1, maaser_ani: 1, maaser_sheni: 1, bikkurim: 1 },
    'The house is full of entrusted holiness; now it must not remain yours.',
    { region: 'Garden of Ungiven Things', mechanic: 'onboarding-to-restoration', next: 'terumah_to_kohen', unlocks: ['Gift Tracker', 'Declaration Tracker'] }
  ),
  terumah_to_kohen: q(
    'Terumah Rises to the Kohen', '♔', 2, 20,
    'Bring Terumah ▲ to the Kohen ♔. Learn separation: firstness is not possession.',
    { terumahGiven: 1 },
    'The Kohen receives the lifted portion and the first declaration line wakes.',
    { region: 'Hall of Separation', mechanic: 'right-receiver', prereq: ['garden_of_gifts'], next: 'maaser_to_levi', skill: 'Giving', musag: ['Bitul', 'Seder'] }
  ),
  maaser_to_levi: q(
    'The Levi Receives Song', '♬', 2, 30,
    'Carry Maaser Rishon ◆ along the Road of Levi Songs. Win or avoid Noise by restoring rhythm.',
    { leviGiven: 1 },
    'The Levi receives his portion; song becomes a usable path, not background flavor.',
    { region: 'Road of Levi Songs', mechanic: 'song-skill-unlock', prereq: ['terumah_to_kohen'], next: 'maaser_ani_to_poor', skill: 'Song', musag: ['Niggun', 'Simcha'] }
  ),
  maaser_ani_to_poor: q(
    'The Poor Gate Opens', '♙', 2, 40,
    'Bring Maaser Ani ◇ to the poor at the gate before bargaining with the Merchant.',
    { poorGiven: 1 },
    'The hungry are remembered; joy is shared and the market loses its first lie.',
    { region: 'Poor Gate', mechanic: 'kindness-check', prereq: ['maaser_to_levi'], next: 'maaser_sheni_ascent', skill: 'Kindness', musag: ['Rachamim', 'Peah'] }
  ),
  maaser_sheni_ascent: q(
    'Sacred Joy Ascends', '⌁', 3, 50,
    'Resolve Maaser Sheni ● through Jerusalem: bring, redeem, eat with purpose, or remove the holy from the house.',
    { secondResolved: 1 },
    'Jerusalem receives holy enjoyment and opens the court where order matters.',
    { region: 'Jerusalem Ascent', mechanic: 'pilgrimage-choice', prereq: ['maaser_ani_to_poor'], next: 'bikkurim_first_fruit', skill: 'Pilgrimage', musag: ['Malchus', 'Daat'] }
  ),
  bikkurim_first_fruit: q(
    'First Fruit Remembers Gratitude', '⌁', 3, 60,
    'Recover or grow Bikkurim ◈ in the Orchard of Seven Species and bring it upward with gratitude.',
    { bikkurimGiven: 1 },
    'The first fruit stops being a trophy. Flavor returns to fruit.',
    { region: 'Orchard of Seven Species', mechanic: 'agriculture-gratitude', prereq: ['maaser_sheni_ascent'], next: 'rightful_receivers', skill: 'Agriculture', musag: ['Bikkurim', 'HakarasHatov'] }
  ),
  rightful_receivers: q(
    'Court of Rightful Receivers', '♔', 3, 72,
    'Stand before Kohen, Levi, Poor, Jerusalem, and the Sea of Fire. Prove that the order of giving was not random.',
    { terumahGiven: 1, leviGiven: 1, poorGiven: 1, secondResolved: 1, bikkurimGiven: 1 },
    'Each gift found its address. The court opens the Market of Exchange as a test, not a shopping trip.',
    { region: 'Court of Rightful Receivers', mechanic: 'order-validation', prereq: ['bikkurim_first_fruit'], next: 'not_selling_giving', unlocks: ['Merchant of Exchange'] }
  ),
  not_selling_giving: q(
    'Giving, Not Selling', 'נ', 4, 88,
    'Defeat the Merchant of Exchange. He says everything has a price; answer with gifts that cannot be sold.',
    { debateWon: 1 },
    'The market admits that holiness cannot be reduced to transaction.',
    { region: 'Market of Exchange', mechanic: 'boss-debate', prereq: ['rightful_receivers'], next: 'house_cleared', enemy: 'merchant_of_exchange' }
  ),
  house_cleared: q(
    'I Removed the Holy from the House', 'ג', 5, 142,
    'Enter the House of Forgetting. Clear Forgotten Blessings, Teachers, Students, Gifts, Joy, and Flavorless Fruit.',
    { terumahGiven: 1, leviGiven: 1, poorGiven: 1, secondResolved: 1, bikkurimGiven: 1 },
    'The house no longer imprisons holiness. The final declaration can begin checking truth.',
    { region: 'House of Forgetting', mechanic: 'multi-room-dungeon', prereq: ['not_selling_giving'], next: 'fruit_has_flavor', rooms: ['Blessings', 'Teachers', 'Students', 'Gifts', 'Joy', 'Flavor'] }
  ),
  fruit_has_flavor: q(
    'Final Declaration', '⌁', 6, 170,
    'Speak the final declaration only after the gifts, memories, Musagim, skills, and choices agree with your actions.',
    { terumahGiven: 1, leviGiven: 1, poorGiven: 1, secondResolved: 1, bikkurimGiven: 1 },
    'Ohr HaGnuz is revealed as the world seen in rightful order.',
    { region: 'Final Declaration', mechanic: 'action-generated-ending', prereq: ['house_cleared'], finale: true }
  )
};
