// B"H
/** @file ladder-19.js - built from manual lava source level19.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-19",
  "shaym": "ladder-19",
  "title": "Kuf Narrow Crown",
  "description": "A tight hand-authored crown course with tiny chips.",
  "nivrayim": {
    "Chossid": [
      {
        "name": "player",
        "position": {
          "x": -33,
          "y": 2.08,
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
        "name": "level_19_basalt_lava_basin",
        "position": {
          "x": -2.25,
          "y": -0.92,
          "z": -0.5
        },
        "width": 101.5,
        "depth": 46.6,
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
        "name": "level_19_visible_lava_hazard",
        "position": {
          "x": -2.25,
          "y": -0.34,
          "z": -0.5
        },
        "width": 103.5,
        "depth": 48.6,
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
        "name": "l19_start_kuf_crown",
        "position": {
          "x": -33,
          "y": 1.5,
          "z": 0
        },
        "width": 8.5,
        "height": 1,
        "depth": 5.7,
        "color": 13673572,
        "textureSeed": "l19_start_kuf_crown",
        "isSolid": true,
        "safeRect": {
          "x": -33,
          "z": 0,
          "width": 8.5,
          "depth": 5.7
        }
      },
      {
        "name": "l19_crown_left_slab",
        "position": {
          "x": -25,
          "y": 1.82,
          "z": -4.8
        },
        "width": 3.5,
        "height": 1,
        "depth": 2.3,
        "color": 12159308,
        "textureSeed": "l19_crown_left_slab",
        "isSolid": true,
        "safeRect": {
          "x": -25,
          "z": -4.8,
          "width": 3.5,
          "depth": 2.3
        }
      },
      {
        "name": "l19_crown_chip_one",
        "position": {
          "x": -19.5,
          "y": 2.08,
          "z": -1.3
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "l19_crown_chip_one",
        "isSolid": true,
        "safeRect": {
          "x": -19.5,
          "z": -1.3,
          "width": 2.4,
          "depth": 2.2
        }
      },
      {
        "name": "l19_crown_chip_two",
        "position": {
          "x": -7.4,
          "y": 2.58,
          "z": -3.2
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "l19_crown_chip_two",
        "isSolid": true,
        "safeRect": {
          "x": -7.4,
          "z": -3.2,
          "width": 2.4,
          "depth": 2.2
        }
      },
      {
        "name": "l19_crown_center_slab",
        "position": {
          "x": -1,
          "y": 2.82,
          "z": 3.8
        },
        "width": 3.4,
        "height": 1,
        "depth": 2.3,
        "color": 12159308,
        "textureSeed": "l19_crown_center_slab",
        "isSolid": true,
        "safeRect": {
          "x": -1,
          "z": 3.8,
          "width": 3.4,
          "depth": 2.3
        }
      },
      {
        "name": "l19_crown_chip_three",
        "position": {
          "x": 13,
          "y": 3.2,
          "z": -2.8
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "l19_crown_chip_three",
        "isSolid": true,
        "safeRect": {
          "x": 13,
          "z": -2.8,
          "width": 2.4,
          "depth": 2.2
        }
      },
      {
        "name": "l19_crown_exit_slab",
        "position": {
          "x": 20,
          "y": 3.34,
          "z": 1.6
        },
        "width": 3.4,
        "height": 1,
        "depth": 2.3,
        "color": 12159308,
        "textureSeed": "l19_crown_exit_slab",
        "isSolid": true,
        "safeRect": {
          "x": 20,
          "z": 1.6,
          "width": 3.4,
          "depth": 2.3
        }
      },
      {
        "name": "l19_finish_kuf_crown",
        "position": {
          "x": 28.5,
          "y": 3.46,
          "z": 0
        },
        "width": 7.8,
        "height": 1,
        "depth": 5.4,
        "color": 13673572,
        "textureSeed": "l19_finish_kuf_crown",
        "isSolid": true,
        "safeRect": {
          "x": 28.5,
          "z": 0,
          "width": 7.8,
          "depth": 5.4
        }
      }
    ],
    "MovingPlatform": [
      {
        "name": "l19_crown_sweep_one",
        "position": {
          "x": -13.5,
          "y": 2.34,
          "z": 2.6
        },
        "width": 2.8,
        "height": 1,
        "depth": 2,
        "color": 6211839,
        "textureSeed": "l19_crown_sweep_one",
        "isSolid": true,
        "moving": true,
        "axis": "z",
        "distance": 5.5,
        "speed": 0.68,
        "phase": 0.1,
        "size": {
          "x": 2.8,
          "y": 1,
          "z": 2
        },
        "dimensions": {
          "x": 2.8,
          "y": 1,
          "z": 2
        },
        "safeRect": {
          "x": -13.5,
          "z": 2.6,
          "width": 2.8,
          "depth": 2
        }
      },
      {
        "name": "l19_crown_sweep_two",
        "position": {
          "x": 6,
          "y": 3.04,
          "z": 0
        },
        "width": 2.7,
        "height": 1,
        "depth": 2,
        "color": 6211839,
        "textureSeed": "l19_crown_sweep_two",
        "isSolid": true,
        "moving": true,
        "axis": "x",
        "distance": 5.2,
        "speed": 0.7,
        "phase": 0.45,
        "size": {
          "x": 2.7,
          "y": 1,
          "z": 2
        },
        "dimensions": {
          "x": 2.7,
          "y": 1,
          "z": 2
        },
        "safeRect": {
          "x": 6,
          "z": 0,
          "width": 2.7,
          "depth": 2
        }
      }
    ],
    "Coin": [
      {
        "name": "level_19_peruta_1",
        "position": {
          "x": -25,
          "y": 3.04,
          "z": -4.8
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
        "name": "level_19_peruta_2",
        "position": {
          "x": -19.5,
          "y": 3.3,
          "z": -1.3
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
        "name": "level_19_peruta_3",
        "position": {
          "x": -13.5,
          "y": 3.56,
          "z": 2.6
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
        "name": "level_19_peruta_4",
        "position": {
          "x": -7.4,
          "y": 3.8,
          "z": -3.2
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
        "name": "level_19_peruta_5",
        "position": {
          "x": -1,
          "y": 4.04,
          "z": 3.8
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
        "name": "level_19_peruta_6",
        "position": {
          "x": 6,
          "y": 4.26,
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
      },
      {
        "name": "level_19_peruta_7",
        "position": {
          "x": 13,
          "y": 4.42,
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
      },
      {
        "name": "level_19_peruta_8",
        "position": {
          "x": 20,
          "y": 4.56,
          "z": 1.6
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
        "name": "level_19_tzedakah_box",
        "position": {
          "x": 20,
          "y": 4.39,
          "z": 1.6
        },
        "reward": 24,
        "proximity": 1.5
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_19_return_gate",
        "position": {
          "x": 29.7,
          "y": 4.01,
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
        "name": "level_19_deep_fall_reset",
        "position": {
          "x": -2.25,
          "y": -7.6,
          "z": -0.5
        },
        "width": 113.5,
        "height": 1,
        "depth": 54.6,
        "targetPosition": {
          "x": -33,
          "y": 2.52,
          "z": 0
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_19_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 8
    }
  ]
};
