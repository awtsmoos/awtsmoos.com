// B"H
/** @file ladder-7.js - built from manual lava source level07.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-7",
  "shaym": "ladder-7",
  "title": "Zayin Double Ferry",
  "description": "Two hand-placed moving ferries with rest landings.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 7",
    "missionText": "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    "hintText": "Use the joystick, read the platform colors, and never trust the lava.",
    "difficultyTier": "learning-motion",
    "estimatedDifficulty": 13,
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
    "startPlatform": "l7_start_blue_court",
    "finishPlatform": "l7_finish_zayin_court",
    "rewardPlatform": "l7_right_static_ledge",
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
          "x": -25,
          "y": 1.83,
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
        "name": "level_7_basalt_lava_basin",
        "position": {
          "x": 0,
          "y": -0.92,
          "z": 0.2
        },
        "width": 90,
        "depth": 44.6,
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
        "name": "level_7_visible_lava_hazard",
        "position": {
          "x": 0,
          "y": -0.34,
          "z": 0.2
        },
        "width": 92,
        "depth": 46.6,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -25,
          "y": 1.83,
          "z": 2.4
        },
        "startFeet": {
          "x": -25,
          "y": 1.83,
          "z": 2.4
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l7_start_blue_court",
        "position": {
          "x": -25,
          "y": 1.25,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6.2,
        "color": 4177775,
        "textureSeed": "start_l7_start_blue_court",
        "isSolid": true,
        "safeRect": {
          "x": -25,
          "z": 0,
          "width": 9,
          "depth": 6.2
        },
        "visualRoles": [
          "start"
        ],
        "visualRole": "start",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe start platform"
      },
      {
        "name": "l7_left_static_ledge",
        "position": {
          "x": -18,
          "y": 1.44,
          "z": 3.5
        },
        "width": 5,
        "height": 1,
        "depth": 3.2,
        "color": 12159308,
        "textureSeed": "path_l7_left_static_ledge",
        "isSolid": true,
        "safeRect": {
          "x": -18,
          "z": 3.5,
          "width": 5,
          "depth": 3.2
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l7_pre_ferry_anchor",
        "position": {
          "x": -12,
          "y": 1.54,
          "z": 0
        },
        "width": 4.8,
        "height": 1,
        "depth": 3,
        "color": 12159308,
        "textureSeed": "path_l7_pre_ferry_anchor",
        "isSolid": true,
        "safeRect": {
          "x": -12,
          "z": 0,
          "width": 4.8,
          "depth": 3
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l7_center_rest",
        "position": {
          "x": 1.5,
          "y": 1.76,
          "z": -3.1
        },
        "width": 5.2,
        "height": 1,
        "depth": 3.3,
        "color": 12159308,
        "textureSeed": "path_l7_center_rest",
        "isSolid": true,
        "safeRect": {
          "x": 1.5,
          "z": -3.1,
          "width": 5.2,
          "depth": 3.3
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l7_right_static_ledge",
        "position": {
          "x": 16,
          "y": 2.08,
          "z": 3
        },
        "width": 4.7,
        "height": 1,
        "depth": 3.1,
        "color": 16762957,
        "textureSeed": "path_reward_l7_right_static_ledge",
        "isSolid": true,
        "safeRect": {
          "x": 16,
          "z": 3,
          "width": 4.7,
          "depth": 3.1
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
        "name": "l7_finish_zayin_court",
        "position": {
          "x": 25,
          "y": 2.18,
          "z": 0
        },
        "width": 8.8,
        "height": 1,
        "depth": 6.2,
        "color": 7536628,
        "textureSeed": "finish_l7_finish_zayin_court",
        "isSolid": true,
        "safeRect": {
          "x": 25,
          "z": 0,
          "width": 8.8,
          "depth": 6.2
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
        "name": "l7_horizontal_ferry",
        "position": {
          "x": -6,
          "y": 1.62,
          "z": 0
        },
        "width": 4.3,
        "height": 1,
        "depth": 2.7,
        "color": 6211839,
        "textureSeed": "moving_l7_horizontal_ferry",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "x",
        "distance": 2.6,
        "speed": 0.45,
        "phase": 0.2,
        "size": {
          "x": 4.3,
          "y": 1,
          "z": 2.7
        },
        "dimensions": {
          "x": 4.3,
          "y": 1,
          "z": 2.7
        },
        "safeRect": {
          "x": -6,
          "z": 0,
          "width": 4.3,
          "depth": 2.7
        },
        "visualRoles": [
          "moving"
        ],
        "visualRole": "moving",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Moving safe platform"
      },
      {
        "name": "l7_vertical_ferry",
        "position": {
          "x": 8.5,
          "y": 1.94,
          "z": 0
        },
        "width": 4,
        "height": 1,
        "depth": 2.6,
        "color": 6211839,
        "textureSeed": "moving_l7_vertical_ferry",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "z",
        "distance": 3.1,
        "speed": 0.48,
        "phase": 0.45,
        "size": {
          "x": 4,
          "y": 1,
          "z": 2.6
        },
        "dimensions": {
          "x": 4,
          "y": 1,
          "z": 2.6
        },
        "safeRect": {
          "x": 8.5,
          "z": 0,
          "width": 4,
          "depth": 2.6
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
        "name": "level_7_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -18,
          "y": 2.66,
          "z": 3.5
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
        "name": "level_7_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -12,
          "y": 2.76,
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
      },
      {
        "name": "level_7_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -6,
          "y": 2.84,
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
      },
      {
        "name": "level_7_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 1.5,
          "y": 2.98,
          "z": -3.1
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
        "name": "level_7_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 8.5,
          "y": 3.16,
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
      },
      {
        "name": "level_7_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 16,
          "y": 3.3,
          "z": 3
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
        "name": "level_7_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 16,
          "y": 3.13,
          "z": 3
        },
        "reward": 12,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_7_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 7",
        "position": {
          "x": 26.2,
          "y": 2.73,
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
        "name": "level_7_deep_fall_reset",
        "position": {
          "x": 0,
          "y": -7.6,
          "z": 0.2
        },
        "width": 102,
        "height": 1,
        "depth": 52.6,
        "targetPosition": {
          "x": -25,
          "y": 1.83,
          "z": 2.4
        },
        "resetPosition": {
          "x": -25,
          "y": 1.83,
          "z": 2.4
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_7_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_7_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_7_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
