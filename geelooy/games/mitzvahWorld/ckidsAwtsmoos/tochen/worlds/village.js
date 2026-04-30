
/**
 * B"H
 * @file village.js
 * @description
 * 🏘️ THE REBORN VILLAGE (TIKKUN EDITION) 🏘️
 * 
 * Chapter 50: The Harmony of Form
 * Here, the Emerald Void meets the House of Light. We have ensured the floor is 
 * not a zero-thickness illusion, but a 2-unit thick solid foundation that the 
 * Octree can easily digest.
 */

export default {
    shaym: "The Grounded Emerald Village",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb"
    }, 
    nivrayim: {
        
        Domem: {
            emeraldGround: {
                name: "Emerald_Village_Ground",
                // TIKKUN: Use a 2-unit thick Box instead of a flat Plane
                // to provide physical mass for the Octree.
                golem: {
                    guf: { BoxGeometry: [2000, 2, 2000] },
                    // The direct trigger logic in `generateMesh` ensures this triggers GLSL shader!
                    toyr: { AwtsmoosGrassMaterial: {} }
                },
                // Positioned so the top surface is exactly at Y=0
                position: { x: 0, y: -1, z: 0 },
                isSolid: true, // Crucial for Octree integration
                on: {
                    ready(me) {
                        // Force visibility in the renderer
                        if (me.mesh) {
                            me.mesh.frustumCulled = false;
                        }
                    }
                }
            }
        },

        ProceduralBuilding: {
            mainHouse: {
                name: "Village_Dwelling",
                blueprint: {
                    width: 18, height: 12, depth: 18, wallThickness: 1.5,
                    materials:[
                        { MeshLambertMaterial: { color: "#faf0e6" } }, // White brickish walls
                        { MeshLambertMaterial: { color: "#2d1a0a" } }  // Dark wood roof
                    ],
                    entrances:[ { wall: 'front', width: 4.5, height: 6.5, offset: 0 } ]
                },
                // Resting comfortably on the emerald foundation
                position: { x: 15, y: 0.1, z: 15 }, 
                isSolid: true, // Octree will bake the house walls
                interactable: true
            }
        },

        Chossid:[
            {
                name: "The Chossid",
                height: 1.5,
                speed: 180,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb?k=village_emerald_v2",
                // Drop from high up so he settles perfectly on the physics floor
                position: { x: 0, y: 40, z: 0 }, 
                on: {
                    ready(n) {
                        console.log("B\"H - 💎 [VILLAGE]: The Chossid is descending into the village.");
                        if (n && typeof n.updateAppearance === "function") {
                            n.updateAppearance();
                        }
                    },
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", { 
                            text: "Welcome to the Restored Village!", 
                            color: "#ffd700" 
                        });
                    }
                }
            }
        ]
    }
};
