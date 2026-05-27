// B"H
/**
 * @module levelData
 * @description
 * Chapter 1: The desert test realm is the small honest vessel before the
 * enormous districts awaken. Sand, three houses, two NPCs, and one local
 * chossid model are enough to prove the startup path without summoning the
 * whole Emerald machinery.
 */

export const DESERT_TEST_WORLD = {
  shaym: "Desert_Test_World",
  nivrayim: {
    ProceduralTerrain: {
      desertFloor: {
        name: "Desert_Test_Floor",
        width: 120,
        depth: 120,
        segments: 16,
        position: { x: 0, y: -1, z: 0 },
        isSolid: true,
        interactable: true,
        color: 0xd8b26a,
        hills: []
      }
    },
    Chossid: [
      {
        name: "The Chossid",
        height: 1.5,
        speed: 120,
        interactable: false,
        path: "https://models-3122d.web.app/chossid.glb?k=2",
        position: { x: 0, y: 5, z: 10 },
        scale: { x: 0.035, y: 0.035, z: 0.035 },
        on: {
          ready(n) {
            if (n && typeof n.updateAppearance === "function") n.updateAppearance();
          }
        }
      }
    ],
    ProceduralBuilding: [
      {
        name: "Desert_House_West",
        position: { x: -18, y: 0, z: 24 },
        blueprint: { width: 10, height: 6, depth: 8, textureRepeat: { x: 2, y: 1 } }
      },
      {
        name: "Desert_House_Center",
        position: { x: 0, y: 0, z: 32 },
        blueprint: { width: 11, height: 6, depth: 8, textureRepeat: { x: 2, y: 1 } }
      },
      {
        name: "Desert_House_East",
        position: { x: 18, y: 0, z: 24 },
        blueprint: { width: 10, height: 6, depth: 8, textureRepeat: { x: 2, y: 1 } }
      }
    ],
    InteractiveNpc: [
      {
        name: "Desert Guide",
        position: { x: -8, y: 4, z: 16 },
        dialogues: ["B\\\"H. This tiny desert is here for fast testing."]
      },
      {
        name: "House Keeper",
        position: { x: 8, y: 4, z: 16 },
        dialogues: ["Three houses, two NPCs, one clear path."]
      }
    ]
  }
};

export const MINIMAL_GRASS_WORLD = DESERT_TEST_WORLD;

export const ALL_LEVELS = {
  desertTest: DESERT_TEST_WORLD,
  minimal: DESERT_TEST_WORLD
};

export default ALL_LEVELS;
