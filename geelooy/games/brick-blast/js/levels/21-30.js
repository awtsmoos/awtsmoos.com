// B"H

/**
 * The third chapter in the chronicle of worlds, levels 21-30.
 * @type {import('../level-loader.js').Level[]}
 */
export const levels = [
  {
    id: 21,
    name: "Honeycomb",
    static: true,
    layout: [
      [null, 200, 200, null, null, 200, 200, null],
      [220, null, null, 220, 220, null, null, 220],
      [null, 240, 240, null, null, 240, 240, null],
      [260, null, null, 260, 260, null, null, 260],
      [null, 280, 280, null, null, 280, 280, null],
    ]
  },
  {
    id: 22,
    name: "Stalactites",
    static: true,
    layout: [
        [300, null, null, 300, null, null, 300, null],
        [null, 320, null, 320, null, 320, null, null],
        [null, null, 340, null, 340, null, null, null],
        [null, null, null, 360, null, null, null, null],
    ]
  },
  {
    id: 23,
    name: "Rising Tide",
    static: false,
    layout: [
      [150, 160, 170, 180, 180, 170, 160, 150],
    ]
  },
  {
    id: 24,
    name: "Gaps",
    static: true,
    layout: [
        [400, 400, 400, null, null, 400, 400, 400],
        [400, 400, null, null, null, null, 400, 400],
        [400, null, null, null, null, null, null, 400],
        [null, null, null, 500, 500, null, null, null],
        [400, null, null, null, null, null, null, 400],
        [400, 400, null, null, null, null, 400, 400],
        [400, 400, 400, null, null, 400, 400, 400],
    ]
  },
  {
    id: 25,
    name: "Shield",
    static: true,
    layout: [
        [null, null, null, 600, 600, null, null, null],
        [null, null, 580, null, null, 580, null, null],
        [null, 560, null, 560, 560, null, 560, null],
        [540, null, null, null, null, null, null, 540],
        [520, 520, 520, 520, 520, 520, 520, 520],
    ]
  },
  {
    id: 26,
    name: "Hard Rain",
    static: false,
    layout: [
        [200, null, 200, null, 200, null, 200, null],
        [null, 220, null, 220, null, 220, null, 220],
    ]
  },
  {
    id: 27,
    name: "Teeth",
    static: true,
    layout: [
        [600, 600, null, null, null, null, 600, 600],
        [null, 620, 620, null, null, 620, 620, null],
        [null, null, 640, 640, 640, 640, null, null],
        [null, null, null, 660, 660, null, null, null],
    ]
  },
  {
    id: 28,
    name: "Labyrinth",
    static: true,
    layout: [
        [700, null, 700, 700, 700, 700, 700, 700],
        [700, null, 700, null, null, null, null, 700],
        [700, null, 700, 700, 700, null, 700, 700],
        [700, 700, 700, null, 700, null, 700, null],
        [null, null, null, null, 700, 700, 700, null],
    ]
  },
  {
    id: 29,
    name: "Barrage",
    static: false,
    layout: [
        [250, 250, 250, 250, 250, 250, 250, 250],
        [250, 250, 250, 250, 250, 250, 250, 250],
    ]
  },
  {
    id: 30,
    name: "The End?",
    static: true,
    layout: [
        [null, null, null, 999, 999, null, null, null],
        [null, null, 900, null, null, 900, null, null],
        [null, 800, null, 800, 800, null, 800, null],
        [700, null, 700, null, null, 700, null, 700],
        [700, 700, 700, 700, 700, 700, 700, 700],
    ]
  },
];
