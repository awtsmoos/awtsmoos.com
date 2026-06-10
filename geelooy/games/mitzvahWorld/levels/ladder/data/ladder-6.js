// B"H
/** @file ladder-6.js - built from manual lava source level06.js. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "ladder-6",
  "shaym": "ladder-6",
  "title": "Vav First Motion",
  "description": "Manual first moving platform with safe anchors before and after.",
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
        "cameraDistance": 5.8,
        "cameraTheta": 45,
        "cameraPhi": 30,
        "cameraTargetHeight": 1.25,
        "ignoreCameraCollision": true
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "level_6_basalt_lava_basin",
        "position": {
          "x": 0.5,
          "y": -0.92,
          "z": 0
        },
        "width": 91,
        "depth": 43,
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
        "name": "level_6_visible_lava_hazard",
        "position": {
          "x": 0.5,
          "y": -0.34,
          "z": 0
        },
        "width": 93,
        "depth": 45,
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
        "name": "l6_start_stable_teacher",
        "position": {
          "x": -25,
          "y": 1.25,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6.5,
        "color": 13673572,
        "textureSeed": "l6_start_stable_teacher",
        "isSolid": true,
        "safeRect": {
          "x": -25,
          "z": 0,
          "width": 9,
          "depth": 6.5
        }
      },
      {
        "name": "l6_static_before_motion",
        "position": {
          "x": -18,
          "y": 1.42,
          "z": 2.5
        },
        "width": 5.2,
        "height": 1,
        "depth": 3.4,
        "color": 12159308,
        "textureSeed": "l6_static_before_motion",
        "isSolid": true,
        "safeRect": {
          "x": -18,
          "z": 2.5,
          "width": 5.2,
          "depth": 3.4
        }
      },
      {
        "name": "l6_static_second_anchor",
        "position": {
          "x": -11,
          "y": 1.55,
          "z": -2.5
        },
        "width": 5,
        "height": 1,
        "depth": 3.2,
        "color": 12159308,
        "textureSeed": "l6_static_second_anchor",
        "isSolid": true,
        "safeRect": {
          "x": -11,
          "z": -2.5,
          "width": 5,
          "depth": 3.2
        }
      },
      {
        "name": "l6_after_motion_rest",
        "position": {
          "x": 4,
          "y": 1.78,
          "z": 2.2
        },
        "width": 5.2,
        "height": 1,
        "depth": 3.5,
        "color": 12159308,
        "textureSeed": "l6_after_motion_rest",
        "isSolid": true,
        "safeRect": {
          "x": 4,
          "z": 2.2,
          "width": 5.2,
          "depth": 3.5
        }
      },
      {
        "name": "l6_final_static_read",
        "position": {
          "x": 11,
          "y": 1.92,
          "z": -1.8
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.2,
        "color": 12159308,
        "textureSeed": "l6_final_static_read",
        "isSolid": true,
        "safeRect": {
          "x": 11,
          "z": -1.8,
          "width": 4.8,
          "depth": 3.2
        }
      },
      {
        "name": "l6_pre_finish_anchor",
        "position": {
          "x": 18,
          "y": 2,
          "z": 1.2
        },
        "width": 4.8,
        "height": 1,
        "depth": 3.2,
        "color": 12159308,
        "textureSeed": "l6_pre_finish_anchor",
        "isSolid": true,
        "safeRect": {
          "x": 18,
          "z": 1.2,
          "width": 4.8,
          "depth": 3.2
        }
      },
      {
        "name": "l6_finish_vav_landing",
        "position": {
          "x": 26,
          "y": 2.08,
          "z": 0
        },
        "width": 9,
        "height": 1,
        "depth": 6.3,
        "color": 13673572,
        "textureSeed": "l6_finish_vav_landing",
        "isSolid": true,
        "safeRect": {
          "x": 26,
          "z": 0,
          "width": 9,
          "depth": 6.3
        }
      }
    ],
    "MovingPlatform": [
      {
        "name": "l6_first_moving_bridge_z",
        "position": {
          "x": -4,
          "y": 1.65,
          "z": 0
        },
        "width": 4.2,
        "height": 1,
        "depth": 2.8,
        "color": 6211839,
        "textureSeed": "l6_first_moving_bridge_z",
        "isSolid": true,
        "moving": true,
        "axis": "z",
        "distance": 2.4,
        "speed": 0.42,
        "phase": 0,
        "size": {
          "x": 4.2,
          "y": 1,
          "z": 2.8
        },
        "dimensions": {
          "x": 4.2,
          "y": 1,
          "z": 2.8
        },
        "safeRect": {
          "x": -4,
          "z": 0,
          "width": 4.2,
          "depth": 2.8
        }
      }
    ],
    "Coin": [
      {
        "name": "level_6_peruta_1",
        "position": {
          "x": -18,
          "y": 2.64,
          "z": 2.5
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
        "name": "level_6_peruta_2",
        "position": {
          "x": -11,
          "y": 2.77,
          "z": -2.5
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
        "name": "level_6_peruta_3",
        "position": {
          "x": -4,
          "y": 2.87,
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
        "name": "level_6_peruta_4",
        "position": {
          "x": 4,
          "y": 3,
          "z": 2.2
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
        "name": "level_6_peruta_5",
        "position": {
          "x": 11,
          "y": 3.14,
          "z": -1.8
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
        "name": "level_6_peruta_6",
        "position": {
          "x": 18,
          "y": 3.22,
          "z": 1.2
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
        "name": "level_6_tzedakah_box",
        "position": {
          "x": 18,
          "y": 3.05,
          "z": 1.2
        },
        "reward": 11,
        "proximity": 1.5
      }
    ],
    "InteractiveDoor": [
      {
        "name": "level_6_return_gate",
        "position": {
          "x": 27.2,
          "y": 2.63,
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
        "name": "level_6_deep_fall_reset",
        "position": {
          "x": 0.5,
          "y": -7.6,
          "z": 0
        },
        "width": 103,
        "height": 1,
        "depth": 52,
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
      "id": "level_6_collect_perutos",
      "type": "collect",
      "target": "Coin",
      "count": 6
    }
  ]
};
