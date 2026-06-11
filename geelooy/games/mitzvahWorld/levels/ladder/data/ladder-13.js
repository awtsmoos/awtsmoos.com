// B"H
/** @file ladder-13.js - built from manual lava source level13.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-13",
  "shaym": "ladder-13",
  "title": "Mem River Stones",
  "description": "Manual stepping-stone course over a broad lava river.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 13",
    "missionText": "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    "hintText": "Use the joystick, read the platform colors, and never trust the lava.",
    "difficultyTier": "precision",
    "estimatedDifficulty": 18.2,
    "readabilityContract": [
      "green-start",
      "sandstone-path",
      "blue-moving-when-present",
      "gold-reward",
      "cyan-finish",
      "red-lava-danger"
    ]
  },
  "gameplayContract": {
    "startPlatform": "l13_start_mem_bank",
    "finishPlatform": "l13_finish_mem_bank",
    "rewardPlatform": "l13_right_bank_wide",
    "requiredVisualRoles": [
      "start",
      "path",
      "moving",
      "reward",
      "finish"
    ],
    "playerModel": "https://models-3122d.web.app/chossid.glb?k=2"
  },
  "nivrayim": {
    "Chossid": [
      {
        "name": "player",
        "path": "https://models-3122d.web.app/chossid.glb?k=2",
        "position": {
          "x": -29,
          "y": 1.98,
          "z": 2.4
        },
        "rotation": {
          "y": 1.5707963267948966
        },
        "visualGroundBiasY": -0.12,
        "dynamicSolidRadius": 0.28,
        "modelScale": 1,
        "heesHawveh": true,
        "role": "player",
        "theme": "lava-ladder-golden-village",
        "cameraDistance": 5.8,
        "cameraTheta": 45,
        "cameraPhi": 30,
        "cameraTargetHeight": 1.25,
        "ignoreCameraCollision": true
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "level_13_basalt_lava_basin",
        "position": {
          "x": -0.5,
          "y": -0.92,
          "z": 0.2
        },
        "width": 97,
        "depth": 46,
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
        "name": "level_13_visible_lava_hazard",
        "position": {
          "x": -0.5,
          "y": -0.34,
          "z": 0.2
        },
        "width": 99,
        "depth": 48,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -29,
          "y": 1.98,
          "z": 2.4
        },
        "startFeet": {
          "x": -29,
          "y": 1.98,
          "z": 2.4
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l13_start_mem_bank",
        "position": {
          "x": -29,
          "y": 1.4,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6,
        "color": 4177775,
        "textureSeed": "start_l13_start_mem_bank",
        "isSolid": true,
        "safeRect": {
          "x": -29,
          "z": 0,
          "width": 9,
          "depth": 6
        },
        "visualRoles": [
          "start"
        ],
        "visualRole": "start",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe start platform"
      },
      {
        "name": "l13_river_stone_a",
        "position": {
          "x": -22,
          "y": 1.62,
          "z": -2.8
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "path_crumb_l13_river_stone_a",
        "isSolid": true,
        "safeRect": {
          "x": -22,
          "z": -2.8,
          "width": 2.4,
          "depth": 2.2
        },
        "visualRoles": [
          "path",
          "crumb"
        ],
        "visualRole": "crumb",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform / Small precision platform"
      },
      {
        "name": "l13_river_stone_b",
        "position": {
          "x": -16.4,
          "y": 1.82,
          "z": 1.8
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "path_crumb_l13_river_stone_b",
        "isSolid": true,
        "safeRect": {
          "x": -16.4,
          "z": 1.8,
          "width": 2.4,
          "depth": 2.2
        },
        "visualRoles": [
          "path",
          "crumb"
        ],
        "visualRole": "crumb",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform / Small precision platform"
      },
      {
        "name": "l13_flat_midstone",
        "position": {
          "x": -9.8,
          "y": 2.04,
          "z": 4.2
        },
        "width": 4.1,
        "height": 1,
        "depth": 2.8,
        "color": 12159308,
        "textureSeed": "path_l13_flat_midstone",
        "isSolid": true,
        "safeRect": {
          "x": -9.8,
          "z": 4.2,
          "width": 4.1,
          "depth": 2.8
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l13_river_stone_c",
        "position": {
          "x": 5.2,
          "y": 2.44,
          "z": -3.8
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "path_crumb_l13_river_stone_c",
        "isSolid": true,
        "safeRect": {
          "x": 5.2,
          "z": -3.8,
          "width": 2.4,
          "depth": 2.2
        },
        "visualRoles": [
          "path",
          "crumb"
        ],
        "visualRole": "crumb",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform / Small precision platform"
      },
      {
        "name": "l13_right_bank_wide",
        "position": {
          "x": 12.8,
          "y": 2.62,
          "z": 1.8
        },
        "width": 4.4,
        "height": 1,
        "depth": 2.9,
        "color": 16762957,
        "textureSeed": "path_reward_l13_right_bank_wide",
        "isSolid": true,
        "safeRect": {
          "x": 12.8,
          "z": 1.8,
          "width": 4.4,
          "depth": 2.9
        },
        "visualRoles": [
          "path",
          "reward"
        ],
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform / Reward or tzedakah platform"
      },
      {
        "name": "l13_finish_mem_bank",
        "position": {
          "x": 28,
          "y": 2.9,
          "z": 0
        },
        "width": 8.2,
        "height": 1,
        "depth": 5.8,
        "color": 7536628,
        "textureSeed": "finish_l13_finish_mem_bank",
        "isSolid": true,
        "safeRect": {
          "x": 28,
          "z": 0,
          "width": 8.2,
          "depth": 5.8
        },
        "visualRoles": [
          "finish"
        ],
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Goal platform with return mezuzah"
      }
    ],
    "MovingPlatform": [
      {
        "name": "l13_slow_river_ferry",
        "position": {
          "x": -2.4,
          "y": 2.24,
          "z": 0.2
        },
        "width": 3.4,
        "height": 1,
        "depth": 2.4,
        "color": 6211839,
        "textureSeed": "moving_l13_slow_river_ferry",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "z",
        "distance": 4.2,
        "speed": 0.5,
        "phase": 0.3,
        "size": {
          "x": 3.4,
          "y": 1,
          "z": 2.4
        },
        "dimensions": {
          "x": 3.4,
          "y": 1,
          "z": 2.4
        },
        "safeRect": {
          "x": -2.4,
          "z": 0.2,
          "width": 3.4,
          "depth": 2.4
        },
        "visualRoles": [
          "moving"
        ],
        "visualRole": "moving",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Moving safe platform"
      },
      {
        "name": "l13_last_small_ferry",
        "position": {
          "x": 20,
          "y": 2.78,
          "z": 0
        },
        "width": 3.2,
        "height": 1,
        "depth": 2.2,
        "color": 6211839,
        "textureSeed": "moving_l13_last_small_ferry",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "x",
        "distance": 3.4,
        "speed": 0.58,
        "phase": 0.55,
        "size": {
          "x": 3.2,
          "y": 1,
          "z": 2.2
        },
        "dimensions": {
          "x": 3.2,
          "y": 1,
          "z": 2.2
        },
        "safeRect": {
          "x": 20,
          "z": 0,
          "width": 3.2,
          "depth": 2.2
        },
        "visualRoles": [
          "moving"
        ],
        "visualRole": "moving",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Moving safe platform"
      }
    ],
    "Coin": [
      {
        "name": "level_13_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -22,
          "y": 2.84,
          "z": -2.8
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      },
      {
        "name": "level_13_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -16.4,
          "y": 3.04,
          "z": 1.8
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      },
      {
        "name": "level_13_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -9.8,
          "y": 3.26,
          "z": 4.2
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      },
      {
        "name": "level_13_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -2.4,
          "y": 3.46,
          "z": 0.2
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      },
      {
        "name": "level_13_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 5.2,
          "y": 3.66,
          "z": -3.8
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      },
      {
        "name": "level_13_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 12.8,
          "y": 3.84,
          "z": 1.8
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      },
      {
        "name": "level_13_peruta_7",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 20,
          "y": 4,
          "z": 0
        },
        "value": 1,
        "proximity": 1.15,
        "uiPulse": "coin-spark",
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
              "color": 16762957
            }
          }
        }
      }
    ],
    "TzedakahBox": [
      {
        "name": "level_13_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 12.8,
          "y": 3.67,
          "z": 1.8
        },
        "reward": 18,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_13_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 13",
        "position": {
          "x": 29.2,
          "y": 3.45,
          "z": 0
        },
        "next": "village.json",
        "target": "village.json",
        "targetPath": "village.json",
        "proximity": 2.1,
        "height": 3.2,
        "width": 1.8,
        "isSolid": false,
        "uiPulse": "mezuzah-cyan"
      }
    ],
    "FallResetTrigger": [
      {
        "name": "level_13_deep_fall_reset",
        "position": {
          "x": -0.5,
          "y": -7.6,
          "z": 0.2
        },
        "width": 109,
        "height": 1,
        "depth": 54,
        "targetPosition": {
          "x": -29,
          "y": 1.98,
          "z": 2.4
        },
        "resetPosition": {
          "x": -29,
          "y": 1.98,
          "z": 2.4
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_13_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 7,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_13_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_13_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
