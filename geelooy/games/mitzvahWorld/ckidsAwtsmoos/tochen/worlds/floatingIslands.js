
/**
 * B"H
 * @file floatingIslands.js
 * @description
 * "He hangs the earth upon nothing." (Iyov 26:7)
 * A mystical realm where massive chunks of earth float in the boundless sky.
 * Utilizes the custom IslandGeometry and the fixed AwtsmoosGrassShader.
 */

export default {
    shaym: "Realm of Floating Islands",
    components: {}, 
    nivrayim: {
        Domem: {
            mainIsland: {
                name: "The Core Island",
                golem: {
                    guf: { IslandGeometry: [40, 30] }, // 40 radius, 30 depth
                    toyr: { AwtsmoosGrassMaterial: {} } // Uses the fixed GPU shader!
                },
                position: { x: 0, y: 0, z: 0 },
                isSolid: true
            },
            satelliteIsland1: {
                name: "Island of Knowledge",
                golem: {
                    guf: { IslandGeometry: [20, 15] },
                    toyr: { AwtsmoosGrassMaterial: {} }
                },
                position: { x: -80, y: 15, z: -50 },
                isSolid: true
            },
            satelliteIsland2: {
                name: "Island of Understanding",
                golem: {
                    guf: { IslandGeometry: [25, 20] },
                    toyr: { AwtsmoosGrassMaterial: {} }
                },
                position: { x: 90, y: -10, z: 60 },
                isSolid: true
            },
            bridgeOfFaith: {
                name: "Bridge",
                golem: {
                    guf: { BoxGeometry: [100, 1, 4] },
                    toyr: { MeshLambertMaterial: { color: "#8B4513" } } // Wood bridge
                },
                position: { x: -40, y: 7.5, z: -25 },
                rotation: { x: 0, y: Math.PI / 6, z: Math.PI / 16 }, // Angled up to the island
                isSolid: true
            },
            sun: {
                name: "Divine Sun",
                golem: {
                    guf: { BoxGeometry: [0.1, 0.1, 0.1] },
                    toyr: { MeshBasicMaterial: { visible: false } }
                },
                on: {
                    ready(l) {
                        if(l.olam && l.olam.scene) {
                            l.olam.scene.background = new l.olam.THREE.Color(0xFFE4B5); // Warm sunset sky
                        }
                    }
                }
            }
        },
        CustomNpc: {
            bird: {
                name: "Eagle of Heaven",
                path: "procedural", 
                customData: {
                    color: "#ffffff", 
                    dialogueTree: [
                        {
                            message: "B\"H\nLook below you! There is nothing but the void. These islands are mathematically carved from cylinders, their roots jagged with noise.",
                            responses: [
                                { text: "It is terrifyingly beautiful.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 0, y: 2, z: -10 },
                proximity: 5
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 160,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb", // Stable player
                position: { x: 0, y: 10, z: 20 }, // Drop on main island
                on: {
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Landed on the Island!", color: "#00ff00" });
                    }
                }
            }
        }
    }
};
