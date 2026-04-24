
/**
 * B"H
 * @file mountainOfTorah.js
 * @description
 * An intense challenge! A massive procedural mountain sculpted from a flat plane,
 * surrounded by procedural architecture. Players must climb the mountain.
 */

export default {
    shaym: "Mountain of Torah",
    components: {}, 
    nivrayim: {
        ProceduralTerrain: {
            harSinai: {
                name: "Har Sinai",
                width: 800,
                depth: 800,
                segments: 200, // High res for smooth climbing
                textureType: "grass", // Uses the TextureForge if working, else fallback
                hills: [
                    { x: 0, z: -50, radius: 250, height: 100 } // ONE MASSIVE MOUNTAIN
                ],
                position: { x: 0, y: -2, z: 0 }
            }
        },
        Domem: {
            archOfEntering: {
                name: "Gate of Ascents",
                golem: {
                    guf: { ArchGeometry: [20, 25, 5] },
                    toyr: { MeshLambertMaterial: { color: "#eeeeee" } }
                },
                position: { x: 0, y: 0, z: 150 },
                isSolid: true
            },
            cloudAbove: {
                name: "Anan (Cloud)",
                golem: {
                    guf: { BoxGeometry: [150, 5, 150] },
                    toyr: { MeshLambertMaterial: { color: "#ffffff", transparent: true, opacity: 0.8 } }
                },
                position: { x: 0, y: 120, z: -50 }, // Floating above the mountain
                isSolid: false
            }
        },
        CustomNpc: {
            moshe: {
                name: "The Faithful Shepherd",
                path: "procedural", 
                customData: {
                    color: "#ffffff", // Pure white light
                    dialogueTree: [
                        {
                            message: "B\"H\nYou have reached the summit! This mountain was sculpted from a flat plane of 200 segments using proportional cosine falloff mathematics.",
                            responses: [
                                { text: "I am in awe of the code.", type: "close" }
                            ]
                        }
                    ]
                },
                position: { x: 0, y: 102, z: -50 }, // Standing on top of the mountain!
                proximity: 10
            }
        },
        Chossid: {
            me: {
                height: 1.5,
                name: "player",
                speed: 160,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb", // Stable player
                position: { x: 0, y: 20, z: 200 }, // Drop safely in front of the gate
                on: {
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Landed at the base of the Mountain!", color: "#ffffff" });
                    }
                }
            }
        }
    }
};
