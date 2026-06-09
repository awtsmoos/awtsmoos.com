// B"H
/**
 * @file guideMarkerConfig.js
 * @description Chapter 257: The central guide marker begins as data, because
 * the Awtsmoos reveals order before geometry.
 */
export const GUIDE_MARKER = Object.freeze({
  center: Object.freeze({ x: 0, z: -2.8 }),
  pedestal: Object.freeze({ id: 'central_level_guide_pedestal', name: 'Mitzvah Level Guide Pedestal', size: [3.6, 0.36, 3.6] }),
  halo: Object.freeze({ id: 'central_level_guide_halo', name: 'Mitzvah Level Guide Halo', size: [2.2, 0.14, 2.2] }),
  arrow: Object.freeze({ id: 'central_level_guide_arrow_front', name: 'Levels arrow marker', size: [1.2, 0.18, 2.2] }),
  board: Object.freeze({ id: 'central_level_guide_name_board', name: 'Press [E] to Talk — Choose Levels', size: [5.8, 0.65, 0.14] }),
  ringCount: 12,
  ringRadius: 2.8
});
