// B"H

const p = (id, type, x, y, size, color, layer = 'mid', extra = {}) => ({
  id, type, x, y, size, color, layer, visible: true, ...extra
});

export const PROFESSIONAL_PROPS = [
  p('hero_lantern', 'sparkle', -46, -116, 34, '#ffd95c', 'hero', { storyRole: 'emotional_object', glow: true }),
  p('lantern_core', 'ball', -44, -119, 16, '#76e4ff', 'hero', { action: 'pulse' }),
  p('workbench', 'box', -22, -100, 86, '#8a542f', 'mid'),
  p('coil_wire', 'rope', -92, -108, 22, '#d6a24a', 'front'),
  p('gear_large', 'gear', -2, -112, 28, '#b8c0cc', 'front'),
  p('gear_tiny', 'gear', 24, -118, 14, '#d7dde7', 'front'),
  p('mayor_scroll', 'book', 132, -104, 34, '#f5d487', 'front', { gag: 'unrolls_too_far' }),
  p('mentor_teacup', 'cup', 64, -106, 18, '#fff4df', 'front'),
  p('blueprint', 'book', -72, -122, 42, '#2d5ea8', 'front'),
  p('loose_screw_1', 'ball', -18, -126, 4, '#d8dee9', 'front'),
  p('loose_screw_2', 'ball', 10, -123, 4, '#d8dee9', 'front'),
  p('magic_spark_1', 'sparkle', -32, -146, 9, '#fff176', 'fx'),
  p('magic_spark_2', 'sparkle', -62, -138, 7, '#b3f5ff', 'fx'),
  p('pip_shadow', 'ball', -24, -76, 24, 'rgba(0,0,0,.2)', 'shadow'),
  p('foreground_flower_left', 'ball', -240, 40, 14, '#ff78b7', 'front'),
  p('foreground_flower_right', 'ball', 260, 36, 14, '#ffe66d', 'front')
];
