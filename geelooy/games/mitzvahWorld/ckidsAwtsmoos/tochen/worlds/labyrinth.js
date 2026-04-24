
/**
 * B"H
 * @file labyrinth.js
 * @description
 * The Maze of Confusion (Olam HaTohu). 
 * A massive procedural maze built using the LabyrinthGeometry. 
 */

export default {
    shaym: "The Infinite Labyrinth",
    components: {}, 
    nivrayim: {
        Domem: {
            ground: {
                name: "Dungeon Floor",
                golem: {
                    guf: { BoxGeometry: [300, 2, 300] },
                    toyr: { MeshLambertMaterial: { color: "#333333" } } // Dark grey stone
                },
                position: { x: 0, y: -1, z: 0 },
                isSolid: true
            },
            theMaze: {
                name: "The Great Maze",
                golem: {
                    // gridSize=20, cellSize=10, height=8, thickness=1
                    guf: { LabyrinthGeometry: [20, 10, 8, 1] },
                    toyr: { MeshLambertMaterial: { color: "#660000" } } // Deep red walls
                },
                position: { x: 0, y: 0, z: 0 },
                isSolid: true
            },
            light: {
                name: "Dungeon Light",
                golem: {
                    guf: { BoxGeometry: [0.1, 0.1, 0.1] },
                    toyr: { MeshBasicMaterial: { visible: false } }
                },
                on: {
                    ready(l) {
                        if(l.olam && l.olam.scene) {
                            l.olam.scene.background = new l.olam.THREE.Color(0x050505); // Pitch black
                            l.olam.scene.fog.density = 0.05; // Thick fog
                        }
                    }
                }
            }
        },
        CustomNpc: {
            lostSoul: {
                name: "Wandering Spark",
                path: "procedural", 
                customData: {
                    color: "#00ffff", 
                    dialogueTree: [
                        {
                            message: "B\"H\nI have been lost in these procedurally generated walls for aeons. The entire labyrinth is a single merged geometry for incredible performance. Can you find the way out?",
                            responses: [
                                { text: "I will find the path of Truth.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 0, y: 1, z: -5 },
                proximity: 5
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 120, // Walk slower in the dark
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb", // Stable player
                position: { x: 0, y: 5, z: 0 }, // Drop in the center
                on: {
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Entered the Labyrinth", color: "#ff0000" });
                    }
                }
            }
        }
    }
};
