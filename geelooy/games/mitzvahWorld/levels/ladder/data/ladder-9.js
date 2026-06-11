// B"H
/** @file ladder-9.js - built from manual lava source level09.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-9",
  "shaym": "ladder-9",
  "title": "Tes Split Choice",
  "description": "Two side choices manually converge through a moving bridge.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 9",
    "missionText": "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    "hintText": "Use the joystick, read the platform colors, and never trust the lava.",
    "difficultyTier": "learning-motion",
    "estimatedDifficulty": 11.5,
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
    "startPlatform": "l9_start_split_gate",
    "finishPlatform": "l9_finish_tes_gate",
    "rewardPlatform": "l9_final_merge_step",
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
        "color": 4177775,
        "textureSeed": "start_l9_start_split_gate",
        "isSolid": true,
        "safeRect": {
          "x": -26,
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
        "textureSeed": "path_l9_upper_choice_a",
        "isSolid": true,
        "safeRect": {
          "x": -18,
          "z": 4.3,
          "width": 4.8,
          "depth": 3.1
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
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
        "textureSeed": "path_l9_lower_choice_a",
        "isSolid": true,
        "safeRect": {
          "x": -18,
          "z": -4.3,
          "width": 4.8,
          "depth": 3.1
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
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
        "textureSeed": "path_l9_choice_merge",
        "isSolid": true,
        "safeRect": {
          "x": -9.5,
          "z": 0,
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
        "textureSeed": "path_l9_upper_choice_b",
        "isSolid": true,
        "safeRect": {
          "x": 7,
          "z": 3.8,
          "width": 4.5,
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
        "textureSeed": "path_l9_lower_choice_b",
        "isSolid": true,
        "safeRect": {
          "x": 7,
          "z": -3.8,
          "width": 4.5,
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
        "name": "l9_final_merge_step",
        "position": {
          "x": 15.5,
          "y": 2.22,
          "z": 0
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.2,
        "color": 16762957,
        "textureSeed": "path_reward_l9_final_merge_step",
        "isSolid": true,
        "safeRect": {
          "x": 15.5,
          "z": 0,
          "width": 4.8,
          "depth": 3.2
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
        "name": "l9_finish_tes_gate",
        "position": {
          "x": 24.5,
          "y": 2.34,
          "z": 0
        },
        "width": 8.8,
        "height": 1,
        "depth": 6.2,
        "color": 7536628,
        "textureSeed": "finish_l9_finish_tes_gate",
        "isSolid": true,
        "safeRect": {
          "x": 24.5,
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
        "textureSeed": "moving_l9_merge_mover_x",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
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
        "name": "level_9_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -18,
          "y": 2.72,
          "z": 4.3
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
        "name": "level_9_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -18,
          "y": 2.72,
          "z": -4.3
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
        "name": "level_9_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -9.5,
          "y": 2.94,
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
        "name": "level_9_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -1.5,
          "y": 3.12,
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
        "name": "level_9_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 7,
          "y": 3.28,
          "z": 3.8
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
        "name": "level_9_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 7,
          "y": 3.28,
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
        "name": "level_9_peruta_7",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 15.5,
          "y": 3.44,
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
        "name": "level_9_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 15.5,
          "y": 3.27,
          "z": 0
        },
        "reward": 14,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_9_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 9",
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
        "isSolid": false,
        "uiPulse": "mezuzah-cyan"
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
      "count": 7,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_9_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_9_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
