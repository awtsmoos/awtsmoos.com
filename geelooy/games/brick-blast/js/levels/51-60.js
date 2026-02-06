// B"H

/**
 * The sixth chapter in the chronicle of worlds, levels 51-60.
 * @type {import('../level-loader.js').Level[]}
 */
export const levels = [
  {
    id: 51,
    name: "Impenetrable",
    static: true,
    layout: [
        [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
        [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
        [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
        [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
        [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
        [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
    ]
  },
  {
    id: 52,
    name: "Thin Gaps",
    static: false,
    layout: [
      [3000, 3000, 3000, null, 3000, 3000, 3000, 3000],
      [3000, 3000, 3000, 3000, null, 3000, 3000, 3000],
      [3000, 3000, 3000, 3000, 3000, null, 3000, 3000],
    ]
  },
  {
    id: 53,
    name: "Heart",
    static: true,
    layout: [
      [null, 25000, 25000, null, null, 25000, 25000, null],
      [26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000],
      [26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000],
      [null, 26000, 26000, 26000, 26000, 26000, 26000, null],
      [null, null, 26000, 26000, 26000, 26000, null, null],
      [null, null, null, 26000, 26000, null, null, null],
    ]
  },
  {
    id: 54,
    name: "The Impossible",
    static: false,
    layout: [
        [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
        [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
        [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
        [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
        [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
        [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
    ]
  },
  {
    id: 55,
    name: "Diamond Hard",
    static: true,
    layout: [
        [null, null, null, 30000, 30000, null, null, null],
        [null, null, 32000, null, null, 32000, null, null],
        [null, 34000, null, 36000, 36000, null, 34000, null],
        [38000, null, 40000, null, null, 40000, null, 38000],
        [null, 34000, null, 36000, 36000, null, 34000, null],
        [null, null, 32000, null, null, 32000, null, null],
        [null, null, null, 30000, 30000, null, null, null],
    ]
  },
  {
    id: 56,
    name: "Fort Knox",
    static: true,
    layout: [
      [50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000],
      [50000, null, null, null, null, null, null, 50000],
      [50000, null, 75000, 75000, 75000, 75000, null, 50000],
      [50000, null, 75000, 99999, 99999, 75000, null, 50000],
      [50000, null, 75000, 75000, 75000, 75000, null, 50000],
      [50000, null, null, null, null, null, null, 50000],
      [50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000],
    ]
  },
  {
    id: 57,
    name: "Final Descent",
    static: false,
    layout: [
      [4000, null, 4000, null, 4000, null, 4000, null],
      [4000, null, 4000, null, 4000, null, 4000, null],
      [4000, null, 4000, null, 4000, null, 4000, null],
      [4000, null, 4000, null, 4000, null, 4000, null],
      [4000, null, 4000, null, 4000, null, 4000, null],
      [4000, null, 4000, null, 4000, null, 4000, null],
    ]
  },
  {
    id: 58,
    name: "The Creator",
    static: true,
    layout: [
      [null, null, 60000, 60000, 60000, 60000, null, null],
      [null, 60000, 60000, 60000, 60000, 60000, 60000, null],
      [60000, 60000, null, 60000, 60000, null, 60000, 60000],
      [60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000],
      [60000, 60000, 60000, null, null, 60000, 60000, 60000],
      [null, null, 60000, null, null, 60000, null, null],
    ]
  },
  {
    id: 59,
    name: "Infinity",
    static: false,
    layout: [
        [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
        [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
    ]
  },
  {
    id: 60,
    name: "Ein Sof",
    static: true,
    layout: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, 99999, 99999, null, null, null],
      [null, null, null, 99999, 99999, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]
  },
];