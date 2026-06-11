// B"H
/** @file ladder-11.js - built from manual lava source level11.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-11",
  "shaym": "ladder-11",
  "title": "Kaf Offset Anvils",
  "description": "Offset anvils with crumb landings and a measured cross mover.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 11",
    "missionText": "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    "hintText": "Use the joystick, read the platform colors, and never trust the lava.",
    "difficultyTier": "precision",
    "estimatedDifficulty": 13.3,
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
    "startPlatform": "l11_start_kaf_anvil",
    "finishPlatform": "l11_finish_kaf_seat",
    "rewardPlatform": "l11_final_anvil_read_hard",
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
          "x": -28,
          "y": 1.93,
          "z": 2.36
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
        "name": "level_11_basalt_lava_basin",
        "position": {
          "x": -1.85,
          "y": -0.92,
          "z": 0
        },
        "width": 92.3,
        "depth": 47.4,
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
        "name": "level_11_visible_lava_hazard",
        "position": {
          "x": -1.85,
          "y": -0.34,
          "z": 0
        },
        "width": 94.3,
        "depth": 49.4,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -28,
          "y": 1.93,
          "z": 2.36
        },
        "startFeet": {
          "x": -28,
          "y": 1.93,
          "z": 2.36
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l11_start_kaf_anvil",
        "position": {
          "x": -28,
          "y": 1.35,
          "z": 0
        },
        "width": 8.8,
        "height": 1,
        "depth": 5.9,
        "color": 4177775,
        "textureSeed": "start_l11_start_kaf_anvil",
        "isSolid": true,
        "safeRect": {
          "x": -28,
          "z": 0,
          "width": 8.8,
          "depth": 5.9
        },
        "visualRoles": [
          "start"
        ],
        "visualRole": "start",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe start platform"
      },
      {
        "name": "l11_high_left_anvil_hard",
        "position": {
          "x": -20.1,
          "y": 1.62,
          "z": 4.7
        },
        "width": 4.1,
        "height": 1,
        "depth": 2.65,
        "color": 12159308,
        "textureSeed": "path_l11_high_left_anvil_hard",
        "isSolid": true,
        "safeRect": {
          "x": -20.1,
          "z": 4.7,
          "width": 4.1,
          "depth": 2.65
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l11_tiny_center_spark_hard",
        "position": {
          "x": -13.3,
          "y": 1.86,
          "z": 0.6
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "crumb_l11_tiny_center_spark_hard",
        "isSolid": true,
        "safeRect": {
          "x": -13.3,
          "z": 0.6,
          "width": 2.4,
          "depth": 2.2
        },
        "visualRoles": [
          "crumb"
        ],
        "visualRole": "crumb",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Small precision platform"
      },
      {
        "name": "l11_low_right_anvil_hard",
        "position": {
          "x": -6.3,
          "y": 2.08,
          "z": -4.7
        },
        "width": 4,
        "height": 1,
        "depth": 2.6,
        "color": 12159308,
        "textureSeed": "path_l11_low_right_anvil_hard",
        "isSolid": true,
        "safeRect": {
          "x": -6.3,
          "z": -4.7,
          "width": 4,
          "depth": 2.6
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l11_tiny_north_spark_hard",
        "position": {
          "x": 8.4,
          "y": 2.5,
          "z": 4.1
        },
        "width": 2.4,
        "height": 1,
        "depth": 2.2,
        "color": 12880978,
        "textureSeed": "crumb_l11_tiny_north_spark_hard",
        "isSolid": true,
        "safeRect": {
          "x": 8.4,
          "z": 4.1,
          "width": 2.4,
          "depth": 2.2
        },
        "visualRoles": [
          "crumb"
        ],
        "visualRole": "crumb",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Small precision platform"
      },
      {
        "name": "l11_final_anvil_read_hard",
        "position": {
          "x": 15.7,
          "y": 2.68,
          "z": -1.9
        },
        "width": 3.8,
        "height": 1,
        "depth": 2.45,
        "color": 16762957,
        "textureSeed": "path_reward_l11_final_anvil_read_hard",
        "isSolid": true,
        "safeRect": {
          "x": 15.7,
          "z": -1.9,
          "width": 3.8,
          "depth": 2.45
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
        "name": "l11_finish_kaf_seat",
        "position": {
          "x": 24.3,
          "y": 2.84,
          "z": 0
        },
        "width": 8.1,
        "height": 1,
        "depth": 5.6,
        "color": 7536628,
        "textureSeed": "finish_l11_finish_kaf_seat",
        "isSolid": true,
        "safeRect": {
          "x": 24.3,
          "z": 0,
          "width": 8.1,
          "depth": 5.6
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
        "name": "l11_cross_mover_south_hard",
        "position": {
          "x": 1.3,
          "y": 2.3,
          "z": -0.7
        },
        "width": 3.1,
        "height": 1,
        "depth": 2.15,
        "color": 6211839,
        "textureSeed": "moving_l11_cross_mover_south_hard",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "z",
        "distance": 4.7,
        "speed": 0.64,
        "phase": 0.2,
        "size": {
          "x": 3.1,
          "y": 1,
          "z": 2.15
        },
        "dimensions": {
          "x": 3.1,
          "y": 1,
          "z": 2.15
        },
        "safeRect": {
          "x": 1.3,
          "z": -0.7,
          "width": 3.1,
          "depth": 2.15
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
        "name": "level_11_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -20.1,
          "y": 2.84,
          "z": 4.7
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
        "name": "level_11_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -13.3,
          "y": 3.08,
          "z": 0.6
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
        "name": "level_11_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -6.3,
          "y": 3.3,
          "z": -4.7
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
        "name": "level_11_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 1.3,
          "y": 3.52,
          "z": -0.7
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
        "name": "level_11_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 8.4,
          "y": 3.72,
          "z": 4.1
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
        "name": "level_11_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 15.7,
          "y": 3.9,
          "z": -1.9
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
        "name": "level_11_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 15.7,
          "y": 3.73,
          "z": -1.9
        },
        "reward": 16,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_11_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 11",
        "position": {
          "x": 25.5,
          "y": 3.39,
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
        "name": "level_11_deep_fall_reset",
        "position": {
          "x": -1.85,
          "y": -7.6,
          "z": 0
        },
        "width": 104.3,
        "height": 1,
        "depth": 55.4,
        "targetPosition": {
          "x": -28,
          "y": 1.93,
          "z": 2.36
        },
        "resetPosition": {
          "x": -28,
          "y": 1.93,
          "z": 2.36
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_11_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_11_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_11_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
