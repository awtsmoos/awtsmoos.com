
/**
 * B"H
 * @file emerald.js
 * @description
 * 🌿 THE EMERALD VOID 🌿
 * 
 * "In the beginning..."
 * Restored to its absolute pure state exactly as requested.
 * An infinite procedural plane coated in the divine grass,
 * providing a peaceful sandbox for the soul to wander.
 */

export default {
    shaym: "Emerald_Minimal_World",

    nivrayim: {
        ProceduralTerrain: {
            theSoil: {
                name: "Emerald_Grass_Terrain",
                width: 1500,
                depth: 1500,
                segments: 4, // Richer geometry
                textureType: "safegrass",
                hills:[
                    { x: 0, z: 0, height: 0.1, radius: 5 } // A slight rise to establish 3D volume
                ],
                position: { x: 0, y: -1.0, z: 0 },
                isSolid: true
            }
        },

        Chossid:[
            {
                name: "The Chossid",
                height: 1.5,
                speed: 180,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb?k=2",
                position: { x: 0, y: 5, z: 0 },
                on: {
                    ready(n) {
                        console.log("B\"H - 💎[LEVEL_DATA]: Chossid soul has meta-linked. Vessel is prepared.");
                        if (n && typeof n.updateAppearance === "function") {
                            n.updateAppearance();
                        }
                    }
                }
            }
        ]
    }
};
