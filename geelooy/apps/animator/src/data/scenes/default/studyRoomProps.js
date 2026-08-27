// B"H

/**
 * The table becomes the small cliff of the story: manuscript, spill, candle,
 * book, and cups. Nothing complex. One risky object. One clear danger.
 */
const prop = (id, type, x, y, size, color, layer = 'front') => ({
  id,
  type,
  x,
  y,
  size,
  color,
  visible: true,
  layer
});

export const STUDY_ROOM_PROPS = [
  prop('table_book', 'book', -18, -104, 40, '#1c2c4a'),
  prop('sealed_manuscript', 'box', 34, -112, 28, '#f2d184'),
  prop('empty_manuscript_mark', 'box', 4, -114, 22, '#d8b46a'),
  prop('spilled_tea', 'ball', 68, -108, 18, '#9c6a34'),
  prop('soup_bowl', 'soup', -56, -96, 46, '#f8fbff'),
  prop('tea_cup_left', 'cup', -98, -103, 18, '#f8f1e5'),
  prop('tea_cup_right', 'cup', 92, -103, 18, '#f8f1e5'),
  prop('bread_plate', 'plate', 42, -96, 38, '#f0c36a'),
  prop('apple_table', 'apple', -16, -112, 15, '#df3e35'),
  prop('ink_bottle', 'ball', -78, -112, 8, '#1b1b25'),
  prop('candle_warning', 'sparkle', 2, -124, 10, '#fff176'),
  prop('crumb_1', 'ball', 24, -110, 3, '#e6bd71'),
  prop('crumb_2', 'ball', 35, -103, 3, '#f0cf8a')
];
