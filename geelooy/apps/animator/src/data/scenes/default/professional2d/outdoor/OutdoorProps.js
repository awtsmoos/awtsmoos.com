// B"H

const prop = (id, type, x, y, size, color, layer = 'mid', extra = {}) => ({ id, type, x, y, size, color, layer, visible: true, ...extra });

export const OUTDOOR_PROPS = [
  prop('storm_lantern', 'sparkle', -74, -116, 38, '#ffd35d', 'hero', { storyRole: 'emotional_object', glow: true, rainShield: true }),
  prop('blue_storm_core', 'ball', -74, -120, 15, '#9ee8ff', 'hero', { action: 'flicker' }),
  prop('paper_child_lamp', 'sparkle', 220, -98, 22, '#fff1b1', 'hero', { storyRole: 'silent_mirror' }),
  prop('wet_plaza_puddle_big', 'ellipse', -64, -66, 56, 'rgba(120,180,220,.36)', 'shadow', { reflection: true }),
  prop('wet_plaza_puddle_child', 'ellipse', 214, -72, 38, 'rgba(130,190,230,.3)', 'shadow', { reflection: true }),
  prop('wind_map_tube', 'box', 36, -110, 34, '#caa268', 'front'),
  prop('soaked_schedule_board', 'book', 150, -116, 40, '#ffe0a2', 'front', { gag: 'paper_slaps_face' }),
  prop('goat_bell', 'ball', -42, -92, 8, '#ffd35b', 'front', { soundCue: 'tiny_jingle' }),
  prop('wrong_cord', 'rope', -58, -104, 28, '#d6a24a', 'front', { gag: 'chewed_circuit' }),
  prop('market_awning_left', 'flag', -238, -142, 58, '#a8425d', 'back'),
  prop('market_awning_right', 'flag', 256, -150, 62, '#315f7f', 'back'),
  prop('wet_flag_1', 'flag', -178, -178, 28, '#e6b84b', 'mid'),
  prop('wet_flag_2', 'flag', 102, -186, 28, '#d95d5d', 'mid'),
  prop('falling_leaf_1', 'leaf', -210, -164, 10, '#8fc45b', 'fx'),
  prop('falling_leaf_2', 'leaf', 86, -184, 9, '#c2a45b', 'fx'),
  prop('rain_splash_1', 'sparkle', -84, -72, 8, '#bdefff', 'fx'),
  prop('rain_splash_2', 'sparkle', 222, -76, 7, '#bdefff', 'fx'),
  prop('lantern_gold_bloom', 'sparkle', -72, -132, 46, '#ffd978', 'fx', { finalBloom: true }),
  prop('lightning_sheet', 'sparkle', 0, -230, 80, '#e9f1ff', 'fx', { timed: [2200, 9200] }),
  prop('foreground_reeds', 'grass', -280, 22, 48, '#244332', 'front', { wind: true })
];
