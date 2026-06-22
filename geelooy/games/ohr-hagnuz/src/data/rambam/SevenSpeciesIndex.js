/** B"H @module SevenSpeciesIndex */
export const SevenSpeciesIndex = {
  wheat: { id: 'wheat', glyph: 'ח', name: 'Wheat of Clarity', gift: 'bikkurim', teaching: 'Bread begins when scattered kernels accept form.' },
  barley: { id: 'barley', glyph: 'ש', name: 'Barley of Humility', gift: 'maaser_ani', teaching: 'Animal strength becomes holy when shared.' },
  grape: { id: 'grape', glyph: 'ג', name: 'Grape of Joy', gift: 'maaser_sheni', teaching: 'Joy must be brought to the holy city.' },
  fig: { id: 'fig', glyph: 'ת', name: 'Fig of Memory', gift: 'terumah', teaching: 'Sweetness ripens slowly and remembers the tree.' },
  pomegranate: { id: 'pomegranate', glyph: 'ר', name: 'Pomegranate of Many Deeds', gift: 'maaser_rishon', teaching: 'Many seeds become one crown.' },
  olive: { id: 'olive', glyph: 'ז', name: 'Olive of Pressure-Light', gift: 'terumah', teaching: 'Crushing can reveal oil.' },
  date: { id: 'date', glyph: 'ד', name: 'Date of Upright Sweetness', gift: 'bikkurim', teaching: 'Sweetness stands tall when rooted.' }
};
export const speciesByGlyph = glyph => Object.values(SevenSpeciesIndex).find(s => s.glyph === glyph) || null;
