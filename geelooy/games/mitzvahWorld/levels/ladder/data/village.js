// B"H
/** @file village.js - built from source/village sections. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "village.json",
  "shaym": "Village_Composed_Reference_Lambert",
  "title": "Composed Reference Lambert Village",
  "requiredPerutos": 0,
  "nextLevel": "ladder-1.json",
  "globalCoinStorageKey": "awtsmoosMitzvahGlobalCoins",
  "nivrayim": {
    "VillageCameraPreset": [
      {
        "name": "reference_low_third_person_camera_contract",
        "fov": 60,
        "height": 1.62,
        "distance": 4.6,
        "shoulderX": 0,
        "lookAhead": 4.8,
        "pitch": -0.12,
        "targetComposition": "hero-tree-left-path-center-cottage-guide-right"
      }
    ],
    "ProceduralSky": [
      {
        "name": "stable_soft_blue_gold_village_sky",
        "timeOfDay": 14.8,
        "timeMultiplier": 0,
        "sunIntensity": 0.5,
        "hemiIntensity": 0.74,
        "ambientIntensity": 0.42,
        "fogNear": 155,
        "fogFar": 620,
        "topColor": 9418972,
        "bottomColor": 14208935,
        "horizonGlow": 15913611,
        "mobileLambertGrade": "soft-clear-village-readable",
        "position": {
          "x": 0,
          "y": 0,
          "z": 0
        }
      }
    ],
    "VillageSkyLayers": [],
    "VillageBackdrop": [],
    "VillageLightingRig": [
      {
        "name": "stable_picture_reference_lambert_rig",
        "skyColor": 13229279,
        "groundColor": 6322767,
        "hemiIntensity": 0.58,
        "sunColor": 16766363,
        "sunIntensity": 0.54,
        "sunX": -24,
        "sunY": 26,
        "sunZ": 18,
        "fogColor": 14275253,
        "fogNear": 160,
        "fogFar": 620
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "stable_physics_terrain_lawful_textured_ground",
        "width": 190,
        "depth": 190,
        "segments": 72,
        "collisionSegments": 12,
        "isSolid": true,
        "noSafetySlab": true,
        "textureType": "safegrass",
        "textureSize": 512,
        "microNoise": 0.026,
        "mobileTone": "soft-clear-meadow-green",
        "points": [
          {
            "x": -95,
            "z": -95,
            "y": 0
          },
          {
            "x": 95,
            "z": -95,
            "y": 0
          },
          {
            "x": 95,
            "z": 95,
            "y": 0
          },
          {
            "x": -95,
            "z": 95,
            "y": 0
          }
        ],
        "position": {
          "x": 0,
          "y": -0.72,
          "z": 0
        }
      }
    ],
    "VillageGroundPlane": [],
    "Chossid": [
      {
        "name": "Village Player Stable Speed Spawn",
        "path": "https://models-3122d.web.app/chossid.glb?k=1",
        "speed": 10,
        "speedScale": 1,
        "runModeScale": 0.82,
        "walkModeScale": 0.45,
        "autoGround": true,
        "groundLift": 0,
        "position": {
          "x": -10.8,
          "y": 0,
          "z": 16.2
        },
        "rotation": {
          "y": 2.75
        },
        "cameraPreset": "guide-visible-low-third-person"
      }
    ],
    "VillageStonePath": [],
    "VillagePictureProp": [
      {
        "name": "reference_main_dirt_path_to_guide",
        "kind": "pictureDirtPath",
        "position": {
          "x": -7.4,
          "z": 12.6
        },
        "scale": 1.12,
        "rotation": {
          "y": -0.18
        },
        "terrainLawGrounded": true,
        "groundLift": 0.01
      },
      {
        "name": "reference_house_cobble_arrival",
        "kind": "cobbleRoad",
        "position": {
          "x": -0.8,
          "z": 8.2
        },
        "scale": 1.1,
        "rotation": {
          "y": -0.28
        },
        "terrainLawGrounded": true,
        "groundLift": 0.02
      },
      {
        "name": "reference_door_steps_flush",
        "kind": "steps",
        "position": {
          "x": 3,
          "z": 8
        },
        "scale": 1.05,
        "rotation": {
          "y": -0.25
        },
        "terrainLawGrounded": true,
        "groundLift": 0.02
      },
      {
        "name": "reference_lantern_cobble_pad",
        "kind": "cobbleRoad",
        "position": {
          "x": -7.4,
          "z": 10.5
        },
        "scale": 0.55,
        "rotation": {
          "y": 0.15
        },
        "terrainLawGrounded": true,
        "groundLift": 0.02
      },
      {
        "name": "main_warm_house",
        "kind": "gableHouse",
        "position": {
          "x": 145,
          "z": -110
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 2.2,
        "rotation": {
          "y": -0.34
        }
      },
      {
        "name": "left_meadow_house",
        "kind": "gableHouse",
        "position": {
          "x": -120,
          "z": 92
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 2.3,
        "rotation": {
          "y": 0.52
        }
      },
      {
        "name": "right_orchard_house",
        "kind": "gableHouse",
        "position": {
          "x": 132,
          "z": 96
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 2.25,
        "rotation": {
          "y": -0.74
        }
      },
      {
        "name": "courtyard_well_readable_center",
        "kind": "well",
        "position": {
          "x": -3.8,
          "z": 2.4
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 1.12,
        "rotation": {
          "y": 0.42
        }
      },
      {
        "name": "guide_path_lantern_left",
        "kind": "lantern",
        "position": {
          "x": -9.5,
          "z": 9.8
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 1.18
      },
      {
        "name": "guide_path_lantern_right",
        "kind": "lantern",
        "position": {
          "x": -2.4,
          "z": 10.4
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 1.12
      },
      {
        "name": "oak_shadow_bench",
        "kind": "bench",
        "position": {
          "x": -16.4,
          "z": 18.4
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 1.18,
        "rotation": {
          "y": 0.72
        }
      },
      {
        "name": "courtyard_bench_right",
        "kind": "bench",
        "position": {
          "x": 7.2,
          "z": 9.6
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "scale": 1.02,
        "rotation": {
          "y": -0.5
        }
      },
      {
        "name": "front_soft_flower_arc",
        "kind": "flowerPatch",
        "position": {
          "x": -8.5,
          "z": 13.2
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 46,
        "radius": 3,
        "seed": 73,
        "scale": 1
      },
      {
        "name": "left_tree_flowers",
        "kind": "flowerPatch",
        "position": {
          "x": -18,
          "z": 13.2
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 62,
        "radius": 4.2,
        "seed": 92,
        "scale": 1.05
      },
      {
        "name": "quiet_front_meadow_detail",
        "kind": "meadowDetail",
        "position": {
          "x": 0,
          "z": 0
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "clusters": [
          [
            -18,
            11
          ],
          [
            -9,
            8
          ],
          [
            14,
            11
          ],
          [
            23,
            16
          ],
          [
            -26,
            24
          ],
          [
            30,
            6
          ]
        ],
        "scale": 1.05
      },
      {
        "name": "left_low_fence_frame",
        "kind": "fence",
        "position": {
          "x": -28,
          "z": 5
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 8,
        "scale": 1.15,
        "rotation": {
          "y": 0.12
        }
      },
      {
        "name": "orchard_back_low_fence",
        "kind": "fence",
        "position": {
          "x": -18,
          "z": 43
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 10,
        "scale": 1.12,
        "rotation": {
          "y": 0.02
        }
      },
      {
        "name": "right_low_fence_frame",
        "kind": "fence",
        "position": {
          "x": 62,
          "z": 20
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 9,
        "scale": 1.05,
        "rotation": {
          "y": 1.32
        }
      },
      {
        "name": "path_small_rocks",
        "kind": "rock",
        "position": {
          "x": -5.4,
          "z": 6.8
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 8,
        "radius": 1.2,
        "seed": 4,
        "scale": 0.9
      },
      {
        "name": "left_scattered_rocks_soft",
        "kind": "rockField",
        "position": {
          "x": -45,
          "z": 4
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 24,
        "radius": 13,
        "seed": 6,
        "scale": 0.78
      },
      {
        "name": "right_scattered_rocks_soft",
        "kind": "rockField",
        "position": {
          "x": 43,
          "z": 12
        },
        "terrainLawGrounded": true,
        "groundLift": 0,
        "count": 22,
        "radius": 12,
        "seed": 29,
        "scale": 0.74
      },
      {
        "name": "reference_left_anchor_tree",
        "kind": "pictureAnchorTree",
        "position": {
          "x": -18,
          "z": 14
        },
        "scale": 1.35,
        "rotation": {
          "y": -0.3
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "reference_path_mid_tree",
        "kind": "pictureAnchorTree",
        "position": {
          "x": 9.5,
          "z": -4.5
        },
        "scale": 0.86,
        "rotation": {
          "y": 0.8
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "reference_right_depth_tree",
        "kind": "pictureAnchorTree",
        "position": {
          "x": 22,
          "z": -18
        },
        "scale": 0.78,
        "rotation": {
          "y": -1.1
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "reference_far_hill_tree_left",
        "kind": "pictureAnchorTree",
        "position": {
          "x": -30,
          "z": -18
        },
        "scale": 0.55,
        "rotation": {
          "y": 0.4
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "reference_far_hill_tree_right",
        "kind": "pictureAnchorTree",
        "position": {
          "x": 34,
          "z": -28
        },
        "scale": 0.58,
        "rotation": {
          "y": -0.7
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      }
    ],
    "VillageRoadCollider": [],
    "VillageCottage": [],
    "VillageHouseCollider": [
      {
        "name": "main_house_fitted_colliders",
        "targetName": "main_warm_house",
        "width": 21.76,
        "depth": 14.72,
        "height": 8.704,
        "floorTop": 0.058,
        "thickness": 0.85,
        "position": {
          "x": 145,
          "y": 0,
          "z": -110
        },
        "rotation": {
          "y": -0.34
        },
        "useAuthoredY": true,
        "thresholdCollider": false,
        "contractDriven": true,
        "useVisualHouseY": true,
        "doorWidth": 3.264,
        "doorClearHeight": 2.9760000000000004
      },
      {
        "name": "left_house_fitted_colliders",
        "targetName": "left_meadow_house",
        "width": 23.12,
        "depth": 15.64,
        "height": 9.248000000000001,
        "floorTop": 0.058,
        "thickness": 0.85,
        "position": {
          "x": -120,
          "y": 0,
          "z": 92
        },
        "rotation": {
          "y": 0.52
        },
        "useAuthoredY": true,
        "thresholdCollider": false,
        "contractDriven": true,
        "useVisualHouseY": true,
        "doorWidth": 3.468,
        "doorClearHeight": 3.1620000000000004
      },
      {
        "name": "right_house_fitted_colliders",
        "targetName": "right_orchard_house",
        "width": 22.44,
        "depth": 15.180000000000001,
        "height": 8.976,
        "floorTop": 0.058,
        "thickness": 0.85,
        "position": {
          "x": 132,
          "y": 0,
          "z": 96
        },
        "rotation": {
          "y": -0.74
        },
        "useAuthoredY": true,
        "thresholdCollider": false,
        "contractDriven": true,
        "useVisualHouseY": true,
        "doorWidth": 3.366,
        "doorClearHeight": 3.0690000000000004
      }
    ],
    "VillageHeroTree": [],
    "VillageTreeField": [],
    "VillageGrassField": [],
    "InteractiveNpc": [
      {
        "name": "OPEN_VISIBLE_CHOOSE_LEVELS_GUIDE",
        "title": "Village Guide",
        "opensLevelSelect": true,
        "hasShop": true,
        "selectorTitle": "Choose Levels",
        "proximity": 10,
        "talkDistance": 10,
        "height": 1.9,
        "visualHeight": 1.9,
        "radius": 0.58,
        "visualGroundBiasY": 0,
        "groundLift": 0.02,
        "beacon": true,
        "beaconColor": 16763972,
        "guideCyan": 56831,
        "beaconHeight": 4.8,
        "path": "https://models-3122d.web.app/chossid.glb?k=1",
        "position": {
          "x": -2.8,
          "y": 0,
          "z": 14.8
        },
        "rotation": {
          "y": 2.9
        },
        "dialogue": [
          "Shalom! I guard the challenge path.",
          "Tap Choose Levels to see all available challenges.",
          "The guide is no longer stuck by the wall."
        ]
      },
      {
        "name": "Egg Village Travel Guide",
        "title": "Egg Village Guide",
        "opensLevelSelect": false,
        "hasShop": false,
        "travelOnly": true,
        "travelPath": "egg-village.json",
        "travelLabel": "GO TO EGG VILLAGE",
        "proximity": 9,
        "talkDistance": 9,
        "height": 1.75,
        "visualHeight": 1.75,
        "radius": 0.52,
        "groundLift": 0.02,
        "beacon": true,
        "beaconColor": 16773280,
        "beaconHeight": 4.2,
        "path": "https://models-3122d.web.app/chossid.glb?k=3",
        "position": {
          "x": -14.5,
          "y": 0,
          "z": 6.5
        },
        "rotation": {
          "y": 1.15
        },
        "dialogue": [
          "I can take you to Egg Village.",
          "Tap the travel button and I will open that path.",
          "You can return from the guide there."
        ]
      }
    ],
    "VillageFenceCollider": [
      {
        "name": "village_front_fence_collider",
        "count": 112,
        "spacing": 0.92,
        "height": 1.24,
        "depth": 0.52,
        "scale": 1,
        "position": {
          "x": -48,
          "y": 0,
          "z": 20
        },
        "rotation": {
          "y": 0
        },
        "useAuthoredY": true,
        "isSolid": true
      },
      {
        "name": "village_left_return_fence_collider",
        "count": 48,
        "spacing": 0.92,
        "height": 1.24,
        "depth": 0.52,
        "scale": 1,
        "position": {
          "x": -49,
          "y": 0,
          "z": 20
        },
        "rotation": {
          "y": 1.5707963267948966
        },
        "useAuthoredY": true,
        "isSolid": true
      },
      {
        "name": "village_right_return_fence_collider",
        "count": 48,
        "spacing": 0.92,
        "height": 1.24,
        "depth": 0.52,
        "scale": 1,
        "position": {
          "x": 54,
          "y": 0,
          "z": 20
        },
        "rotation": {
          "y": 1.5707963267948966
        },
        "useAuthoredY": true,
        "isSolid": true
      }
    ]
  }
};
