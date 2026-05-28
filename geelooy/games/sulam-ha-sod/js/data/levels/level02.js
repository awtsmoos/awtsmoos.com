// B"H
/**
 * Hand-authored Sulam HaSod chamber data.
 * This file is intentionally plain data: no engine imports, no side effects.
 */
export const level02 - - - - = {
  "name": "2 - - - - · Yesod Mirror Causeway",
  "width": 2600,
  "spawn": {
    "x": 50,
    "y": 390
  },
  "door": {
    "x": 2440,
    "y": 165,
    "w": 44,
    "h": 92
  },
  "law": "Yesod reflects attention; looking creates pursuit.",
  "platforms": [
    {
      "x": 0,
      "y": 505,
      "w": 320,
      "h": 40
    },
    {
      "x": 430,
      "y": 430,
      "w": 170,
      "h": 22
    },
    {
      "x": 710,
      "y": 365,
      "w": 170,
      "h": 22
    },
    {
      "x": 1010,
      "y": 300,
      "w": 170,
      "h": 22
    },
    {
      "x": 1290,
      "y": 235,
      "w": 180,
      "h": 22
    },
    {
      "x": 1580,
      "y": 310,
      "w": 200,
      "h": 22
    },
    {
      "x": 1900,
      "y": 250,
      "w": 190,
      "h": 22
    },
    {
      "x": 2260,
      "y": 300,
      "w": 240,
      "h": 24
    },
    {
      "x": 700,
      "y": 185,
      "w": 140,
      "h": 20
    },
    {
      "x": 1510,
      "y": 155,
      "w": 130,
      "h": 20
    }
  ],
  "rotatingPlatforms": [
    {
      "x": 615,
      "y": 405,
      "w": 82,
      "h": 16,
      "spin": -1.8,
      "throw": 340
    },
    {
      "x": 1180,
      "y": 275,
      "w": 88,
      "h": 16,
      "spin": 1.2,
      "throw": 310
    },
    {
      "x": 2120,
      "y": 330,
      "w": 100,
      "h": 16,
      "spin": 1.9,
      "throw": 360
    }
  ],
  "trickPlatforms": [
    {
      "x": 890,
      "y": 335,
      "w": 74,
      "h": 18,
      "kind": "vanish",
      "reform": 1.6
    },
    {
      "x": 1410,
      "y": 210,
      "w": 65,
      "h": 18,
      "kind": "shatter",
      "reform": 2.4
    },
    {
      "x": 2190,
      "y": 275,
      "w": 64,
      "h": 18,
      "kind": "ambush",
      "range": 95,
      "jump": 92
    }
  ],
  "coins": [
    {
      "x": 462,
      "y": 390,
      "kind": "perutah"
    },
    {
      "x": 746,
      "y": 325,
      "kind": "dinar"
    },
    {
      "x": 1045,
      "y": 260,
      "kind": "perutah"
    },
    {
      "x": 1332,
      "y": 195,
      "kind": "sela"
    },
    {
      "x": 1618,
      "y": 270,
      "kind": "perutah"
    },
    {
      "x": 1940,
      "y": 210,
      "kind": "dinar"
    },
    {
      "x": 2310,
      "y": 260,
      "kind": "perutah"
    },
    {
      "x": 1540,
      "y": 115,
      "kind": "maneh"
    }
  ],
  "keys": [
    {
      "x": 760,
      "y": 145,
      "kind": "perutah"
    }
  ],
  "spikes": [
    {
      "x": 610,
      "y": 410,
      "w": 80,
      "h": 30,
      "delay": 1.6,
      "min": 1.2,
      "max": 3.5
    },
    {
      "x": 1210,
      "y": 214,
      "w": 70,
      "h": 28,
      "delay": 2.7,
      "min": 1,
      "max": 3
    },
    {
      "x": 2100,
      "y": 482,
      "w": 95,
      "h": 30,
      "delay": 3.4,
      "min": 1,
      "max": 3
    }
  ],
  "enemies": [
    {
      "x": 1040,
      "y": 266,
      "w": 36,
      "h": 34,
      "min": 1010,
      "max": 1180,
      "vx": 110,
      "type": "scroll",
      "name": "forgetting wind"
    },
    {
      "x": 1930,
      "y": 216,
      "w": 36,
      "h": 34,
      "min": 1900,
      "max": 2090,
      "vx": 125,
      "type": "golem",
      "name": "doubt crawler"
    }
  ],
  "triggers": [
    {
      "x": 820,
      "y": 300,
      "w": 90,
      "h": 130,
      "message": "Yesod says: the mirror only chases what you stare at.",
      "enemies": [
        {
          "x": 900,
          "y": 331,
          "w": 36,
          "h": 34,
          "min": 880,
          "max": 990,
          "vx": 140,
          "type": "ayin",
          "name": "newborn mirror eye"
        }
      ]
    },
    {
      "x": 1490,
      "y": 110,
      "w": 110,
      "h": 120,
      "message": "A moon-bridge appears for one who climbs sideways.",
      "platforms": [
        {
          "x": 1660,
          "y": 210,
          "w": 120,
          "h": 20
        }
      ]
    },
    {
      "x": 2220,
      "y": 210,
      "w": 100,
      "h": 100,
      "message": "The reflection opens the gate early, but demands courage.",
      "openExit": true,
      "spikes": [
        {
          "x": 2320,
          "y": 282,
          "w": 75,
          "h": 28,
          "delay": 0.2,
          "min": 0.8,
          "max": 1.5
        }
      ]
    }
  ]
};
