// B"H
/**
 * Standalone desert test world for ?path=desertTest.js autoload.
 * No imports are used because ikar.js fetches this file as text and turns it
 * into a Blob module; relative imports from Blob URLs would not resolve.
 */

const DESERT_TEST_WORLD = {
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
        visualHeight: 1.85,
        speed: 120,
        interactable: false,
        path: "https://models-3122d.web.app/chossid.glb?k=2",
        position: { x: 0, y: 5, z: 10 },
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
        position: { x: -8, y: 0, z: 16 },
        dialogues: ["B\\\"H. This tiny desert is here for fast testing."]
      },
      {
        name: "House Keeper",
        position: { x: 8, y: 0, z: 16 },
        dialogues: ["Three houses, two NPCs, one clear path."]
      }
    ]
  }
};

export default DESERT_TEST_WORLD;
