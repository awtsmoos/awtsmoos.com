// B"H

/**
 * The fourth chapter in the chronicle of worlds, levels 31-40.
 * @type {import('../level-loader.js').Level[]}
 */
export const levels = [
  {
    id: 31,
    name: "Waves",
    static: true,
    layout: [
      [1000, null, 1000, null, 1000, null, 1000, null],
      [null, 1100, null, 1100, null, 1100, null, 1100],
      [1200, null, 1200, null, 1200, null, 1200, null],
      [null, 1300, null, 1300, null, 1300, null, 1300],
      [1400, null, 1400, null, 1400, null, 1400, null],
    ]
  },
  {
    id: 32,
    name: "The Core",
    static: true,
    layout: [
        [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
        [1500, null, null, null, null, null, null, 1500],
        [1500, null, 2000, 2000, 2000, 2000, null, 1500],
        [1500, null, 2000, 2500, 2500, 2000, null, 1500],
        [1500, null, 2000, 2000, 2000, 2000, null, 1500],
        [1500, null, null, null, null, null, null, 1500],
        [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
    ]
  },
  {
    id: 33,
    name: "Tough Gauntlet",
    static: false,
    layout: [
      [300, 300, 300, 300, 300, 300, 300, 300],
      [350, 350, 350, 350, 350, 350, 350, 350],
    ]
  },
  {
    id: 34,
    name: "X-Factor",
    static: true,
    layout: [
        [2000, null, null, null, null, null, null, 2000],
        [null, 2100, null, null, null, null, 2100, null],
        [null, null, 2200, null, null, 2200, null, null],
        [null, null, null, 2300, 2300, null, null, null],
        [null, null, 2200, null, null, 2200, null, null],
        [null, 2100, null, null, null, null, 2100, null],
        [2000, null, null, null, null, null, null, 2000],
    ]
  },
  {
    id: 35,
    name: "Blocks",
    static: true,
    layout: [
        [2500, 2500, null, 2500, 2500, null, 2500, 2500],
        [2500, 2500, null, 2500, 2500, null, 2500, 2500],
        [null, null, null, null, null, null, null, null],
        [2500, 2500, null, 2500, 2500, null, 2500, 2500],
        [2500, 2500, null, 2500, 2500, null, 2500, 2500],
    ]
  },
  {
    id: 36,
    name: "T-Shape",
    static: true,
    layout: [
        [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000],
        [null, null, null, 3000, 3000, null, null, null],
        [null, null, null, 3000, 3000, null, null, null],
        [null, null, null, 3000, 3000, null, null, null],
        [null, null, null, 3000, 3000, null, null, null],
    ]
  },
  {
    id: 37,
    name: "Choke Point",
    static: false,
    layout: [
        [500, 500, 500, null, null, 500, 500, 500],
        [500, 500, null, null, null, null, 500, 500],
    ]
  },
  {
    id: 38,
    name: "Braces",
    static: true,
    layout: [
        [3500, null, null, null, null, null, null, 3500],
        [3500, 3500, null, null, null, null, 3500, 3500],
        [3500, 3500, 3500, null, null, 3500, 3500, 3500],
        [3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500],
    ]
  },
  {
    id: 39,
    name: "The Vault",
    static: true,
    layout: [
        [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000],
        [null, null, null, null, null, null, null, null],
        [null, null, null, 5000, 5000, null, null, null],
        [null, null, null, null, null, null, null, null],
        [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000],
    ]
  },
  {
    id: 40,
    name: "Elite Gauntlet",
    static: false,
    layout: [
        [600, 600, 600, 600, 600, 600, 600, 600],
        [null, null, null, null, null, null, null, null],
        [650, 650, 650, 650, 650, 650, 650, 650],
        [null, null, null, null, null, null, null, null],
        [700, 700, 700, 700, 700, 700, 700, 700],
    ]
  },
];
