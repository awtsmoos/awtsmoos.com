/**
 * B"H
 * @file 2.js
 * @description
 * Chapter 10: The Garden of Many Paths
 * The Second Hub World, completely upgraded to the extreme JSON procedural engine.
 */

import { HousePresets } from '../../utils/3d/procedural/house/data/HousePresets.js';

export default {
    shaym: "The Garden of Many Paths",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb"
    }, 
    nivrayim: {
        ProceduralSky: {
            dome: { name: "Garden_Sky", timeMultiplier: 0.5, timeOfDay: 6.0 } // Sunrise
        },
        Domem: {
            ground: {
                name: "Emerald_Village_Ground",
                golem: {
                    guf: { BoxGeometry: [2000, 2, 2000] },
                    toyr: { AwtsmoosGrassMaterial: {} }
                },
                position: { x: 0, y: -1, z: 0 },
                isSolid: true
            }
        },

        ProceduralRoad: {
            windingPath: {
                name: "Winding_Path",
                points: [[-50, -50], [-20, 0], [20, 0], [50, 50]],
                width: 6, sidewalkWidth: 1, sidewalkHeight: 0.2,
                isSolid: true
            }
        },

        ProceduralFlowerPatch: {
            roses: { name: "Rose_Garden", count: 500, radius: 30, flowerType: "rose", position: { x: -30, y: 0, z: -30 } }
        },

        ProceduralBuilding: {
            gardenVilla: {
                name: "The Garden Villa",
                blueprint: {
                    width: 15, height: 6, depth: 15, wallThickness: 1,
                    rooms: [
                        { width: 15, height: 6, depth: 15, offset: [0, 0, 0], hasRoof: true }
                    ],
                    entrances: [{ wall: 'front', width: 4, height: 5, offset: 0 }],
                    npcs: [
                        {
                            name: "Ephraim the Gardener", x: 0, z: 0,
                            hasMission: true,
                            hasShop: true,
                            missionData: {
                                requiredItem: "Golden_Shekel", count: 3,
                                successMsg: "You have gathered the lost coins! The garden is secure!"
                            },
                            dialogues: [
                                "B\"H! I planted these procedural flowers using pure data.",
                                "Find 3 Golden Shekels hidden in the grass, and I will trade with you."
                            ]
                        }
                    ]
                },
                position: { x: 30, y: 0, z: 30 },
                isSolid: true
            }
        },
        
        ProceduralTree: {
            t1: { position: { x: -20, y: 0, z: -20 } },
            t2: { position: { x: -15, y: 0, z: -25 } },
            t3: { position: { x: -25, y: 0, z: -15 } }
        },

        Collectable: {
            c1: { type: "Golden_Shekel", position: { x: -10, y: 1, z: -10 } },
            c2: { type: "Golden_Shekel", position: { x: -5, y: 1, z: -10 } },
            c3: { type: "Golden_Shekel", position: { x: -10, y: 1, z: -5 } }
        },

        Chossid: {
            me: {
                name: "player", height: 1.5, speed: 10, interactable: true,
                path: "awtsmoos://awduhm", position: { x: 0, y: 5, z: 10 },
                on: {
                    ready(n) {
                        n.olam.ayshPeula("ui event", "effectsOverlay", { text: "Welcome to the Garden of Paths!", color: "#4ca64c" });
                    }
                }
            }
        }
    }
};
