// B"H
/**
 * Hand-authored Sulam HaSod chamber data.
 * This file is intentionally plain data: no engine imports, no side effects.
 */
export const level01 - - - - = {
  "name": "1 - - - - · Malchus Gate of Dust",
  "width": 2200,
  "spawn": {
    "x": 60,
    "y": 380
  },
  "door": {
    "x": 2080,
    "y": 300,
    "w": 44,
    "h": 92
  },
  "law": "Malchus receives every footstep and remembers every greed.",
  "platforms": [
    {
      "x": 0,
      "y": 505,
      "w": 420,
      "h": 40
    },
    {
      "x": 520,
      "y": 455,
      "w": 210,
      "h": 24
    },
    {
      "x": 820,
      "y": 405,
      "w": 220,
      "h": 24
    },
    {
      "x": 1130,
      "y": 350,
      "w": 260,
      "h": 24
    },
    {
      "x": 1490,
      "y": 420,
      "w": 220,
      "h": 24
    },
    {
      "x": 1780,
      "y": 365,
      "w": 180,
      "h": 24
    },
    {
      "x": 2010,
      "y": 405,
      "w": 170,
      "h": 24
    },
    {
      "x": 260,
      "y": 340,
      "w": 150,
      "h": 22
    },
    {
      "x": 620,
      "y": 270,
      "w": 145,
      "h": 22
    },
    {
      "x": 1040,
      "y": 235,
      "w": 130,
      "h": 22
    }
  ],
  "rotatingPlatforms": [
    {
      "x": 455,
      "y": 485,
      "w": 72,
      "h": 16,
      "spin": 1.6,
      "throw": 300
    },
    {
      "x": 1365,
      "y": 315,
      "w": 92,
      "h": 16,
      "spin": -1.3,
      "throw": 340
    }
  ],
  "trickPlatforms": [
    {
      "x": 735,
      "y": 430,
      "w": 70,
      "h": 18,
      "kind": "shatter",
      "reform": 2.2
    },
    {
      "x": 1718,
      "y": 350,
      "w": 60,
      "h": 18,
      "kind": "ambush",
      "range": 80,
      "jump": 74
    }
  ],
  "coins": [
    {
      "x": 300,
      "y": 300,
      "kind": "perutah"
    },
    {
      "x": 570,
      "y": 415,
      "kind": "perutah"
    },
    {
      "x": 870,
      "y": 365,
      "kind": "dinar"
    },
    {
      "x": 1180,
      "y": 310,
      "kind": "perutah"
    },
    {
      "x": 1540,
      "y": 380,
      "kind": "sela"
    },
    {
      "x": 1830,
      "y": 325,
      "kind": "perutah"
    },
    {
      "x": 2070,
      "y": 365,
      "kind": "dinar"
    },
    {
      "x": 650,
      "y": 230,
      "kind": "maneh"
    }
  ],
  "keys": [
    {
      "x": 1090,
      "y": 195,
      "kind": "perutah"
    }
  ],
  "spikes": [
    {
      "x": 425,
      "y": 486,
      "w": 70,
      "h": 28,
      "delay": 1.2,
      "min": 1.4,
      "max": 3.8
    },
    {
      "x": 760,
      "y": 442,
      "w": 58,
      "h": 26,
      "delay": 2.1,
      "min": 1,
      "max": 3
    },
    {
      "x": 1390,
      "y": 332,
      "w": 80,
      "h": 28,
      "delay": 3.1,
      "min": 1,
      "max": 3
    }
  ],
  "enemies": [
    {
      "x": 610,
      "y": 421,
      "w": 36,
      "h": 34,
      "min": 530,
      "max": 720,
      "vx": 80,
      "type": "thief",
      "name": "klipah ember"
    },
    {
      "x": 1510,
      "y": 386,
      "w": 36,
      "h": 34,
      "min": 1490,
      "max": 1690,
      "vx": 100,
      "type": "ayin",
      "name": "shadow eye"
    }
  ],
  "triggers": [
    {
      "x": 555,
      "y": 380,
      "w": 120,
      "h": 150,
      "message": "Malchus whispers: charity softens stone.",
      "platforms": [
        {
          "x": 730,
          "y": 382,
          "w": 70,
          "h": 18
        }
      ],
      "coins": [
        {
          "x": 760,
          "y": 344,
          "kind": "dinar"
        }
      ]
    },
    {
      "x": 1320,
      "y": 250,
      "w": 110,
      "h": 120,
      "message": "A hidden invoice is paid: the floor grows teeth.",
      "spikes": [
        {
          "x": 1280,
          "y": 486,
          "w": 90,
          "h": 30,
          "delay": 0.25,
          "min": 0.7,
          "max": 1.4
        }
      ]
    },
    {
      "x": 1880,
      "y": 250,
      "w": 110,
      "h": 150,
      "message": "The gate accepts your dust. The key remembers you.",
      "openExit": true
    }
  ]
};
