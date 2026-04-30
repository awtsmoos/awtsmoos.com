
/**
 * B"H
 * @file 1.js
 * @description
 * Chapter 9: The Hub of Many Paths
 * "All roads lead to the Sanctuary."
 * A completely procedural world generated from pure JSON data. 
 * Includes the intense Sidewalk Decree—a geometric path leading the soul from 
 * the starting point directly to the openable door of the House.
 */

export default {
    shaym: "The Central Hub of Light",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb",
    },
  
    nivrayim: {
        ProceduralTerrain: {
            ground: {
                name: "Emerald Expanse",
                width: 400, depth: 400, segments: 60,
                textureType: "grass", 
                hills:[], 
                position: { x: 0, y: -1, z: 0 },
                isSolid: true
            }
        },
        Domem: {
            // THE GREAT SANCTUARY
            theGreatHouse: {
                name: "The First Vessel",
                golem: { 
                    guf: { HouseGeometry:[15, 8, 15, 1.2, 4.5, 5.5] }, 
                    toyr: { 
                        MaterialArray:[
                            { AwtsmoosBrickMaterial: { color: "#a0522d" } }, // Exterior Walls
                            { MeshStandardMaterial: { color: "#443322", roughness: 0.9 } } // Ceiling/Roof
                        ] 
                    } 
                },
                position: { x: -15, y: 0, z: -30 },
                isSolid: true
            },
            
            // THE SACRED PATHWAY (SIDEWALK)
            sidewalk: {
                name: "Stone Pathway",
                golem: {
                    guf: { BoxGeometry: [5, 0.2, 4] },
                    toyr: { MeshLambertMaterial: { color: "#aaaaaa" } },
                    modifiers: [
                        { 
                            type: 'path', 
                            points: [
                                { x: 0, y: -0.1, z: 20 },
                                { x: 0, y: -0.1, z: 15 },
                                { x: -5, y: -0.1, z: 10 },
                                { x: -10, y: -0.1, z: 5 },
                                { x: -15, y: -0.1, z: 0 },
                                { x: -15, y: -0.1, z: -5 },
                                { x: -15, y: -0.1, z: -10 },
                                { x: -15, y: -0.1, z: -15 }
                            ],
                            autoAlign: true
                        }
                    ]
                },
                position: { x: 0, y: -0.8, z: 0 },
                isSolid: true
            }
        },
        
        InteractiveDoor: {
            // B"H: The beautiful new dual-material door!
            mainDoor: {
                name: "Threshold of Faith",
                golem: {
                    guf: { DoorGeometry:[4.5, 5.5, 0.6] },
                    toyr: { 
                        MaterialArray: [
                            { MeshLambertMaterial: { color: "#3e2723" } }, // Wood Slab
                            { MeshStandardMaterial: { color: "#FFD700", metalness: 0.8, roughness: 0.3 } } // Gold Knob
                        ]
                    } 
                },
                position: { x: -15 - 2.25, y: 0, z: -30 + 7.5 }, 
                isSolid: true,
                interactable: true,
                proximity: 6
            }
        },
        
        CustomNpc: {
            guide: {
                name: "Bezalel",
                path: "awtsmoos://awduhm",
                proximity: 5,
                position: { x: 0, y: 0, z: 10 },
                customData: {
                    color: "#ffffff",
                    clothes: { "top-hat": true, jacket: true, glasses: true },
                    dialogueTree:[
                        {
                            message: "B\"H\nWelcome to the Hub. Behold the sidewalk! It traces the curvature of the world to lead you to the Sanctuary. Approach the wooden door, gaze upon its golden knob, and try to open it.",
                            responses:[
                                { text: "I am ready for the mission.", nextMessageIndex: 1 },
                                { text: "Tell me about the construction.", nextMessageIndex: 2 },
                                { text: "Goodbye.", type: "close" }
                            ]
                        },
                        {
                            message: "Excellent. I need you to gather the fallen sparks (Coins). Bring me 3, and I will reward your soul.",
                            responses:[
                                {
                                    text: "I accept this Shlichus.",
                                    action(me) {
                                        if(me.olam.shlichusHandler) {
                                            me.olam.shlichusHandler.registerQuest(me, {
                                                title: "Gathering the Sparks",
                                                description: "Collect 3 Perutahs scattered in the emerald void.",
                                                totalCollectedObjects: 3,
                                                requirements: { "Perutah": 3 },
                                                onStart: (sh) => {
                                                     // Spawn some coins around the path
                                                     for(let i=0; i<3; i++) {
                                                         sh.olam.addObject("Coin", { position: { x: Math.random()*20 - 10, y: 1, z: Math.random()*20 } });
                                                     }
                                                }
                                            });
                                            me.olam.shlichusHandler.acceptQuest(me.olam.shlichusHandler.activeQuests.keys().next().value);
                                        }
                                    }
                                },
                                { text: "Later.", type: "close" }
                            ]
                        },
                        {
                            message: "The sidewalk is an Array of boxes mapped along a list of Vector3 points. The house walls are extruded and then compiled into a static octree for perfect collision.",
                            responses: [
                                { text: "The mathematics is divine.", type: "close" }
                            ]
                        }
                    ]
                }
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 150,
                interactable: true,
                path: "awtsmoos://awduhm",
                position: { x: 0, y: 10, z: 30 }, // Starting at the end of the path
                on: {
                    ready(m) {
                         m.olam.ayshPeula("ui event", "effectsOverlay", { text: "B\"H - Entering the Hub", color: "#00ffed" });
                    }
                }
            }
        }
    }
};
