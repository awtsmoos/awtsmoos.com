// B"H
/** @file ladder-2.js - built from manual lava source level02.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-2",
  "shaym": "ladder-2",
  "title": "Beis Gentle Zigzag",
  "description": "A hand-laid zigzag where every landing is forgiving.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 2",
    "missionText": "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    "hintText": "Use the joystick, read the platform colors, and never trust the lava.",
    "difficultyTier": "intro",
    "estimatedDifficulty": 8,
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
    "startPlatform": "l2_start_wide_stone",
    "finishPlatform": "l2_finish_safe_plaza",
    "rewardPlatform": "l2_last_straight_step",
    "requiredVisualRoles": [
      "start",
      "path",
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
          "x": -23,
          "y": 1.78,
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
        "name": "level_2_basalt_lava_basin",
        "position": {
          "x": 2,
          "y": -0.92,
          "z": 0.05
        },
        "width": 90,
        "depth": 44.3,
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
        "name": "level_2_visible_lava_hazard",
        "position": {
          "x": 2,
          "y": -0.34,
          "z": 0.05
        },
        "width": 92,
        "depth": 46.3,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -23,
          "y": 1.78,
          "z": 2.4
        },
        "startFeet": {
          "x": -23,
          "y": 1.78,
          "z": 2.4
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l2_start_wide_stone",
        "position": {
          "x": -23,
          "y": 1.2,
          "z": 0
        },
        "width": 9.5,
        "height": 1,
        "depth": 6.8,
        "color": 4177775,
        "textureSeed": "start_l2_start_wide_stone",
        "isSolid": true,
        "safeRect": {
          "x": -23,
          "z": 0,
          "width": 9.5,
          "depth": 6.8
        },
        "visualRoles": [
          "start"
        ],
        "visualRole": "start",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe start platform"
      },
      {
        "name": "l2_left_green_breath",
        "position": {
          "x": -16,
          "y": 1.28,
          "z": 3.2
        },
        "width": 6.5,
        "height": 1,
        "depth": 4.6,
        "color": 12159308,
        "textureSeed": "path_l2_left_green_breath",
        "isSolid": true,
        "safeRect": {
          "x": -16,
          "z": 3.2,
          "width": 6.5,
          "depth": 4.6
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l2_right_return_step",
        "position": {
          "x": -9,
          "y": 1.36,
          "z": -3.1
        },
        "width": 6.2,
        "height": 1,
        "depth": 4.4,
        "color": 12159308,
        "textureSeed": "path_l2_right_return_step",
        "isSolid": true,
        "safeRect": {
          "x": -9,
          "z": -3.1,
          "width": 6.2,
          "depth": 4.4
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l2_center_confidence_step",
        "position": {
          "x": -2,
          "y": 1.44,
          "z": 0.2
        },
        "width": 6,
        "height": 1,
        "depth": 4.2,
        "color": 12159308,
        "textureSeed": "path_l2_center_confidence_step",
        "isSolid": true,
        "safeRect": {
          "x": -2,
          "z": 0.2,
          "width": 6,
          "depth": 4.2
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l2_left_final_step",
        "position": {
          "x": 5,
          "y": 1.52,
          "z": 3.1
        },
        "width": 5.6,
        "height": 1,
        "depth": 4.1,
        "color": 12159308,
        "textureSeed": "path_l2_left_final_step",
        "isSolid": true,
        "safeRect": {
          "x": 5,
          "z": 3.1,
          "width": 5.6,
          "depth": 4.1
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l2_right_final_step",
        "position": {
          "x": 12,
          "y": 1.58,
          "z": -2.8
        },
        "width": 5.4,
        "height": 1,
        "depth": 4,
        "color": 12159308,
        "textureSeed": "path_l2_right_final_step",
        "isSolid": true,
        "safeRect": {
          "x": 12,
          "z": -2.8,
          "width": 5.4,
          "depth": 4
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l2_last_straight_step",
        "position": {
          "x": 19,
          "y": 1.64,
          "z": 0
        },
        "width": 5.5,
        "height": 1,
        "depth": 4,
        "color": 16762957,
        "textureSeed": "path_reward_l2_last_straight_step",
        "isSolid": true,
        "safeRect": {
          "x": 19,
          "z": 0,
          "width": 5.5,
          "depth": 4
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
        "name": "l2_finish_safe_plaza",
        "position": {
          "x": 27,
          "y": 1.7,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6.4,
        "color": 7536628,
        "textureSeed": "finish_l2_finish_safe_plaza",
        "isSolid": true,
        "safeRect": {
          "x": 27,
          "z": 0,
          "width": 9,
          "depth": 6.4
        },
        "visualRoles": [
          "finish"
        ],
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Goal platform with return mezuzah"
      }
    ],
    "MovingPlatform": [],
    "Coin": [
      {
        "name": "level_2_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -15.3,
          "y": 2.5,
          "z": 3.2
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
        "name": "level_2_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -9.6,
          "y": 2.58,
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
        "name": "level_2_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -2,
          "y": 2.66,
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
        "name": "level_2_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 5,
          "y": 2.74,
          "z": 3.1
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
        "name": "level_2_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 12,
          "y": 2.8,
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
        "name": "level_2_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 19,
          "y": 2.86,
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
        "name": "level_2_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 19,
          "y": 2.69,
          "z": 0
        },
        "reward": 7,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_2_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 2",
        "position": {
          "x": 28.2,
          "y": 2.25,
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
        "name": "level_2_deep_fall_reset",
        "position": {
          "x": 2,
          "y": -7.6,
          "z": 0.05
        },
        "width": 102,
        "height": 1,
        "depth": 52.3,
        "targetPosition": {
          "x": -23,
          "y": 1.78,
          "z": 2.4
        },
        "resetPosition": {
          "x": -23,
          "y": 1.78,
          "z": 2.4
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_2_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_2_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_2_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
