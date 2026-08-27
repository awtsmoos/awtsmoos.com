// B"H

/**
 * The first chapter in the chronicle of worlds, levels 1-10.
 * @type {import('../level-loader.js').Level[]}
 */
export const levels = [
  {
    id: 1,
    name: "Easy Start",
    static: true,
    layout: [
      [null, null, 1, 2, 3, 2, 1, null],
      [null, 2, 3, 4, 4, 3, 2, null],
      [1, 3, 4, 5, 5, 4, 3, 1],
    ],
  },
  {
    id: 2,
    name: "Pyramid",
    static: true,
    layout: [
      [null, null, null, 10, null, null, null, null],
      [null, null, 12, 15, 12, null, null, null],
      [null, 15, 18, 20, 18, 15, null, null],
      [18, 22, 25, 30, 25, 22, 18, 18],
    ],
  },
  {
    id: 3,
    name: "Checkerboard",
    static: true,
    layout: [
      [20, null, 20, null, 20, null, 20, null],
      [null, 25, null, 25, null, 25, null, 25],
      [30, null, 30, null, 30, null, 30, null],
      [null, 35, null, 35, null, 35, null, 35],
    ],
  },
  {
    id: 4,
    name: "The Wall",
    static: true,
    layout: [
        [50, 50, 50, 50, 50, 50, 50, 50],
        [55, 55, 55, 55, 55, 55, 55, 55],
        [null, null, null, null, null, null, null, null],
        [60, 60, 60, 60, 60, 60, 60, 60],
    ]
  },
  {
    id: 5,
    name: "Smiley",
    static: true,
    layout: [
        [null, 40, null, null, null, null, 40, null],
        [null, null, null, null, null, null, null, null],
        [45, null, null, 50, 50, null, null, 45],
        [null, 45, 45, null, null, 45, 45, null],
    ]
  },
  {
    id: 6,
    name: "Diamond",
    static: true,
    layout: [
        [null, null, null, 60, 60, null, null, null],
        [null, null, 65, null, null, 65, null, null],
        [null, 70, null, null, null, null, 70, null],
        [null, null, 65, null, null, 65, null, null],
        [null, null, null, 60, 60, null, null, null],
    ]
  },
  {
    id: 7,
    name: "Arrowhead",
    static: true,
    layout: [
        [80, null, null, null, null, null, null, 80],
        [null, 85, null, null, null, null, 85, null],
        [null, null, 90, null, null, 90, null, null],
        [null, null, null, 95, 95, null, null, null],
    ]
  },
  {
    id: 8,
    name: "Full House",
    static: true,
    layout: [
        [100, 100, 100, 100, 100, 100, 100, 100],
        [100, 110, 110, 110, 110, 110, 110, 100],
        [100, 110, 120, 120, 120, 120, 110, 100],
        [100, 110, 120, 130, 130, 120, 110, 100],
    ]
  },
  {
    id: 9,
    name: "First Gauntlet",
    static: false, // The heavens descend in this world!
    layout: [
        [10, {h: 5, t: 'bomb'}, 10, 10, 10, 10, {h: 5, t: 'bomb'}, 10],
    ]
  },
  {
    id: 10,
    name: "Fortress",
    static: true,
    layout: [
        [120, 120, 120, 120, 120, 120, 120, 120],
        [120, null, null, null, null, null, null, 120],
        [120, null, 150, 150, 150, 150, null, 120],
        [120, null, 150, {h: 50, t: 'bomb'}, {h: 50, t: 'bomb'}, 150, null, 120],
        [120, null, 150, 150, 150, 150, null, 120],
    ]
  }
];