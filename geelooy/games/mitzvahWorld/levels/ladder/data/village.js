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
        "name": "golden_hour_reference_sky_lambert",
        "timeOfDay": 17.15,
        "timeMultiplier": 0,
        "sunIntensity": 0.86,
        "hemiIntensity": 1.12,
        "ambientIntensity": 0.58,
        "fogNear": 70,
        "fogFar": 410,
        "topColor": 9418975,
        "bottomColor": 16761210,
        "horizonGlow": 16757594,
        "mobileLambertGrade": "warm-fable-reference",
        "position": {
          "x": 0,
          "y": 0,
          "z": 0
        }
      }
    ],
    "VillageSkyLayers": [
      {
        "name": "reference_gold_cloud_planes",
        "glowZ": -88,
        "cloudY": 29,
        "cloudOpacity": 0.68
      }
    ],
    "VillageBackdrop": [
      {
        "name": "reference_hills_and_sunset_glow",
        "glowOpacity": 0.28,
        "glowZ": -84
      }
    ],
    "VillageLightingRig": [
      {
        "name": "reference_golden_hour_lambert_rig",
        "skyColor": 16767396,
        "groundColor": 3232047,
        "hemiIntensity": 0.72,
        "sunColor": 16761466,
        "sunIntensity": 1.18,
        "sunX": -24,
        "sunY": 28,
        "sunZ": 18,
        "fogColor": 16763018,
        "fogNear": 75,
        "fogFar": 420
      }
    ],
    "ProceduralTerrain": [
      {
        "name": "reference_physics_terrain_under_painted_ground",
        "width": 190,
        "depth": 190,
        "segments": 72,
        "isSolid": true,
        "textureType": "safegrass",
        "textureSize": 768,
        "microNoise": 0.032,
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
    "VillageGroundPlane": [
      {
        "name": "reference_painted_grass_dirt_ground",
        "width": 190,
        "depth": 190,
        "y": -0.665,
        "size": 1024,
        "repeatX": 1,
        "repeatY": 1,
        "color": 7902022,
        "pathUv": [
          [
            0.12,
            0.82
          ],
          [
            0.32,
            0.62
          ],
          [
            0.48,
            0.51
          ],
          [
            0.68,
            0.38
          ],
          [
            0.88,
            0.22
          ]
        ]
      }
    ],
    "Chossid": [
      {
        "name": "Village Player Reference Spawn",
        "path": "https://models-3122d.web.app/chossid.glb?k=1",
        "speed": 0.19,
        "position": {
          "x": -10.8,
          "y": 0.24,
          "z": 18.2
        },
        "rotation": {
          "y": -2.55
        },
        "cameraPreset": "reference-village-low-third-person"
      }
    ],
    "VillageStonePath": [
      {
        "name": "spawn_to_guide_reference_cobble_path",
        "count": 142,
        "width": 4.6,
        "length": 46,
        "y": 0.055,
        "dirtX": 0.2,
        "dirtZ": 6.8,
        "rotationY": -0.62,
        "stoneColor": 12168593,
        "dirtColor": 9135937,
        "points": [
          [
            -13,
            18
          ],
          [
            -7,
            11
          ],
          [
            0,
            5.5
          ],
          [
            7,
            1.2
          ],
          [
            13,
            -4.5
          ]
        ]
      }
    ],
    "VillageCottage": [
      {
        "name": "reference_right_cottage_anchor",
        "width": 8.5,
        "depth": 6.2,
        "height": 4.3,
        "scale": 1.05,
        "rotationY": -0.18,
        "position": {
          "x": 17.5,
          "y": 0.06,
          "z": -7.8
        }
      },
      {
        "name": "reference_far_cottage_depth",
        "width": 7.5,
        "depth": 5.5,
        "height": 3.8,
        "scale": 0.86,
        "rotationY": 0.28,
        "position": {
          "x": 31,
          "y": 0.05,
          "z": -20
        }
      }
    ],
    "VillagePictureProp": [
      {
        "name": "reference_path_lantern_left",
        "kind": "lantern",
        "position": {
          "x": -7.8,
          "z": 7.6
        },
        "scale": 1.95,
        "terrainLawGrounded": true
      },
      {
        "name": "reference_house_ivy_flowers",
        "kind": "flowerPatch",
        "count": 128,
        "radius": 3.4,
        "seed": 88,
        "position": {
          "x": 13.5,
          "z": -4.4
        },
        "scale": 1.2,
        "terrainLawGrounded": true
      },
      {
        "name": "reference_tree_shadow_flowers",
        "kind": "flowerPatch",
        "count": 140,
        "radius": 5.2,
        "seed": 92,
        "position": {
          "x": -18,
          "z": 11
        },
        "scale": 1.25,
        "terrainLawGrounded": true
      },
      {
        "name": "reference_well_near_house",
        "kind": "well",
        "position": {
          "x": 23.5,
          "z": -1.8
        },
        "scale": 1.25,
        "terrainLawGrounded": true
      },
      {
        "name": "reference_left_low_fence",
        "kind": "fence",
        "position": {
          "x": -23,
          "z": 8
        },
        "scale": 1.6,
        "rotationY": -0.28,
        "terrainLawGrounded": true
      }
    ],
    "VillageHouseCollider": [
      {
        "name": "right_cottage_collider",
        "position": {
          "x": 17.5,
          "y": 0,
          "z": -7.8
        },
        "width": 16,
        "depth": 11,
        "height": 6,
        "floorTop": 0.34
      }
    ],
    "VillageHeroTree": [
      {
        "name": "left_spawn_reference_hero_tree",
        "trunkHeight": 9.4,
        "limbCount": 42,
        "leafCount": 780,
        "crownRadius": 6.8,
        "crownHeight": 4.4,
        "scale": 1.22,
        "rotationY": -0.3,
        "barkColor": 5911581,
        "branchColor": 5057817,
        "leafColor": 5019189,
        "position": {
          "x": -21,
          "y": 0.02,
          "z": 15
        }
      }
    ],
    "VillageTreeField": [
      {
        "name": "far_left_soft_tree_depth",
        "count": 14,
        "radius": 70,
        "seed": 52,
        "groundY": 0,
        "position": {
          "x": -76,
          "y": 0,
          "z": 42
        },
        "leafBrightness": 1.28
      },
      {
        "name": "far_right_soft_tree_depth",
        "count": 14,
        "radius": 72,
        "seed": 71,
        "groundY": 0,
        "position": {
          "x": 88,
          "y": 0,
          "z": 52
        },
        "leafBrightness": 1.28
      },
      {
        "name": "north_horizon_soft_tree_depth",
        "count": 16,
        "radius": 94,
        "seed": 31,
        "groundY": 0,
        "position": {
          "x": 8,
          "y": 0,
          "z": -92
        },
        "leafBrightness": 1.28
      }
    ],
    "VillageGrassField": [
      {
        "name": "reference_spawn_grass_and_flowers",
        "count": 3600,
        "tallRatio": 0.36,
        "flowerRatio": 0.24,
        "radius": 72,
        "groundY": 0,
        "groundLift": 0.014,
        "shortColor": 5217083,
        "tallColor": 3439150,
        "flowerColor": 15259744,
        "patches": [
          {
            "x": -18,
            "z": 12,
            "radius": 14
          },
          {
            "x": -5,
            "z": 10,
            "radius": 12
          },
          {
            "x": 8,
            "z": 0,
            "radius": 13
          },
          {
            "x": 17,
            "z": -7,
            "radius": 11
          }
        ]
      }
    ],
    "InteractiveNpc": [
      {
        "name": "Reference Village Level Guide",
        "opensLevelSelect": true,
        "hasShop": true,
        "selectorTitle": "Choose Levels",
        "proximity": 10.5,
        "talkDistance": 10.5,
        "height": 1.8,
        "visualHeight": 1.8,
        "radius": 0.5,
        "visualGroundBiasY": 0,
        "groundLift": 0.05,
        "beacon": true,
        "beaconColor": 16766282,
        "beaconHeight": 4.6,
        "path": "https://models-3122d.web.app/chossid.glb?k=2",
        "position": {
          "x": 10.8,
          "y": 0.1,
          "z": -4.4
        },
        "rotation": {
          "y": 0.04
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
