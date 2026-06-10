// B"H
/** @file ladder-8.js - built from manual lava source level08.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-8",
  "shaym": "ladder-8",
  "title": "Ches Crescent Path",
  "description": "A handmade crescent with two tiny crumb jumps.",
  "nivrayim": {
    "Chossid": [
      {
        "name": "player",
        "path": "https://models-3122d.web.app/chossid.glb?k=2",
        "position": {
          "x": -25,
          "y": 1.88,
          "z": 0
        },
        "visualGroundBiasY": -0.12,
        "dynamicSolidRadius": 0.28,
        "modelScale": 1,
        "heesHawveh": true
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "level_8_basalt_lava_basin",
        "position": {
          "x": 0.25,
          "y": -0.92,
          "z": 0.3
        },
        "width": 90.5,
        "depth": 45.4,
        "segments": 24,
        "collisionSegments": 1,
        "textureSize": 512,
        "textureType": "lavaBasin",
        "material": "lavaBasin",
        "isSolid": false,
        "microNoise": 0.015
      }
    ],
    "SpikeField": [
      {
        "name": "level_8_visible_lava_hazard",
        "position": {
          "x": 0.25,
          "y": -0.34,
          "z": 0.3
        },
        "width": 92.5,
        "depth": 47.4,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false
      }
    ],
    "SolidBlock": [
      {
        "name": "l8_start_crescent_base",
        "position": {
          "x": -25,
          "y": 1.3,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6.1,
        "color": 13673572,
        "textureSeed": "l8_start_crescent_base",
        "isSolid": true,
        "safeRect": {
          "x": -25,
          "z": 0,
          "width": 9,
          "depth": 6.1
        }
      },
      {
        "name": "l8_crescent_wide_one",
        "position": {
          "x": -17,
          "y": 1.48,
          "z": -3.4
        },
        "width": 5,
        "height": 1,
        "depth": 3.2,
        "color": 12159308,
        "textureSeed": "l8_crescent_wide_one",
        "isSolid": true,
        "safeRect": {
          "x": -17,
          "z": -3.4,
          "width": 5,
          "depth": 3.2
        }
      },
      {
        "name": "l8_crescent_crumb_a",
        "position": {
          "x": -10.8,
          "y": 1.62,
          "z": -1.2
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "l8_crescent_crumb_a",
        "isSolid": true,
        "safeRect": {
          "x": -10.8,
          "z": -1.2,
          "width": 2.4,
          "depth": 2.2
        }
      },
      {
        "name": "l8_crescent_crumb_b",
        "position": {
          "x": -5.6,
          "y": 1.76,
          "z": 2.2
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "l8_crescent_crumb_b",
        "isSolid": true,
        "safeRect": {
          "x": -5.6,
          "z": 2.2,
          "width": 2.4,
          "depth": 2.2
        }
      },
      {
        "name": "l8_crescent_wide_two",
        "position": {
          "x": 1.2,
          "y": 1.9,
          "z": 4
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.1,
        "color": 12159308,
        "textureSeed": "l8_crescent_wide_two",
        "isSolid": true,
        "safeRect": {
          "x": 1.2,
          "z": 4,
          "width": 4.8,
          "depth": 3.1
        }
      },
      {
        "name": "l8_last_crescent_step",
        "position": {
          "x": 16.5,
          "y": 2.18,
          "z": -2.8
        },
        "width": 4.4,
        "height": 1,
        "depth": 3,
        "color": 12159308,
        "textureSeed": "l8_last_crescent_step",
        "isSolid": true,
        "safeRect": {
          "x": 16.5,
          "z": -2.8,
          "width": 4.4,
          "depth": 3
        }
      },
      {
        "name": "l8_finish_ches_shelter",
        "position": {
          "x": 25.5,
          "y": 2.28,
          "z": 0
        },
        "width": 8.6,
        "height": 1,
        "depth": 6.2,
        "color": 13673572,
        "textureSeed": "l8_finish_ches_shelter",
        "isSolid": true,
        "safeRect": {
          "x": 25.5,
          "z": 0,
          "width": 8.6,
          "depth": 6.2
        }
      }
    ],
    "MovingPlatform": [
      {
        "name": "l8_crosswind_mover",
        "position": {
          "x": 8.5,
          "y": 2.05,
          "z": 0.8
        },
        "width": 3.6,
        "height": 1,
        "depth": 2.5,
        "color": 6211839,
        "textureSeed": "l8_crosswind_mover",
        "isSolid": true,
        "moving": true,
        "axis": "z",
        "distance": 3.6,
        "speed": 0.52,
        "phase": 0.1,
        "size": {
          "x": 3.6,
          "y": 1,
          "z": 2.5
        },
        "dimensions": {
          "x": 3.6,
          "y": 1,
          "z": 2.5
        },
        "safeRect": {
          "x": 8.5,
          "z": 0.8,
          "width": 3.6,
          "depth": 2.5
        }
      }
    ],
    "Coin": [
      {
        "name": "level_8_peruta_1",
        "position": {
          "x": -17,
          "y": 2.7,
          "z": -3.4
        },
        "value": 1,
        "proximity": 1.15,
        "golem": {
          "guf": {
            "CylinderGeometry": [
              0.42,
              0.42,
              0.1,
              32
            ]
          },
          "toyr": {
            "MeshBasicMaterial": {
              "color": 16763955
            }
          }
        }
      },
      {
        "name": "level_8_peruta_2",
        "position": {
          "x": -10.8,
          "y": 2.84,
          "z": -1.2
        },
        "value": 1,
        "proximity": 1.15,
        "golem": {
          "guf": {
            "CylinderGeometry": [
              0.42,
              0.42,
              0.1,
              32
            ]
          },
          "toyr": {
            "MeshBasicMaterial": {
              "color": 16763955
            }
          }
        }
      },
      {
        "name": "level_8_peruta_3",
        "position": {
          "x": -5.6,
          "y": 2.98,
          "z": 2.2
        },
        "value": 1,
        "proximity": 1.15,
        "golem": {
          "guf": {
            "CylinderGeometry": [
              0.42,
              0.42,
              0.1,
              32
            ]
          },
          "toyr": {
            "MeshBasicMaterial": {
              "color": 16763955
            }
          }
        }
      },
      {
        "name": "level_8_peruta_4",
        "position": {
          "x": 1.2,
          "y": 3.12,
          "z": 4
        },
        "value": 1,
        "proximity": 1.15,
        "golem": {
          "guf": {
            "CylinderGeometry": [
              0.42,
              0.42,
              0.1,
              32
            ]
          },
          "toyr": {
            "MeshBasicMaterial": {
              "color": 16763955
            }
          }
        }
      },
      {
        "name": "level_8_peruta_5",
        "position": {
          "x": 8.5,
          "y": 3.27,
          "z": 0.8
        },
        "value": 1,
        "proximity": 1.15,
        "golem": {
          "guf": {
            "CylinderGeometry": [
              0.42,
              0.42,
              0.1,
              32
            ]
          },
          "toyr": {
            "MeshBasicMaterial": {
              "color": 16763955
            }
          }
        }
      },
      {
        "name": "level_8_peruta_6",
        "position": {
          "x": 16.5,
          "y": 3.4,
          "z": -2.8
        },
        "value": 1,
        "proximity": 1.15,
        "golem": {
          "guf": {
            "CylinderGeometry": [
              0.42,
              0.42,
              0.1,
              32
            ]
          },
          "toyr": {
            "MeshBasicMaterial": {
              "color": 16763955
            }
          }
        }
      }
    ],
    "TzedakahBox": [
      {
        "name": "level_8_tzedakah_box",
        "position": {
          "x": 16.5,
          "y": 3.23,
          "z": -2.8
        },
        "reward": 13,
        "proximity": 1.5
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_8_return_gate",
        "position": {
          "x": 26.7,
          "y": 2.83,
          "z": 0
        },
        "next": "village.json",
        "target": "village.json",
        "targetPath": "village.json",
        "proximity": 2.1,
        "height": 3.2,
        "width": 1.8,
        "isSolid": false
      }
    ],
    "FallResetTrigger": [
      {
        "name": "level_8_deep_fall_reset",
        "position": {
          "x": 0.25,
          "y": -7.6,
          "z": 0.3
        },
        "width": 102.5,
        "height": 1,
        "depth": 53.4,
        "targetPosition": {
          "x": -25,
          "y": 2.32,
          "z": 0
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_8_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6
    }
  ]
};
