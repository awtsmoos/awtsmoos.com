/** B"H * @module BookIndex */
export const BookIndex = {
  mishnahSeeds: {
    id: 'mishnahSeeds',
    title: 'Mishnah Seeds',
    glyph: 'ב',
    skill: 'learning',
    exp: 18,
    stat: 'chochmah',
    power: 2,
    text: 'The order of the Mishnah makes your answer sharper.'
  },
  TanyaFlame: {
    id: 'TanyaFlame',
    title: 'Tanya Flame',
    glyph: 'ע',
    skill: 'hitbonenus',
    exp: 22,
    stat: 'daat',
    power: 2,
    text: 'A hidden flame of daat enters your words.'
  },
  ZoharLamp: {
    id: 'ZoharLamp',
    title: 'Zohar Lamp',
    glyph: 'ל',
    skill: 'learning',
    exp: 28,
    stat: 'chochmah',
    power: 3,
    text: 'The lamp of Zohar widens the pattern of the sugya.'
  }
};

export const bookByGlyph = (glyph) => Object.values(BookIndex).find(book => book.glyph === glyph) || null;
export const bookById = (id) => BookIndex[id] || null;
