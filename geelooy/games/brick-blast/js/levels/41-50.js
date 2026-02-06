// B"H

/**
 * The fifth chapter in the chronicle of worlds, levels 41-50.
 * @type {import('../level-loader.js').Level[]}
 */
export const levels = [
  {
    id: 41,
    name: "The Grinder",
    static: false,
    layout: [
        [800, 800, null, 800, 800, null, 800, 800],
        [800, 800, null, 800, 800, null, 800, 800],
        [800, 800, null, 800, 800, null, 800, 800],
    ]
  },
  {
    id: 42,
    name: "Tetris",
    static: true,
    layout: [
        [5000, 5000, null, null, 5200, 5200, 5200, null],
        [null, 5000, null, null, null, 5200, null, null],
        [null, 5000, null, 5100, 5100, null, null, null],
        [null, null, null, 5100, 5100, null, null, null],
        [null, null, 5300, 5300, null, 5400, 5400, null],
        [null, null, 5300, 5300, null, 5400, 5400, null],
    ]
  },
  {
    id: 43,
    name: "Spiral",
    static: true,
    layout: [
        [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
        [null, null, null, null, null, null, null, 6000],
        [6000, 6000, 6000, 6000, 6000, 6000, null, 6000],
        [6000, null, null, null, null, 6000, null, 6000],
        [6000, null, 6000, 6000, 6000, 6000, null, 6000],
        [6000, null, null, null, null, null, null, 6000],
        [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
    ]
  },
  {
    id: 44,
    name: "Pincer",
    static: false,
    layout: [
      [1000, 1000, null, null, null, null, 1000, 1000],
      [null, 1100, 1100, null, null, 1100, 1100, null],
      [null, null, 1200, 1200, 1200, 1200, null, null],
    ]
  },
  {
    id: 45,
    name: "U-Turn",
    static: true,
    layout: [
      [7000, null, null, null, null, null, null, 7000],
      [7000, null, null, null, null, null, null, 7000],
      [7000, null, null, null, null, null, null, 7000],
      [7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000],
    ]
  },
  {
    id: 46,
    name: "The Cage",
    static: true,
    layout: [
      [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000],
      [8000, null, null, null, null, null, null, 8000],
      [8000, null, 9999, 9999, 9999, 9999, null, 8000],
      [8000, null, 9999, 9999, 9999, 9999, null, 8000],
      [8000, null, null, null, null, null, null, 8000],
      [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000],
    ]
  },
  {
    id: 47,
    name: "Columns",
    static: false,
    layout: [
      [1500, null, 1500, null, 1500, null, 1500, null],
      [null, 1500, null, 1500, null, 1500, null, 1500],
      [1500, null, 1500, null, 1500, null, 1500, null],
      [null, 1500, null, 1500, null, 1500, null, 1500],
    ]
  },
  {
    id: 48,
    name: "Castle",
    static: true,
    layout: [
      [9000, 9000, null, 9500, 9500, null, 9000, 9000],
      [9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000],
      [null, null, 9000, 9000, 9000, 9000, null, null],
      [null, null, 9000, 9000, 9000, 9000, null, null],
    ]
  },
  {
    id: 49,
    name: "Death Wall",
    static: false,
    layout: [
        [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
        [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
        [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
        [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
    ]
  },
  {
    id: 50,
    name: "Checkmate",
    static: true,
    layout: [
      [10000, null, 11000, null, 12000, null, 13000, null],
      [null, 10000, null, 11000, null, 12000, null, 13000],
      [13000, null, 12000, null, 11000, null, 10000, null],
      [null, 13000, null, 12000, null, 11000, null, 10000],
      [10000, null, 11000, null, 12000, null, 13000, null],
      [null, 10000, null, 11000, null, 12000, null, 13000],
    ]
  },
];
