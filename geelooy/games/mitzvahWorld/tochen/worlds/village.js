
/**
 * B"H
 * @file village.js
 * @description
 * 🏘️ VILLAGE STABILITY TEST 🏘️
 */

export default {
    shaym: "Village_Ground_Test",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb"
    }, 
    nivrayim: {
        ProceduralTerrain: {
            theSoil: {
                name: "Village_Stable_Floor",
                width: 2000, // Massive
                depth: 2000, 
                segments: 2, // Minimal polys
                textureType: "safegrass",
                hills:[], 
                position: { x: 0, y: -2, z: 0 },
                isSolid: true
            }
        },

        ProceduralBuilding: {
            testHouse: {
                name: "House_of_Light",
                blueprint: {
                    width: 15, height: 10, depth: 15, wallThickness: 1,
                    materials:[
                        { MeshLambertMaterial: { color: "#ffffff" } },
                        { MeshLambertMaterial: { color: "#000000" } }
                    ],
                    entrances:[ { wall: 'front', width: 4, height: 6, offset: 0 } ]
                },
                position: { x: 10, y: -2.1, z: 10 },
                isSolid: true
            }
        },

        Chossid:[
            {
                name: "The Chossid",
                height: 1.5,
                speed: 180,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb?k=village_v3",
                position: { x: 0, y: 50, z: 0 }, // Drop from the heavens!
                on: {
                    ready(n) {
                        console.log("B\"H - 💎 [VILLAGE_V3]: Soul manifest. Falling towards earth...");
                    }
                }
            }
        ]
    }
};
