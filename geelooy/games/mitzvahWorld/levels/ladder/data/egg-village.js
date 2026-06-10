// B"H
/** @file egg-village.js - visual village, terrain-only collider, no safety slab. */
export default {
  "format": "awtsmoos-level-json-v1",
  "id": "egg-village",
  "shaym": "egg-village",
  "title": "Egg Village",
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
        "timeOfDay": 16.4,
        "timeMultiplier": 0,
        "sunIntensity": 0.44,
        "hemiIntensity": 0.66,
        "ambientIntensity": 0.34,
        "fogNear": 130,
        "fogFar": 540,
        "topColor": 7903169,
        "bottomColor": 15115370,
        "horizonGlow": 15774046,
        "mobileLambertGrade": "soft-blue-gold-readable",
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
        "skyColor": 14208946,
        "groundColor": 4216890,
        "hemiIntensity": 0.48,
        "sunColor": 16760700,
        "sunIntensity": 0.62,
        "sunX": -24,
        "sunY": 26,
        "sunZ": 18,
        "fogColor": 13806203,
        "fogNear": 135,
        "fogFar": 540
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
        },
        "collisionSegments": 12,
        "noSafetySlab": true
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
          "x": -6,
          "y": 0.02,
          "z": 8
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
        "name": "egg_main_dirt_path_to_guide",
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
        "name": "egg_house_cobble_arrival",
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
        "name": "egg_door_steps_flush",
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
        "name": "egg_lantern_cobble_pad",
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
        "name": "egg_main_brick_house",
        "kind": "gableHouse",
        "position": {
          "x": 4.8,
          "z": 5.6
        },
        "scale": 3.25,
        "rotation": {
          "y": -0.25
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_far_brick_house",
        "kind": "gableHouse",
        "position": {
          "x": 24,
          "z": -18
        },
        "scale": 2.35,
        "rotation": {
          "y": 0.35
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_lantern_by_path",
        "kind": "lantern",
        "position": {
          "x": -7.4,
          "z": 10.8
        },
        "scale": 1.6,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_visible_well",
        "kind": "well",
        "position": {
          "x": 9.5,
          "z": 10.4
        },
        "scale": 1,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_left_low_fence",
        "kind": "fence",
        "position": {
          "x": -16,
          "z": 11.5
        },
        "scale": 1.35,
        "rotation": {
          "y": -0.28
        },
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_house_flower_border",
        "kind": "flowerPatch",
        "count": 210,
        "radius": 3.8,
        "seed": 88,
        "position": {
          "x": 1.8,
          "z": 8.2
        },
        "scale": 1.08,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_tree_flower_border",
        "kind": "flowerPatch",
        "count": 210,
        "radius": 5.8,
        "seed": 92,
        "position": {
          "x": -18,
          "z": 13
        },
        "scale": 1.1,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_path_meadow_detail",
        "kind": "meadowDetail",
        "count": 120,
        "radius": 5.2,
        "seed": 122,
        "position": {
          "x": -8,
          "z": 10.8
        },
        "scale": 1,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_left_anchor_tree",
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
        "name": "egg_path_mid_tree",
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
        "name": "egg_right_depth_tree",
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
        "name": "egg_far_hill_tree_left",
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
        "name": "egg_far_hill_tree_right",
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
      },
      {
        "name": "egg_village_large_egg_altar",
        "kind": "eggCluster",
        "count": 9,
        "radius": 4.5,
        "seed": 613,
        "position": {
          "x": 1.5,
          "z": 8.5
        },
        "scale": 1.4,
        "terrainLawGrounded": true,
        "groundLift": 0
      },
      {
        "name": "egg_village_return_flower_ring",
        "kind": "flowerPatch",
        "count": 180,
        "radius": 4.2,
        "seed": 314,
        "position": {
          "x": -8,
          "z": 7
        },
        "scale": 1.15,
        "terrainLawGrounded": true,
        "groundLift": 0
      }
    ],
    "VillageRoadCollider": [],
    "VillageCottage": [],
    "VillageHouseCollider": [],
    "VillageHeroTree": [],
    "VillageTreeField": [],
    "VillageGrassField": [],
    "InteractiveNpc": [
      {
        "name": "Return To Starting Village Guide",
        "title": "Return Guide",
        "opensLevelSelect": false,
        "hasShop": false,
        "travelOnly": true,
        "travelPath": "village.json",
        "travelLabel": "BACK TO STARTING VILLAGE",
        "proximity": 9,
        "talkDistance": 9,
        "height": 1.75,
        "visualHeight": 1.75,
        "radius": 0.52,
        "groundLift": 0.02,
        "beacon": true,
        "beaconColor": 8969727,
        "beaconHeight": 4.2,
        "path": "https://models-3122d.web.app/chossid.glb?k=4",
        "position": {
          "x": -8.5,
          "y": 0,
          "z": 7.2
        },
        "rotation": {
          "y": 1.35
        },
        "dialogue": [
          "This is Egg Village.",
          "Tap the button to return to the starting village.",
          "The route is two-way now."
        ]
      }
    ],
    "VillageFenceCollider": []
  },
  "description": "A safe egg meadow with a guide back to the starting village."
};
