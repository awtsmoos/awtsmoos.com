
/**
 * B"H
 * @file forestOfGeometry.js
 * @description
 * A brand new procedural world testing the limits of the Awtsmoos Geometry Forge!
 * Features the AwtsmoosGrassMaterial on the ground, surrounded by procedural pillars, 
 * towering pyramids, and a central dome. Populated by deep-thinking NPCs.
 */

export default {
    shaym: "Forest of Geometry",
    components: {}, // Pure code, no external loading needed!
    nivrayim: {
        Domem: {
            ground: {
                name: "The Grassy Expanse",
                golem: {
                    guf: { BoxGeometry: [400, 2, 400] },
                    toyr: { AwtsmoosGrassMaterial: {} } // Uses the intense new GPU shader
                },
                position: { x: 0, y: -1, z: 0 },
                isSolid: true
            },
            centralDome: {
                name: "The Eye of the World",
                golem: {
                    guf: { DomeGeometry: [10] }, // Uses our custom procedural geometry
                    toyr: { MeshLambertMaterial: { color: "#FFD700" } } // Golden dome
                },
                position: { x: 0, y: 0, z: 0 },
                isSolid: true
            },
            northPyramid: {
                name: "Pyramid of Gevurah",
                golem: {
                    guf: { PyramidGeometry: [15, 30, 4] },
                    toyr: { MeshLambertMaterial: { color: "#ff4500" } } // Reddish
                },
                position: { x: 0, y: 0, z: -80 },
                isSolid: true
            },
            southPyramid: {
                name: "Pyramid of Chesed",
                golem: {
                    guf: { PyramidGeometry: [15, 30, 4] },
                    toyr: { MeshLambertMaterial: { color: "#00aaff" } } // Bluish
                },
                position: { x: 0, y: 0, z: 80 },
                isSolid: true
            }
        },
        CustomNpc: {
            watcher: {
                name: "The Geometer",
                path: "procedural", // Uses intense floating geometry if GLB missing
                customData: {
                    color: "#00ff00", 
                    dialogueTree: [
                        {
                            message: "B\"H\nWelcome to the Forest of Geometry. Look around you. The dome, the pyramids... they are not loaded from files. They are summoned directly from the void through mathematical equations in the GeometryManager.",
                            responses: [
                                { text: "It is incredibly stable.", nextMessageIndex: 1 },
                                { text: "I must continue exploring.", type: "close" }
                            ]
                        },
                        {
                            message: "Yes. By stripping away external dependencies, we achieve absolute purity. The grass you stand upon is calculated entirely within the GPU.",
                            responses: [
                                { text: "Praise the Creator.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 15, y: 2, z: 0 },
                proximity: 8
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 160,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb", // The requested stable player!
                position: { x: 0, y: 15, z: 30 }, // Drop safely near the dome
                on: {
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Entered the Geometric Forest!", color: "#FFD700" });
                    }
                }
            }
        }
    }
};
