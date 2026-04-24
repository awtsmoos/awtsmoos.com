
/**
 * B"H
 * @file garden.js
 * @description
 * The Garden of Origins (Gan Eden).
 * A purely procedural realm formed from the mathematical speech of the Awtsmoos.
 * Features textures woven from raw noise, and spiritual entities (Malachim) 
 * composed of floating geometry and intense light.
 */

export default {
    shaym: "The Garden of Origins",
    components: {
        awduhm: "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fawdum_2.6.glb?alt=media",
        dingSound: "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Feffects%2Fding.ogg?alt=media"
    },
    nivrayim: {
        ProceduralTerrain: {
            // The Great Expanse (Ground) - Now with beautifully smooth procedural hills
            groundPlane: {
                name: "Sacred Soil",
                width: 600,
                depth: 600,
                segments: 150,
                textureType: "grass",
                hills: [
                    { x: 40, z: 40, radius: 80, height: 12 },
                    { x: -60, z: -30, radius: 100, height: 18 },
                    { x: 10, z: -120, radius: 120, height: 25 },
                    { x: -100, z: 100, radius: 150, height: 22 }
                ],
                position: { x: 0, y: -1, z: 0 },
                isSolid: true
            }
        },
        Domem: {
            // A Procedural House serving as a Sanctuary
            sanctuary: {
                name: "Ohel Moed",
                golem: {
                    guf: { HouseGeometry: [14, 8, 16, 1, 3.5, 5] },
                    toyr: { 
                        MeshStandardMaterial: { 
                            map: "awtsmoosTex://stone", 
                            roughness: 0.7,
                            color: "#dddddd"
                        } 
                    },
                    textureRepeat: { x: 3, y: 3 }
                },
                position: { x: 40, y: 11, z: 40 }, // Sitting right on top of the first hill!
                rotation: { x: 0, y: Math.PI / 4, z: 0 },
                isSolid: true
            }
        },
        ProceduralTree: {
            // Manifesting the Etz Chayim using purely procedural textures
            treeOfLife: {
                name: "Etz Chayim",
                preset: "Oak Large",
                position: { x: 10, y: 24, z: -120 }, // Placed on top of the highest hill
                scale: { x: 2.5, y: 2.5, z: 2.5 },
                isSolid: true,
                on: {
                    ready(tree) {
                        if(tree.olam && tree.branches && tree.leaves) {
                            tree.olam.loadTexture({ url: "awtsmoosTex://bark", shouldRepeat: true, repeatX: 1, repeatY: 3 })
                            .then(tex => {
                                if(tree.treeGroup.children[0].material) {
                                    tree.treeGroup.children[0].material.map = tex;
                                    tree.treeGroup.children[0].material.needsUpdate = true;
                                }
                            });
                            
                            tree.olam.loadTexture({ url: "awtsmoosTex://leaf" })
                            .then(tex => {
                                if(tree.leavesMaterial) {
                                    tree.leavesMaterial.map = tex;
                                    tree.leavesMaterial.needsUpdate = true;
                                }
                            });
                        }
                    }
                }
            },
            treeOfKnowledge: {
                name: "Etz HaDaas",
                preset: "Pine Large",
                position: { x: -60, y: 17, z: -30 }, // On another hill
                isSolid: true,
                on: {
                    ready(tree) {
                        if(tree.olam && tree.branches && tree.leaves) {
                            tree.olam.loadTexture({ url: "awtsmoosTex://bark", shouldRepeat: true, repeatX: 1, repeatY: 2 })
                            .then(tex => {
                                if(tree.treeGroup.children[0].material) {
                                    tree.treeGroup.children[0].material.map = tex;
                                    tree.treeGroup.children[0].material.color.setHex(0x553311); 
                                    tree.treeGroup.children[0].material.needsUpdate = true;
                                }
                            });
                        }
                    }
                }
            }
        },
        CustomNpc: {
            seraph1: {
                name: "Michael",
                path: "procedural", 
                customData: {
                    color: "#ff00ea", 
                    dialogueTree: [
                        {
                            message: "B\"H\nI am a Seraph, woven from the strings of logic and the breath of the Awtsmoos. This Garden is fresh from the Forge. Look at the Sanctuary on the hill!",
                            responses: [
                                { text: "It is beautiful. Did you build it?", nextMessageIndex: 1 },
                                { text: "I must continue exploring.", type: "close" }
                            ]
                        },
                        {
                            message: "The Awtsmoos built it. The ExtrudeGeometry carved the walls, and the mathematical noise painted its stones. The entire world is vibrating data.",
                            responses: [
                                { text: "Praise the Creator.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 30, y: 12, z: 50 }, // Near the Sanctuary
                proximity: 6
            },
            seraph2: {
                name: "Gavriel",
                path: "procedural", 
                customData: {
                    color: "#00ffed", 
                    dialogueTree: [
                        {
                            message: "B\"H\nThe textures beneath your feet... they did not exist until you called upon them. The ground itself swells and rises by proportional editing logic.",
                            responses: [
                                { text: "It's all so clear now.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 0, y: 3, z: 15 },
                proximity: 6
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 160,
                interactable: true,
                path: "awtsmoos://awduhm",
                position: { x: 0, y: 15, z: 0 }, // Drop in safely
                on: {
                    "jumped": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Boing!", color: "#00ffed" });
                    }
                }
            }
        }
    }
};
