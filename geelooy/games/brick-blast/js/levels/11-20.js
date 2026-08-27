// B"H

/**
 * The second chapter in the chronicle of worlds, levels 11-20.
 * @type {import('../level-loader.js').Level[]}
 */
export const levels = [
  {
    id: 11,
    name: "Channels",
    static: true,
    layout: [
      [100, {h: 999, t: 'portal_a'}, 100, null, 100, {h: 999, t: 'portal_b'}, 100, null],
      [110, null, 110, null, 110, null, 110, null],
      [120, null, 120, null, 120, null, 120, null],
      [130, null, 130, null, 130, null, 130, null],
      [140, null, 140, null, 140, null, 140, null],
      [150, null, 150, null, 150, null, 150, null],
    ]
  },
  {
    id: 12,
    name: "Serpent",
    static: true,
    layout: [
        [160, 160, 160, null, null, null, null, null],
        [null, null, 160, null, null, null, null, null],
        [null, null, 160, 170, 170, 170, null, null],
        [null, null, null, null, null, 170, null, null],
        [null, null, null, null, null, 170, 180, 180],
    ]
  },
  {
    id: 13,
    name: "Cross",
    static: true,
    layout: [
      [null, null, 200, 200, 200, 200, null, null],
      [null, null, 200, null, null, 200, null, null],
      [220, 220, 220, null, null, 220, 220, 220],
      [null, null, 200, null, null, 200, null, null],
      [null, null, 200, 200, 200, 200, null, null],
    ]
  },
  {
    id: 14,
    name: "Hourglass",
    static: true,
    layout: [
        [250, 250, 250, 250, 250, 250, 250, 250],
        [null, 240, 240, 240, 240, 240, 240, null],
        [null, null, 230, 230, 230, 230, null, null],
        [null, null, null, 220, 220, null, null, null],
        [null, null, 230, 230, 230, 230, null, null],
        [null, 240, 240, 240, 240, 240, 240, null],
        [250, 250, 250, 250, 250, 250, 250, 250],
    ]
  },
  {
    id: 15,
    name: "Rainfall",
    static: false,
    layout: [
      [30, null, 50, null, 20, null, 40, null],
    ]
  },
  {
    id: 16,
    name: "Twin Peaks",
    static: true,
    layout: [
        [null, 300, 300, null, null, 300, 300, null],
        [null, 280, 280, null, null, 280, 280, null],
        [null, 260, 260, null, null, 260, 260, null],
    ]
  },
  {
    id: 17,
    name: "Maze",
    static: true,
    layout: [
        [350, 350, 350, 350, 350, null, 350, 350],
        [350, null, null, null, 350, null, 350, null],
        [350, null, 350, 350, 350, 350, 350, null],
        [350, null, 350, null, null, null, null, null],
        [350, 350, 350, 350, 350, 350, 350, 350],
    ]
  },
  {
    id: 18,
    name: "Pillars",
    static: false,
    layout: [
        [80, null, null, 80, 80, null, null, 80],
    ]
  },
  {
    id: 19,
    name: "Citadel",
    static: true,
    layout: [
        [400, null, 400, null, 400, null, 400, null],
        [null, 400, null, 400, null, 400, null, 400],
        [450, 450, 450, 450, 450, 450, 450, 450],
        [null, null, 500, 500, 500, 500, null, null],
    ]
  },
  {
    id: 20,
    name: "Final Exam",
    static: false,
    layout: [
        [100, 100, 100, 100, 100, 100, 100, 100],
        [null, null, null, null, null, null, null, null],
        [120, 120, 120, 120, 120, 120, 120, 120],
    ]
  },
];