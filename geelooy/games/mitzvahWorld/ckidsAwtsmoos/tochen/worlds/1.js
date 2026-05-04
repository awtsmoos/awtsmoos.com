/**
 * B"H
 * @file 1.js
 * @description
 * Chapter 9: The Metropolis of Sparks
 * The First Hub World, completely upgraded to the extreme JSON procedural engine.
 */

import { HousePresets } from '../../utils/3d/procedural/house/data/HousePresets.js';

export default {
    shaym: "The Metropolis of Sparks",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb"
    }, 
    nivrayim: {
        ProceduralSky: {
            dome: { name: "Metropolis_Sky", timeMultiplier: 2.0, timeOfDay: 12.0 }
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
            mainAvenue: {
                name: "Main_Avenue",
                points: [[-100, -100], [0, 0], [100, 100]],
                width: 12, sidewalkWidth: 3, sidewalkHeight: 0.4,
                isSolid: true
            },
            crossStreet: {
                name: "Cross_Street",
                points: [[-100, 100], [0, 0], [100, -100]],
                width: 12, sidewalkWidth: 3, sidewalkHeight: 0.4,
                isSolid: true
            }
        },

        ProceduralFlowerPatch: {
            roses: { name: "Rose_Garden", count: 300, radius: 20, flowerType: "rose", position: { x: 30, y: 0, z: 0 } },
            daisies: { name: "Daisy_Field", count: 300, radius: 20, flowerType: "daisy", position: { x: -30, y: 0, z: 0 } }
        },

        ProceduralBuilding: {
            towerOne: {
                name: "The First Tower",
                blueprint: HousePresets.generateSkyscraper(10), // 10 stories!
                position: { x: 0, y: 0, z: 40 },
                isSolid: true
            },
            towerTwo: {
                name: "The Second Tower",
                blueprint: HousePresets.generateSkyscraper(15), // 15 stories!
                position: { x: 0, y: 0, z: -40 },
                isSolid: true
            },
            mansion: {
                name: "The Rebbe's House",
                blueprint: {
                    width: 20, height: 8, depth: 20, wallThickness: 1,
                    rooms: [
                        { width: 10, height: 8, depth: 10, offset: [-5, 0, -5], hasRoof: true },
                        { width: 10, height: 8, depth: 10, offset: [5, 0, -5], hasRoof: true },
                        { width: 20, height: 8, depth: 10, offset: [0, 0, 5], hasRoof: true }
                    ],
                    entrances: [{ wall: 'front', width: 4, height: 6, offset: 0 }],
                    npcs: [
                        {
                            name: "Bezalel the Architect", x: 0, z: 5,
                            hasMission: true,
                            missionData: {
                                requiredItem: "wood_planks", count: 5,
                                successMsg: "Excellent! You have gathered the wood to build the Mishkan!"
                            },
                            dialogues: [
                                "B\"H! I built this mansion using pure JSON data.",
                                "Could you gather 5 Wood Planks for me? You will need an axe to chop trees."
                            ]
                        }
                    ]
                },
                position: { x: 50, y: 0, z: 0 },
                isSolid: true
            }
        },
        
        ProceduralTree: {
            tree1: { name: "Oak_Tree_1", position: { x: 20, y: 0, z: 20 } },
            tree2: { name: "Oak_Tree_2", position: { x: -20, y: 0, z: 20 } },
            tree3: { name: "Oak_Tree_3", position: { x: 20, y: 0, z: -20 } },
            tree4: { name: "Oak_Tree_4", position: { x: -20, y: 0, z: -20 } }
        },

        Chossid: {
            me: {
                name: "player", height: 1.5, speed: 10, interactable: true,
                path: "awtsmoos://awduhm", position: { x: 0, y: 5, z: 10 },
                on: {
                    ready(n) {
                        n.olam.ayshPeula("ui event", "effectsOverlay", { text: "Welcome to the Metropolis of Sparks!", color: "#ffd700" });
                    }
                }
            }
        }
    }
};
