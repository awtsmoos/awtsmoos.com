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
        "name": "clean_golden_hour_sky_no_rectangles",
        "timeOfDay": 17.25,
        "timeMultiplier": 0,
        "sunIntensity": 0.9,
        "hemiIntensity": 1.05,
        "ambientIntensity": 0.64,
        "fogNear": 90,
        "fogFar": 460,
        "topColor": 8824791,
        "bottomColor": 16758122,
        "horizonGlow": 16755274,
        "mobileLambertGrade": "clean-warm-no-rectangles",
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
        "name": "clean_visible_golden_lambert_rig",
        "skyColor": 16767396,
        "groundColor": 3231531,
        "hemiIntensity": 0.82,
        "sunColor": 16761466,
        "sunIntensity": 1.22,
        "sunX": -22,
        "sunY": 24,
        "sunZ": 20,
        "fogColor": 16763018,
        "fogNear": 95,
        "fogFar": 460
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "stable_physics_terrain_lawful_textured_ground",
        "width": 190,
        "depth": 190,
        "segments": 72,
        "isSolid": true,
        "textureType": "safegrass",
        "textureSize": 768,
        "microNoise": 0.04,
        "mobileTone": "warm-readable-green",
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
        "name": "Village Player Restored Speed Spawn",
        "path": "https://models-3122d.web.app/chossid.glb?k=1",
        "speed": 0.34,
        "position": {
          "x": -11.8,
          "y": 0.24,
          "z": 18.4
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
        "name": "restored_grounded_dirt_path_to_guide",
        "kind": "pictureDirtPath",
        "position": {
          "x": -6.8,
          "z": 12.8
        },
        "scale": 1.08,
        "rotation": {
          "y": -0.24
        },
        "terrainLawGrounded": true,
        "groundLift": 0.01
      },
      {
        "name": "restored_cobble_path_by_house",
        "kind": "cobbleRoad",
        "position": {
          "x": -4.6,
          "z": 9.4
        },
        "scale": 1.18,
        "rotation": {
          "y": -0.2
        },
        "terrainLawGrounded": true,
        "groundLift": 0.02
      },
      {
        "name": "restored_steps_to_brick_house",
        "kind": "steps",
        "position": {
          "x": -2.2,
          "z": 9.1
        },
        "scale": 1.1,
        "rotation": {
          "y": -0.35
        },
        "terrainLawGrounded": true,
        "groundLift": 0.02
      },
      {
        "name": "restored_brick_house_by_guide",
        "kind": "gableHouse",
        "position": {
          "x": -1.6,
          "z": 8
        },
        "scale": 4.6,
        "rotation": {
          "y": -0.35
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_second_brick_house_depth",
        "kind": "gableHouse",
        "position": {
          "x": 13.5,
          "z": -8
        },
        "scale": 3.55,
        "rotation": {
          "y": 0.25
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_lantern_by_path",
        "kind": "lantern",
        "position": {
          "x": -8.8,
          "z": 11.8
        },
        "scale": 2.1,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_visible_well",
        "kind": "well",
        "position": {
          "x": 4.4,
          "z": 10.4
        },
        "scale": 1.15,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_left_low_fence",
        "kind": "fence",
        "position": {
          "x": -18,
          "z": 11.5
        },
        "scale": 1.55,
        "rotation": {
          "y": -0.28
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_cottage_flowers",
        "kind": "flowerPatch",
        "count": 160,
        "radius": 3.8,
        "seed": 88,
        "position": {
          "x": -3.6,
          "z": 10.2
        },
        "scale": 1.25,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_tree_flowers",
        "kind": "flowerPatch",
        "count": 150,
        "radius": 5.2,
        "seed": 92,
        "position": {
          "x": -18,
          "z": 13
        },
        "scale": 1.25,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_grounded_anchor_tree_left",
        "kind": "pictureAnchorTree",
        "position": {
          "x": -20,
          "z": 15
        },
        "scale": 1.7,
        "rotation": {
          "y": -0.3
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_grounded_mid_tree_by_house",
        "kind": "pictureAnchorTree",
        "position": {
          "x": 5.5,
          "z": 2
        },
        "scale": 1.05,
        "rotation": {
          "y": 0.8
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "restored_grounded_right_depth_tree",
        "kind": "pictureAnchorTree",
        "position": {
          "x": 15,
          "z": -10
        },
        "scale": 0.92,
        "rotation": {
          "y": -1.1
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      }
    ],
    "VillageCottage": [],
    "VillageHouseCollider": [
      {
        "name": "restored_brick_house_collider",
        "position": {
          "x": -1.6,
          "y": 0,
          "z": 8
        },
        "width": 16,
        "depth": 11,
        "height": 7,
        "floorTop": 0.34
      }
    ],
    "VillageHeroTree": [],
    "VillageTreeField": [],
    "VillageGrassField": [
      {
        "name": "readable_spawn_grass_and_flowers",
        "count": 3000,
        "tallRatio": 0.28,
        "flowerRatio": 0.22,
        "radius": 62,
        "groundY": 0,
        "groundLift": 0.014,
        "shortColor": 5217083,
        "tallColor": 3439150,
        "flowerColor": 15259744,
        "patches": [
          {
            "x": -18,
            "z": 13,
            "radius": 12
          },
          {
            "x": -12,
            "z": 17,
            "radius": 8
          },
          {
            "x": -2,
            "z": 12,
            "radius": 7
          },
          {
            "x": 6,
            "z": 4,
            "radius": 10
          },
          {
            "x": 14,
            "z": -5,
            "radius": 9
          }
        ]
      }
    ],
    "InteractiveNpc": [
      {
        "name": "SPAWN_VISIBLE_CHOOSE_LEVELS_GUIDE",
        "opensLevelSelect": true,
        "hasShop": true,
        "selectorTitle": "Choose Levels",
        "proximity": 18,
        "talkDistance": 18,
        "height": 1.9,
        "visualHeight": 1.9,
        "radius": 0.58,
        "visualGroundBiasY": 0,
        "groundLift": 0.08,
        "beacon": true,
        "beaconColor": 16766282,
        "guideCyan": 65488,
        "beaconHeight": 8.2,
        "path": "https://models-3122d.web.app/chossid.glb?k=2",
        "position": {
          "x": -6.6,
          "y": 0.14,
          "z": 10.6
        },
        "rotation": {
          "y": 2.75
        },
        "dialogue": [
          "Shalom! I guard the challenge path.",
          "Tap Choose Levels to see all available challenges.",
          "The village is only the beginning."
        ]
      }
    ]
  }
};
