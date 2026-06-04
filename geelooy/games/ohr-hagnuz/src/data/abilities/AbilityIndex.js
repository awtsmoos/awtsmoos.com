/**
 * B"H
 * @module AbilityIndex
 * @description Nested Torah battle tree.
 *
 * Chapter 138: The strike became a sugya. The Awtsmoos has no body and no form,
 * yet the player now descends through vessels: category, sefer-route, chapter,
 * quote. The final quote is the move; the earlier cards are doors of learning.
 */
const q = (id, text, bonus = 0) => ({ id, text, bonus });
const ch = (id, title, quotes) => ({ id, title, quotes });
const route = (id, title, chapters) => ({ id, title, chapters });

export const AbilityIndex = {
  mishnahClarity: {
    id: 'mishnahClarity', name: 'Mishnah Clarity', category: 'Mishnah', power: 18, scale: 'chochmah',
    text: 'You clarify the case with precise Mishnah.',
    routes: [
      route('avos', 'Pirkei Avos', [
        ch('avos1', 'Chapter 1', [q('judge', 'Judge every person favorably.'), q('teacher', 'Make for yourself a teacher.', 3)]),
        ch('avos2', 'Chapter 2', [q('path', 'See the straight path before you.', 5), q('mitzvah', 'One mitzvah draws another mitzvah.', 7)])
      ]),
      route('berakhot', 'Berakhot', [ch('ber1', 'Chapter 1', [q('source', 'Blessing reveals Source in the meal.', 4), q('dawn', 'The dawn turns doubt into service.', 6)])])
    ]
  },
  chassidusWarmth: {
    id: 'chassidusWarmth', name: 'Chassidus Warmth', category: 'Chassidus', power: 14, scale: 'daat',
    text: 'You reveal the inner spark behind the question.',
    routes: [
      route('tanya', 'Tanya', [
        ch('tanya1', 'Chapter 1', [q('twoSouls', 'Two voices wrestle; one Essence creates both.'), q('animalSoul', 'The animal soul can become a servant.', 4)]),
        ch('tanya2', 'Chapter 2', [q('chelek', 'The soul is a literal portion from above.', 6), q('root', 'A child of wisdom remembers the Source.', 8)])
      ]),
      route('hitbonenus', 'Hitbonenus', [ch('his1', 'Contemplation', [q('fire', 'Think deeply until the heart catches fire.', 5), q('near', 'The Infinite is near inside every breath.', 7)])])
    ]
  },
  kabbalahLight: {
    id: 'kabbalahLight', name: 'Kabbalah Light', category: 'Kabbalah', power: 24, scale: 'chochmah',
    text: 'You draw a higher pattern into the argument.',
    routes: [
      route('sefirot', 'Ten Sefiros', [ch('ten1', 'Chochmah-Binah-Daat', [q('flash', 'Wisdom flashes; understanding builds.', 0), q('daat', 'Daat binds the light to life.', 5)])]),
      route('tzimtzum', 'Tzimtzum', [ch('tz1', 'Concealment', [q('vessel', 'Concealment becomes a vessel for visible light.', 5), q('line', 'A thin line enters the emptied place.', 8)])]),
      route('ohrChozer', 'Ohr Chozer', [ch('oc1', 'Return', [q('below', 'Returning light rises from the finite vessel.', 9), q('crown', 'From below, the crown awakens.', 12)])])
    ]
  },
  niggunJoy: {
    id: 'niggunJoy', name: 'Niggun Joy', category: 'Niggun', power: 10, heal: 10, scale: 'binah',
    text: 'A niggun sweetens the dinim and restores light.',
    routes: [
      route('simcha', 'Simcha Niggun', [ch('joy1', 'Joy Gate', [q('wall', 'Joy breaks the wall without breaking the world.'), q('dance', 'The feet know what the mind forgot.', 4)])]),
      route('hisorerus', 'Hisorerus Niggun', [ch('cry1', 'Awakening', [q('wordless', 'A wordless cry climbs above speech.', 3), q('return', 'The heart returns before the mouth speaks.', 5)])])
    ]
  }
};

export const BaseAbilityIds = ['mishnahClarity', 'chassidusWarmth', 'kabbalahLight', 'niggunJoy'];
