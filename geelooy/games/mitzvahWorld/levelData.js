
// B"H
/**
 * @module levelData
 * @description
 * 📜 THE SCROLL OF MANIFESTATION — CHAPTER 1: THE FOUNDATIONS 📜
 * 
 * Tikkun: Ensuring the Domem (inanimate earth) has enough physical 
 * volume to be parsed by the World Octree. A flat 2D plane creates 
 * an infinite mathematical recursion when divided into 3D cells.
 */

export const MINIMAL_GRASS_WORLD = {
    shaym: "Emerald_Minimal_World",

    nivrayim: {
        ProceduralTerrain: {
            theSoil: {
                name: "Emerald_Plain",
                width: 1500,
                depth: 1500,
                segments: 64,
                position: { x: 0, y: -1.0, z: 0 },
                isSolid: true,
                interactable: true,
                hills: [
                    { x: 20, z: 20, radius: 60, height: 10 }
                ]
            }
        },
        SolidBlock: [
            {
                name: "Diagnostic_Block",
                width: 2, height: 2, depth: 2,
                position: { x: 0, y: 5, z: 10 },
                color: 0x0000ff
            },
            {
                name: "RedBlock_1",
                width: 5, height: 5, depth: 5,
                position: { x: 15, y: 2.5, z: 15 },
                color: 0xff0000
            },
            {
                name: "RedBlock_2",
                width: 5, height: 20, depth: 5,
                position: { x: -15, y: 10, z: -15 },
                color: 0xff0000
            }
        ],

        Chossid:[
            {
                name: "The Chossid",
                height: 1.5,
                speed: 180,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb?k=2",
                position: { x: 0, y: 5, z: 0 },
                on: {
                    ready(n) {
                        console.log("B\"H - 💎 [LEVEL_DATA]: Chossid soul has meta-linked. Vessel is prepared.");
                        if (n && typeof n.updateAppearance === "function") {
                            n.updateAppearance();
                        }
                    }
                }
            }
        ],
        ProceduralBuilding: [
            {
                name: "Emerald_House_1",
                position: { x: -30, y: 0, z: -30 },
                blueprint: {
                    width: 15, height: 8, depth: 15,
                    textureRepeat: { x: 4, y: 2 }
                }
            },
            {
                name: "Emerald_House_2",
                position: { x: 30, y: 0, z: -40 },
                blueprint: {
                    width: 12, height: 10, depth: 18,
                    textureRepeat: { x: 3, y: 3 }
                }
            },
            {
                name: "Emerald_House_3",
                position: { x: 50, y: 0, z: 20 },
                blueprint: {
                    width: 20, height: 6, depth: 12,
                    textureRepeat: { x: 5, y: 2 }
                }
            }
        ]
    }
};

export const ALL_LEVELS = {
    minimal: MINIMAL_GRASS_WORLD
};

export default ALL_LEVELS;
