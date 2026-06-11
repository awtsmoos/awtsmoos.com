// B"H
/** @file ladder-12.js - built from manual lava source level12.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-12",
  "shaym": "ladder-12",
  "title": "Lamed Turnback Teeth",
  "description": "A sharper turnback ladder with longer offsets after Kaf.",
  "presentation": {
    "theme": "lava-ladder-golden-village",
    "biome": "lava",
    "lighting": "golden-hour-lava-bounce",
    "titleCard": "Lava Ladder 12",
    "missionText": "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    "hintText": "Use the joystick, read the platform colors, and never trust the lava.",
    "difficultyTier": "precision",
    "estimatedDifficulty": 10.5,
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
    "startPlatform": "l12_start_lamed_base",
    "finishPlatform": "l12_finish_lamed_roof",
    "rewardPlatform": "l12_final_lamed_rung_sharp",
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
          "y": 1.96,
          "z": 2.32
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
        "name": "level_12_basalt_lava_basin",
        "position": {
          "x": -2,
          "y": -0.92,
          "z": -0.15
        },
        "width": 94,
        "depth": 47.9,
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
        "name": "level_12_visible_lava_hazard",
        "position": {
          "x": -2,
          "y": -0.34,
          "z": -0.15
        },
        "width": 96,
        "depth": 49.9,
        "height": 0.28,
        "groundY": -0.48,
        "lava": true,
        "pad": 0.03,
        "opacity": 0.98,
        "isSolid": false,
        "resetPosition": {
          "x": -29,
          "y": 1.96,
          "z": 2.32
        },
        "startFeet": {
          "x": -29,
          "y": 1.96,
          "z": 2.32
        }
      }
    ],
    "SolidBlock": [
      {
        "name": "l12_start_lamed_base",
        "position": {
          "x": -29,
          "y": 1.38,
          "z": 0
        },
        "width": 8.6,
        "height": 1,
        "depth": 5.8,
        "color": 4177775,
        "textureSeed": "start_l12_start_lamed_base",
        "isSolid": true,
        "safeRect": {
          "x": -29,
          "z": 0,
          "width": 8.6,
          "depth": 5.8
        },
        "visualRoles": [
          "start"
        ],
        "visualRole": "start",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe start platform"
      },
      {
        "name": "l12_rung_one_sharp",
        "position": {
          "x": -21.3,
          "y": 1.68,
          "z": 4.8
        },
        "width": 4,
        "height": 1,
        "depth": 2.5,
        "color": 12159308,
        "textureSeed": "path_l12_rung_one_sharp",
        "isSolid": true,
        "safeRect": {
          "x": -21.3,
          "z": 4.8,
          "width": 4,
          "depth": 2.5
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l12_rung_two_sharp",
        "position": {
          "x": -14.4,
          "y": 1.98,
          "z": -0.8
        },
        "width": 3.8,
        "height": 1,
        "depth": 2.4,
        "color": 12159308,
        "textureSeed": "path_l12_rung_two_sharp",
        "isSolid": true,
        "safeRect": {
          "x": -14.4,
          "z": -0.8,
          "width": 3.8,
          "depth": 2.4
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l12_rung_three_sharp",
        "position": {
          "x": -7.5,
          "y": 2.28,
          "z": -5.1
        },
        "width": 3.6,
        "height": 1,
        "depth": 2.4,
        "color": 12159308,
        "textureSeed": "path_l12_rung_three_sharp",
        "isSolid": true,
        "safeRect": {
          "x": -7.5,
          "z": -5.1,
          "width": 3.6,
          "depth": 2.4
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l12_return_north_rung_sharp",
        "position": {
          "x": 8.3,
          "y": 2.82,
          "z": 4.8
        },
        "width": 3.5,
        "height": 1,
        "depth": 2.3,
        "color": 12159308,
        "textureSeed": "path_l12_return_north_rung_sharp",
        "isSolid": true,
        "safeRect": {
          "x": 8.3,
          "z": 4.8,
          "width": 3.5,
          "depth": 2.3
        },
        "visualRoles": [
          "path"
        ],
        "visualRole": "path",
        "theme": "lava-ladder-golden-village",
        "gameplayHint": "Safe path platform"
      },
      {
        "name": "l12_final_lamed_rung_sharp",
        "position": {
          "x": 16,
          "y": 3.04,
          "z": -0.8
        },
        "width": 3.5,
        "height": 1,
        "depth": 2.3,
        "color": 16762957,
        "textureSeed": "path_reward_l12_final_lamed_rung_sharp",
        "isSolid": true,
        "safeRect": {
          "x": 16,
          "z": -0.8,
          "width": 3.5,
          "depth": 2.3
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
        "name": "l12_finish_lamed_roof",
        "position": {
          "x": 25,
          "y": 3.18,
          "z": 0
        },
        "width": 8,
        "height": 1,
        "depth": 5.5,
        "color": 7536628,
        "textureSeed": "finish_l12_finish_lamed_roof",
        "isSolid": true,
        "safeRect": {
          "x": 25,
          "z": 0,
          "width": 8,
          "depth": 5.5
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
        "name": "l12_turnback_mover_sharp",
        "position": {
          "x": 0.4,
          "y": 2.58,
          "z": -0.6
        },
        "width": 3,
        "height": 1,
        "depth": 2.1,
        "color": 6211839,
        "textureSeed": "moving_l12_turnback_mover_sharp",
        "isSolid": true,
        "moving": true,
        "visualStyle": "bluePlatform",
        "axis": "x",
        "distance": 5.6,
        "speed": 0.66,
        "phase": 0.25,
        "size": {
          "x": 3,
          "y": 1,
          "z": 2.1
        },
        "dimensions": {
          "x": 3,
          "y": 1,
          "z": 2.1
        },
        "safeRect": {
          "x": 0.4,
          "z": -0.6,
          "width": 3,
          "depth": 2.1
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
        "name": "level_12_peruta_1",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -21.3,
          "y": 2.9,
          "z": 4.8
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
        "name": "level_12_peruta_2",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -14.4,
          "y": 3.2,
          "z": -0.8
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
        "name": "level_12_peruta_3",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": -7.5,
          "y": 3.5,
          "z": -5.1
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
        "name": "level_12_peruta_4",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 0.4,
          "y": 3.8,
          "z": -0.6
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
        "name": "level_12_peruta_5",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 8.3,
          "y": 4.04,
          "z": 4.8
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
        "name": "level_12_peruta_6",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 16,
          "y": 4.26,
          "z": -0.8
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
        "name": "level_12_tzedakah_box",
        "visualRole": "reward",
        "theme": "lava-ladder-golden-village",
        "position": {
          "x": 16,
          "y": 4.09,
          "z": -0.8
        },
        "reward": 17,
        "proximity": 1.5,
        "uiPulse": "tzedakah-gold"
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_12_return_gate",
        "visualRole": "finish",
        "theme": "lava-ladder-golden-village",
        "label": "Return Gate 12",
        "position": {
          "x": 26.2,
          "y": 3.73,
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
        "name": "level_12_deep_fall_reset",
        "position": {
          "x": -2,
          "y": -7.6,
          "z": -0.15
        },
        "width": 106,
        "height": 1,
        "depth": 55.9,
        "targetPosition": {
          "x": -29,
          "y": 1.96,
          "z": 2.32
        },
        "resetPosition": {
          "x": -29,
          "y": 1.96,
          "z": 2.32
        },
        "opacity": 0,
        "isSolid": false
      }
    ]
  },
  "objectives": [
    {
      "id": "level_12_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6,
      "label": "Collect the perutos",
      "icon": "coin",
      "uiOrder": 1
    },
    {
      "id": "level_12_give_tzedakah",
      "type": "interact",
      "target": "TzedakahBox",
      "count": 1,
      "label": "Give tzedakah",
      "icon": "pushkuh",
      "uiOrder": 2
    },
    {
      "id": "level_12_return_gate",
      "type": "interact",
      "target": "InteractiveDoor",
      "count": 1,
      "label": "Return through the mezuzah gate",
      "icon": "mezuzah",
      "uiOrder": 3
    }
  ]
};
