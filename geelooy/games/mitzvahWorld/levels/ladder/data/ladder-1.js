// B"H
/** @file ladder-1.js - built from manual lava source level01.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-1",
  "shaym": "ladder-1",
  "title": "Aleph Lava Crossing",
  "description": "First hand-authored lava bridge: eight broad steps and no surprises.",
  "nivrayim": {
    "Chossid": [
      {
        "name": "player",
        "position": {
          "x": -22,
          "y": 1.78,
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
        "name": "level_1_basalt_lava_basin",
        "position": {
          "x": 3,
          "y": -0.92,
          "z": 0.05
        },
        "width": 90,
        "depth": 40.5,
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
        "name": "level_1_visible_lava_hazard",
        "position": {
          "x": 3,
          "y": -0.34,
          "z": 0.05
        },
        "width": 92,
        "depth": 42.5,
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
        "name": "l1_start_big_warm_island",
        "position": {
          "x": -22,
          "y": 1.2,
          "z": 0
        },
        "width": 10,
        "height": 1,
        "depth": 7,
        "color": 13673572,
        "textureSeed": "l1_start_big_warm_island",
        "isSolid": true,
        "safeRect": {
          "x": -22,
          "z": 0,
          "width": 10,
          "depth": 7
        }
      },
      {
        "name": "l1_low_step_one",
        "position": {
          "x": -15,
          "y": 1.24,
          "z": 1.1
        },
        "width": 7.2,
        "height": 1,
        "depth": 5.2,
        "color": 12159308,
        "textureSeed": "l1_low_step_one",
        "isSolid": true,
        "safeRect": {
          "x": -15,
          "z": 1.1,
          "width": 7.2,
          "depth": 5.2
        }
      },
      {
        "name": "l1_low_step_two",
        "position": {
          "x": -8,
          "y": 1.28,
          "z": -1.2
        },
        "width": 7,
        "height": 1,
        "depth": 5,
        "color": 12159308,
        "textureSeed": "l1_low_step_two",
        "isSolid": true,
        "safeRect": {
          "x": -8,
          "z": -1.2,
          "width": 7,
          "depth": 5
        }
      },
      {
        "name": "l1_low_step_three",
        "position": {
          "x": -1,
          "y": 1.32,
          "z": 1.3
        },
        "width": 6.8,
        "height": 1,
        "depth": 4.8,
        "color": 12159308,
        "textureSeed": "l1_low_step_three",
        "isSolid": true,
        "safeRect": {
          "x": -1,
          "z": 1.3,
          "width": 6.8,
          "depth": 4.8
        }
      },
      {
        "name": "l1_low_step_four",
        "position": {
          "x": 6,
          "y": 1.36,
          "z": -1.1
        },
        "width": 6.6,
        "height": 1,
        "depth": 4.7,
        "color": 12159308,
        "textureSeed": "l1_low_step_four",
        "isSolid": true,
        "safeRect": {
          "x": 6,
          "z": -1.1,
          "width": 6.6,
          "depth": 4.7
        }
      },
      {
        "name": "l1_low_step_five",
        "position": {
          "x": 13,
          "y": 1.4,
          "z": 1
        },
        "width": 6.4,
        "height": 1,
        "depth": 4.6,
        "color": 12159308,
        "textureSeed": "l1_low_step_five",
        "isSolid": true,
        "safeRect": {
          "x": 13,
          "z": 1,
          "width": 6.4,
          "depth": 4.6
        }
      },
      {
        "name": "l1_last_learning_step",
        "position": {
          "x": 20,
          "y": 1.44,
          "z": 0
        },
        "width": 6.4,
        "height": 1,
        "depth": 4.6,
        "color": 12159308,
        "textureSeed": "l1_last_learning_step",
        "isSolid": true,
        "safeRect": {
          "x": 20,
          "z": 0,
          "width": 6.4,
          "depth": 4.6
        }
      },
      {
        "name": "l1_finish_learning_island",
        "position": {
          "x": 28,
          "y": 1.48,
          "z": 0
        },
        "width": 10,
        "height": 1,
        "depth": 7,
        "color": 13673572,
        "textureSeed": "l1_finish_learning_island",
        "isSolid": true,
        "safeRect": {
          "x": 28,
          "z": 0,
          "width": 10,
          "depth": 7
        }
      }
    ],
    "MovingPlatform": [],
    "Coin": [
      {
        "name": "level_1_peruta_1",
        "position": {
          "x": -15,
          "y": 2.46,
          "z": 1.1
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
        "name": "level_1_peruta_2",
        "position": {
          "x": -8,
          "y": 2.5,
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
        "name": "level_1_peruta_3",
        "position": {
          "x": -1,
          "y": 2.54,
          "z": 1.3
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
        "name": "level_1_peruta_4",
        "position": {
          "x": 6,
          "y": 2.58,
          "z": -1.1
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
        "name": "level_1_peruta_5",
        "position": {
          "x": 13,
          "y": 2.62,
          "z": 1
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
        "name": "level_1_peruta_6",
        "position": {
          "x": 20,
          "y": 2.66,
          "z": 0
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
        "name": "level_1_tzedakah_box",
        "position": {
          "x": 20,
          "y": 2.49,
          "z": 0
        },
        "reward": 6,
        "proximity": 1.5
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_1_return_gate",
        "position": {
          "x": 29.2,
          "y": 2.03,
          "z": 0
        },
        "targetPath": "village.json",
        "target": "village.json",
        "proximity": 2.1,
        "height": 3.2,
        "width": 1.8,
        "isSolid": false
      }
    ],
    "FallResetTrigger": [
      {
        "name": "level_1_deep_fall_reset",
        "position": {
          "x": 3,
          "y": -7.6,
          "z": 0.05
        },
        "width": 102,
        "height": 1,
        "depth": 52,
        "targetPosition": {
          "x": -22,
          "y": 2.22,
          "z": 0
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_1_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6
    }
  ]
};
