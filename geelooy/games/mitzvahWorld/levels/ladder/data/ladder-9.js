// B"H
/** @file ladder-9.js - built from manual lava source level09.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-9",
  "shaym": "ladder-9",
  "title": "Tes Split Choice",
  "description": "Two side choices manually converge through a moving bridge.",
  "nivrayim": {
    "Chossid": [
      {
        "name": "player",
        "path": "https://models-3122d.web.app/chossid.glb?k=2",
        "position": {
          "x": -26,
          "y": 1.88,
          "z": 2.4
        },
        "rotation": {
          "y": 1.5707963267948966
        },
        "visualGroundBiasY": -0.12,
        "dynamicSolidRadius": 0.28,
        "modelScale": 1,
        "heesHawveh": true,
        "cameraDistance": 5.8,
        "cameraTheta": 45,
        "cameraPhi": 30,
        "cameraTargetHeight": 1.25,
        "ignoreCameraCollision": true
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "level_9_basalt_lava_basin",
        "position": {
          "x": -0.75,
          "y": -0.92,
          "z": 0
        },
        "width": 90.5,
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
        "name": "level_9_visible_lava_hazard",
        "position": {
          "x": -0.75,
          "y": -0.34,
          "z": 0
        },
        "width": 92.5,
        "depth": 48.6,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -26,
          "y": 1.88,
          "z": 2.4
        },
        "startFeet": {
          "x": -26,
          "y": 1.88,
          "z": 2.4
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l9_start_split_gate",
        "position": {
          "x": -26,
          "y": 1.3,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6.2,
        "color": 13673572,
        "textureSeed": "l9_start_split_gate",
        "isSolid": true,
        "safeRect": {
          "x": -26,
          "z": 0,
          "width": 9,
          "depth": 6.2
        }
      },
      {
        "name": "l9_upper_choice_a",
        "position": {
          "x": -18,
          "y": 1.5,
          "z": 4.3
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.1,
        "color": 12159308,
        "textureSeed": "l9_upper_choice_a",
        "isSolid": true,
        "safeRect": {
          "x": -18,
          "z": 4.3,
          "width": 4.8,
          "depth": 3.1
        }
      },
      {
        "name": "l9_lower_choice_a",
        "position": {
          "x": -18,
          "y": 1.5,
          "z": -4.3
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.1,
        "color": 12159308,
        "textureSeed": "l9_lower_choice_a",
        "isSolid": true,
        "safeRect": {
          "x": -18,
          "z": -4.3,
          "width": 4.8,
          "depth": 3.1
        }
      },
      {
        "name": "l9_choice_merge",
        "position": {
          "x": -9.5,
          "y": 1.72,
          "z": 0
        },
        "width": 5.2,
        "height": 1,
        "depth": 3.3,
        "color": 12159308,
        "textureSeed": "l9_choice_merge",
        "isSolid": true,
        "safeRect": {
          "x": -9.5,
          "z": 0,
          "width": 5.2,
          "depth": 3.3
        }
      },
      {
        "name": "l9_upper_choice_b",
        "position": {
          "x": 7,
          "y": 2.06,
          "z": 3.8
        },
        "width": 4.5,
        "height": 1,
        "depth": 3,
        "color": 12159308,
        "textureSeed": "l9_upper_choice_b",
        "isSolid": true,
        "safeRect": {
          "x": 7,
          "z": 3.8,
          "width": 4.5,
          "depth": 3
        }
      },
      {
        "name": "l9_lower_choice_b",
        "position": {
          "x": 7,
          "y": 2.06,
          "z": -3.8
        },
        "width": 4.5,
        "height": 1,
        "depth": 3,
        "color": 12159308,
        "textureSeed": "l9_lower_choice_b",
        "isSolid": true,
        "safeRect": {
          "x": 7,
          "z": -3.8,
          "width": 4.5,
          "depth": 3
        }
      },
      {
        "name": "l9_final_merge_step",
        "position": {
          "x": 15.5,
          "y": 2.22,
          "z": 0
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.2,
        "color": 12159308,
        "textureSeed": "l9_final_merge_step",
        "isSolid": true,
        "safeRect": {
          "x": 15.5,
          "z": 0,
          "width": 4.8,
          "depth": 3.2
        }
      },
      {
        "name": "l9_finish_tes_gate",
        "position": {
          "x": 24.5,
          "y": 2.34,
          "z": 0
        },
        "width": 8.8,
        "height": 1,
        "depth": 6.2,
        "color": 13673572,
        "textureSeed": "l9_finish_tes_gate",
        "isSolid": true,
        "safeRect": {
          "x": 24.5,
          "z": 0,
          "width": 8.8,
          "depth": 6.2
        }
      }
    ],
    "MovingPlatform": [
      {
        "name": "l9_merge_mover_x",
        "position": {
          "x": -1.5,
          "y": 1.9,
          "z": 0
        },
        "width": 4,
        "height": 1,
        "depth": 2.7,
        "color": 6211839,
        "textureSeed": "l9_merge_mover_x",
        "isSolid": true,
        "moving": true,
        "axis": "x",
        "distance": 3.2,
        "speed": 0.5,
        "phase": 0.25,
        "size": {
          "x": 4,
          "y": 1,
          "z": 2.7
        },
        "dimensions": {
          "x": 4,
          "y": 1,
          "z": 2.7
        },
        "safeRect": {
          "x": -1.5,
          "z": 0,
          "width": 4,
          "depth": 2.7
        }
      }
    ],
    "Coin": [
      {
        "name": "level_9_peruta_1",
        "position": {
          "x": -18,
          "y": 2.72,
          "z": 4.3
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
        "name": "level_9_peruta_2",
        "position": {
          "x": -18,
          "y": 2.72,
          "z": -4.3
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
        "name": "level_9_peruta_3",
        "position": {
          "x": -9.5,
          "y": 2.94,
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
        "name": "level_9_peruta_4",
        "position": {
          "x": -1.5,
          "y": 3.12,
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
        "name": "level_9_peruta_5",
        "position": {
          "x": 7,
          "y": 3.28,
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
        "name": "level_9_peruta_6",
        "position": {
          "x": 7,
          "y": 3.28,
          "z": -3.8
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
        "name": "level_9_peruta_7",
        "position": {
          "x": 15.5,
          "y": 3.44,
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
        "name": "level_9_tzedakah_box",
        "position": {
          "x": 15.5,
          "y": 3.27,
          "z": 0
        },
        "reward": 14,
        "proximity": 1.5
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_9_return_gate",
        "position": {
          "x": 25.7,
          "y": 2.89,
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
        "name": "level_9_deep_fall_reset",
        "position": {
          "x": -0.75,
          "y": -7.6,
          "z": 0
        },
        "width": 102.5,
        "height": 1,
        "depth": 54.6,
        "targetPosition": {
          "x": -26,
          "y": 1.88,
          "z": 2.4
        },
        "resetPosition": {
          "x": -26,
          "y": 1.88,
          "z": 2.4
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_9_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 7
    }
  ]
};
