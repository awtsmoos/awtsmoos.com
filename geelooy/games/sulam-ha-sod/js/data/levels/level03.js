// B"H
/**
 * Hand-authored Sulam HaSod chamber data.
 * This file is intentionally plain data: no engine imports, no side effects.
 */
export const level03 - - - - = {
  "name": "3 - - - - · Hod Library of Arguments",
  "width": 3000,
  "spawn": {
    "x": 60,
    "y": 390
  },
  "door": {
    "x": 2860,
    "y": 275,
    "w": 44,
    "h": 92
  },
  "law": "Hod writes footnotes that bite.",
  "platforms": [
    {
      "x": 0,
      "y": 505,
      "w": 280,
      "h": 40
    },
    {
      "x": 380,
      "y": 455,
      "w": 140,
      "h": 22
    },
    {
      "x": 650,
      "y": 390,
      "w": 170,
      "h": 22
    },
    {
      "x": 960,
      "y": 330,
      "w": 150,
      "h": 22
    },
    {
      "x": 1210,
      "y": 260,
      "w": 170,
      "h": 22
    },
    {
      "x": 1510,
      "y": 360,
      "w": 190,
      "h": 22
    },
    {
      "x": 1810,
      "y": 430,
      "w": 180,
      "h": 22
    },
    {
      "x": 2110,
      "y": 365,
      "w": 170,
      "h": 22
    },
    {
      "x": 2390,
      "y": 305,
      "w": 160,
      "h": 22
    },
    {
      "x": 2740,
      "y": 395,
      "w": 240,
      "h": 40
    }
  ],
  "rotatingPlatforms": [
    {
      "x": 535,
      "y": 430,
      "w": 76,
      "h": 16,
      "spin": 2.1,
      "throw": 380
    },
    {
      "x": 1120,
      "y": 300,
      "w": 80,
      "h": 16,
      "spin": -1.6,
      "throw": 340
    },
    {
      "x": 1710,
      "y": 394,
      "w": 86,
      "h": 16,
      "spin": 1.5,
      "throw": 330
    },
    {
      "x": 2570,
      "y": 360,
      "w": 92,
      "h": 16,
      "spin": -2.2,
      "throw": 400
    }
  ],
  "trickPlatforms": [
    {
      "x": 830,
      "y": 360,
      "w": 76,
      "h": 18,
      "kind": "shatter",
      "reform": 2
    },
    {
      "x": 1390,
      "y": 246,
      "w": 70,
      "h": 18,
      "kind": "vanish",
      "reform": 1.4
    },
    {
      "x": 2025,
      "y": 338,
      "w": 80,
      "h": 18,
      "kind": "ambush",
      "range": 110,
      "jump": 100
    },
    {
      "x": 2660,
      "y": 365,
      "w": 70,
      "h": 18,
      "kind": "shatter",
      "reform": 2.8
    }
  ],
  "coins": [
    {
      "x": 405,
      "y": 415,
      "kind": "dinar"
    },
    {
      "x": 690,
      "y": 350,
      "kind": "perutah"
    },
    {
      "x": 1000,
      "y": 290,
      "kind": "sela"
    },
    {
      "x": 1250,
      "y": 220,
      "kind": "perutah"
    },
    {
      "x": 1560,
      "y": 320,
      "kind": "dinar"
    },
    {
      "x": 1850,
      "y": 390,
      "kind": "perutah"
    },
    {
      "x": 2140,
      "y": 325,
      "kind": "sela"
    },
    {
      "x": 2430,
      "y": 265,
      "kind": "perutah"
    },
    {
      "x": 2820,
      "y": 355,
      "kind": "maneh"
    }
  ],
  "keys": [
    {
      "x": 1260,
      "y": 220,
      "kind": "perutah"
    }
  ],
  "spikes": [
    {
      "x": 520,
      "y": 485,
      "w": 90,
      "h": 32,
      "delay": 1.1,
      "min": 1.1,
      "max": 3.2
    },
    {
      "x": 1120,
      "y": 312,
      "w": 85,
      "h": 28,
      "delay": 2.4,
      "min": 1,
      "max": 3
    },
    {
      "x": 1705,
      "y": 340,
      "w": 90,
      "h": 28,
      "delay": 2.9,
      "min": 1,
      "max": 3
    },
    {
      "x": 2555,
      "y": 486,
      "w": 120,
      "h": 32,
      "delay": 3.6,
      "min": 1,
      "max": 3
    }
  ],
  "enemies": [
    {
      "x": 670,
      "y": 356,
      "w": 36,
      "h": 34,
      "min": 650,
      "max": 820,
      "vx": 125,
      "type": "gilgul",
      "name": "red shell"
    },
    {
      "x": 1530,
      "y": 326,
      "w": 36,
      "h": 34,
      "min": 1510,
      "max": 1700,
      "vx": 135,
      "type": "golem",
      "name": "heavy husk"
    },
    {
      "x": 2760,
      "y": 361,
      "w": 36,
      "h": 34,
      "min": 2740,
      "max": 2960,
      "vx": 145,
      "type": "gravity",
      "name": "gate guard"
    }
  ],
  "triggers": [
    {
      "x": 945,
      "y": 250,
      "w": 90,
      "h": 140,
      "message": "Two Talmudic ghosts argue: the shortest bridge is usually cursed.",
      "trickPlatforms": [
        {
          "x": 1080,
          "y": 300,
          "w": 70,
          "h": 18,
          "kind": "vanish",
          "reform": 1.1
        }
      ]
    },
    {
      "x": 1730,
      "y": 340,
      "w": 120,
      "h": 130,
      "message": "The margin screams and drops punctuation-spikes.",
      "spikes": [
        {
          "x": 1760,
          "y": 410,
          "w": 85,
          "h": 28,
          "delay": 0.1,
          "min": 0.7,
          "max": 1.3
        }
      ]
    },
    {
      "x": 2490,
      "y": 230,
      "w": 110,
      "h": 110,
      "message": "Hod admits defeat: a secret shelf slides out.",
      "platforms": [
        {
          "x": 2585,
          "y": 275,
          "w": 120,
          "h": 18
        }
      ],
      "coins": [
        {
          "x": 2620,
          "y": 235,
          "kind": "sela"
        }
      ]
    }
  ]
};
