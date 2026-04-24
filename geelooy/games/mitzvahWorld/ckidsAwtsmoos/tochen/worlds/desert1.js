
/**
 * B"H
 * @file desert1.js
 * @description
 * Midbar Hawawmeem - The Desert of the Nations.
 * A vast, intense procedural expanse. The ground is sculpted with huge rolling dunes,
 * generated purely from code using proportional editing math. Spiritual entities wander 
 * this wasteland, residing within extruded geometric houses, speaking profound truths.
 * It is a place of testing, a place where the soul seeks the living waters of Torah.
 */

export default {
    shaym: "Midbar Hawawmeem (Intense Procedural)",
    components: {
        awduhm: "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/models%2Fawdum_2.6.glb?alt=media",
        dingSound: "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Feffects%2Fding.ogg?alt=media"
    },
    nivrayim: {
        ProceduralTerrain: {
            // The Great Desert - Now with intense proportional editing hills!
            endlessDunes: {
                name: "The Endless Dunes",
                width: 1500,
                depth: 1500,
                segments: 200, // Very high subdivision for incredibly smooth hills
                textureType: "sand", // Draws from TextureForge
                // Define the spiritual pressure points that form the dunes
                hills: [
                    { x: 50, z: 50, radius: 120, height: 40 },
                    { x: -100, z: 180, radius: 180, height: 60 },
                    { x: 150, z: -120, radius: 250, height: 80 },
                    { x: -80, z: -80, radius: 90, height: 30 },
                    { x: 0, z: 250, radius: 300, height: 100 }, // A massive mountain
                    { x: -200, z: -200, radius: 200, height: 75 }
                ],
                position: { x: 0, y: -2, z: 0 }
            }
        },
        Domem: {
            // Procedural Architecture: The Gate of the Desert
            desertArch: {
                name: "Gate of Wandering",
                golem: {
                    guf: { ArchGeometry: [20, 25, 6] },
                    toyr: { 
                        MeshStandardMaterial: { 
                            map: "awtsmoosTex://stone", 
                            color: "#aa8855",
                            roughness: 1.0 
                        } 
                    }
                },
                position: { x: 0, y: 0, z: 60 },
                isSolid: true
            },
            // THE INTENSE EXTRUDED HOUSE!
            desertOasisHouse: {
                name: "House of Wisdom",
                golem: {
                    guf: { HouseGeometry: [18, 10, 20, 1.5, 4, 6] },
                    toyr: { 
                        MeshStandardMaterial: { 
                            map: "awtsmoosTex://stone", 
                            roughness: 0.8 
                        } 
                    },
                    textureRepeat: { x: 4, y: 4 }
                },
                position: { x: 30, y: 0, z: 30 },
                rotation: { x: 0, y: -0.5, z: 0 },
                isSolid: true
            },
            ancientPillar1: {
                name: "Pillar of Cloud",
                golem: {
                    guf: { PillarGeometry: [3, 40] },
                    toyr: { MeshStandardMaterial: { color: "#ffffff", transparent: true, opacity: 0.8, emissive: "#aaaaaa" } }
                },
                position: { x: -30, y: 0, z: -40 },
                isSolid: true
            },
            ancientPillar2: {
                name: "Pillar of Fire",
                golem: {
                    guf: { PillarGeometry: [3, 40] },
                    toyr: { MeshStandardMaterial: { color: "#ff4500", transparent: true, opacity: 0.8, emissive: "#ff0000" } }
                },
                position: { x: 30, y: 0, z: -40 },
                isSolid: true
            }
        },
        CustomNpc: {
            guide1: {
                name: "The Ancient Builder",
                path: "procedural", // Intense floating geometry!
                customData: {
                    color: "#ffaa00", // Golden aura
                    dialogueTree: [
                        {
                            message: "B\"H\nLook upon the house beside me! It was not imported from an external file. It was extruded from a sheer cube, molded by math, drawing its texture directly from the Forge of Noise.",
                            responses: [
                                { text: "It is breathtaking.", nextMessageIndex: 1 },
                                { text: "A marvel of code.", type: "close" }
                            ]
                        },
                        {
                            message: "And the hills you see in the distance? They are not static. The ground plane was subdivided and pulled upward using proportional cosine falloff. The Awtsmoos shapes the world with numbers.",
                            responses: [
                                { text: "I must explore this further.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 25, y: 2, z: 45 }, // Standing near the House
                proximity: 8
            },
            guide2: {
                name: "Voice of the Void",
                path: "procedural",
                customData: {
                    color: "#bc13fe", // Deep purple
                    dialogueTree: [
                        {
                            message: "B\"H\nI stand atop a mountain that did not exist a moment ago. Can you climb up to me? The physics engine respects the mathematically generated slopes perfectly.",
                            responses: [
                                { text: "I accept the challenge.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 0, y: 90, z: 250 }, // On top of the massive hill!
                proximity: 15
            },
            guide3: {
                name: "Merchant of Secrets",
                path: "procedural",
                customData: {
                    color: "#00ffed",
                    shopInventory: [
                        { id: "mystic_brick", className: "Brick", name: "Sapphire Stone", sellValue: 50, customData: { color: "#0000ff" } },
                        { id: "staff", className: "ElementalStaff", name: "Staff of Miracles", sellValue: 200 }
                    ],
                    dialogueTree: [
                        {
                            message: "B\"H\nIn the desert, water is scarce, but secrets flow like rivers. I trade in vessels. What do you seek?",
                            responses: [
                                { text: "Show me your wares.", type: "store" },
                                { text: "Nothing right now.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 0, y: 2, z: 50 }, // Near the Arch
                proximity: 8
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 160,
                interactable: true,
                path: "awtsmoos://awduhm",
                position: { x: 0, y: 20, z: 0 }, // Drop in high so we land softly on the generated dunes
                on: {
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Landed in the Dust", color: "#FFD700" });
                    }
                }
            }
        }
    }
};
