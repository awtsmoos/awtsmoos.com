// B"H
/** @file ladder-10.js - built from manual lava source level10.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-10",
  "shaym": "ladder-10",
  "title": "Yud Summit Exam",
  "description": "A measured summit exam: harder than Tes, gentler than Kaf.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 10",
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
    "startPlatform": "l10_start_yud_square",
    "finishPlatform": "l10_finish_yud_summit",
    "rewardPlatform": "l10_summit_rest_measured",
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
          "x": -27.2,
          "y": 1.93,
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
        "name": "level_10_basalt_lava_basin",
        "position": {
          "x": -0.8,
          "y": -0.92,
          "z": 0.05
        },
        "width": 92.8,
        "depth": 43.5,
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
        "name": "level_10_visible_lava_hazard",
        "position": {
          "x": -0.8,
          "y": -0.34,
          "z": 0.05
        },
        "width": 94.8,
        "depth": 45.5,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -27.2,
          "y": 1.93,
          "z": 2.4
        },
        "startFeet": {
          "x": -27.2,
          "y": 1.93,
          "z": 2.4
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l10_start_yud_square",
        "position": {
          "x": -27.2,
          "y": 1.35,
          "z": 0
        },
        "width": 8.9,
        "height": 1,
        "depth": 6.1,
        "color": 4177775,
        "textureSeed": "start_l10_start_yud_square",
        "isSolid": true,
        "safeRect": {
          "x": -27.2,
          "z": 0,
          "width": 8.9,
          "depth": 6.1
        },
        "visualRoles": [
          "start"
        ],
        "visualRole": "start",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe start platform"
      },
      {
        "name": "l10_riser_one_measured",
        "position": {
          "x": -19.4,
          "y": 1.62,
          "z": 2.25
        },
        "width": 4.6,
        "height": 1,
        "depth": 3,
        "color": 12159308,
        "textureSeed": "path_l10_riser_one_measured",
        "isSolid": true,
        "safeRect": {
          "x": -19.4,
          "z": 2.25,
          "width": 4.6,
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
        "name": "l10_riser_two_measured",
        "position": {
          "x": -12,
          "y": 1.88,
          "z": -2.65
        },
        "width": 4.3,
        "height": 1,
        "depth": 2.85,
        "color": 12159308,
        "textureSeed": "path_l10_riser_two_measured",
        "isSolid": true,
        "safeRect": {
          "x": -12,
          "z": -2.65,
          "width": 4.3,
          "depth": 2.85
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l10_riser_three_measured",
        "position": {
          "x": -4.7,
          "y": 2.14,
          "z": 2.8
        },
        "width": 4.1,
        "height": 1,
        "depth": 2.75,
        "color": 12159308,
        "textureSeed": "path_l10_riser_three_measured",
        "isSolid": true,
        "safeRect": {
          "x": -4.7,
          "z": 2.8,
          "width": 4.1,
          "depth": 2.75
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l10_summit_rest_measured",
        "position": {
          "x": 10.1,
          "y": 2.6,
          "z": -2.7
        },
        "width": 4.1,
        "height": 1,
        "depth": 2.75,
        "color": 16762957,
        "textureSeed": "path_reward_l10_summit_rest_measured",
        "isSolid": true,
        "safeRect": {
          "x": 10.1,
          "z": -2.7,
          "width": 4.1,
          "depth": 2.75
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
        "name": "l10_finish_yud_summit",
        "position": {
          "x": 25.6,
          "y": 2.92,
          "z": 0
        },
        "width": 8.3,
        "height": 1,
        "depth": 5.9,
        "color": 7536628,
        "textureSeed": "finish_l10_finish_yud_summit",
        "isSolid": true,
        "safeRect": {
          "x": 25.6,
          "z": 0,
          "width": 8.3,
          "depth": 5.9
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
        "name": "l10_summit_ferry_a_measured",
        "position": {
          "x": 2.7,
          "y": 2.38,
          "z": -0.2
        },
        "width": 3.4,
        "height": 1,
        "depth": 2.35,
        "color": 6211839,
        "textureSeed": "moving_l10_summit_ferry_a_measured",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "z",
        "distance": 3.9,
        "speed": 0.58,
        "phase": 0.1,
        "size": {
          "x": 3.4,
          "y": 1,
          "z": 2.35
        },
        "dimensions": {
          "x": 3.4,
          "y": 1,
          "z": 2.35
        },
        "safeRect": {
          "x": 2.7,
          "z": -0.2,
          "width": 3.4,
          "depth": 2.35
        },
        "visualRoles": [
          "moving"
        ],
        "visualRole": "moving",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Moving safe platform"
      },
      {
        "name": "l10_summit_ferry_b_measured",
        "position": {
          "x": 17.3,
          "y": 2.78,
          "z": 0.9
        },
        "width": 3.3,
        "height": 1,
        "depth": 2.3,
        "color": 6211839,
        "textureSeed": "moving_l10_summit_ferry_b_measured",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "x",
        "distance": 3.9,
        "speed": 0.6,
        "phase": 0.4,
        "size": {
          "x": 3.3,
          "y": 1,
          "z": 2.3
        },
        "dimensions": {
          "x": 3.3,
          "y": 1,
          "z": 2.3
        },
        "safeRect": {
          "x": 17.3,
          "z": 0.9,
          "width": 3.3,
          "depth": 2.3
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
        "name": "level_10_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -19.4,
          "y": 2.84,
          "z": 2.25
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
        "name": "level_10_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -12,
          "y": 3.1,
          "z": -2.65
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
        "name": "level_10_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -4.7,
          "y": 3.36,
          "z": 2.8
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
        "name": "level_10_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 2.7,
          "y": 3.6,
          "z": -0.2
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
        "name": "level_10_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 10.1,
          "y": 3.82,
          "z": -2.7
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
        "name": "level_10_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 17.3,
          "y": 4,
          "z": 0.9
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
        "name": "level_10_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 10.1,
          "y": 3.65,
          "z": -2.7
        },
        "reward": 15,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_10_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 10",
        "position": {
          "x": 26.8,
          "y": 3.47,
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
        "name": "level_10_deep_fall_reset",
        "position": {
          "x": -0.8,
          "y": -7.6,
          "z": 0.05
        },
        "width": 104.8,
        "height": 1,
        "depth": 52,
        "targetPosition": {
          "x": -27.2,
          "y": 1.93,
          "z": 2.4
        },
        "resetPosition": {
          "x": -27.2,
          "y": 1.93,
          "z": 2.4
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_10_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_10_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_10_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
