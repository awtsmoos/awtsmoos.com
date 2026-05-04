
/**
 * B"H
 * @file emerald.js
 * @description
 * 🌿 THE INTENSIFIED EMERALD VOID 🌿
 * 
 * Chapter 21: The Garden of Infinite Dwellings.
 * A world of rolling emerald hills, connected by ancient roads, 
 * and populated with multi-story sanctuaries of learning.
 */

export default {
    shaym: "Emerald_Void_Intensified",

    nivrayim: {
        ProceduralTerrain: {
            theSoil: {
                name: "Emerald_Grass_Terrain",
                width: 10000,
                depth: 10000,
                segments: 32, 
                textureType: "safegrass",
                hills:[
                    { x: 300, z: 300, height: 15, radius: 150 },
                    { x: -300, z: -300, height: 12, radius: 120 },
                    { x: 500, z: -500, height: 20, radius: 200 }
                ],
                position: { x: 0, y: -0.5, z: 0 },
                isSolid: true
            }
        },

        ProceduralFlora: [
            // B"H: Carpeting the world in Grass
            { floraType: "grass", count: 800, radius: 200, position: { x: 0, y: 0, z: 0 } },
            { floraType: "grass", count: 500, radius: 150, position: { x: 100, y: 0, z: 100 } },
            { floraType: "grass", count: 500, radius: 150, position: { x: -100, y: 0, z: -100 } },
            { floraType: "grass", count: 300, radius: 100, position: { x: 300, y: 0, z: 0 } },
            { floraType: "grass", count: 300, radius: 100, position: { x: 0, y: 0, z: 300 } },
            
            // B"H: Scattered Flowers
            { floraType: "flower", count: 50, radius: 80, position: { x: 50, y: 0, z: 50 } },
            { floraType: "flower", count: 50, radius: 80, position: { x: -50, y: 0, z: -50 } },
            
            // B"H: Ancient Rocks
            { floraType: "rock", count: 10, radius: 50, position: { x: 150, y: 0, z: 150 } },
            { floraType: "rock", count: 10, radius: 50, position: { x: -150, y: 0, z: -150 } }
        ],

        ProceduralRoad: {
            mainHighway: {
                name: "The_Avenue_of_Light",
                points: [[0,0], [0, -300], [200, -500], [500, -500]],
                width: 15,
                sidewalkWidth: 4,
                position: { x: 0, y: 0.1, z: 0 },
                isSolid: true
            },
            villageLoop: {
                name: "Sanctuary_Circle",
                points: [[-100,0], [-200, 100], [-300, 0], [-200, -100], [-100,0]],
                width: 10,
                sidewalkWidth: 2,
                position: { x: 0, y: 0.1, z: 0 },
                isSolid: true
            }
        },

        ProceduralBuilding: {
            sanctuary1: {
                name: "The_Great_Yeshiva",
                housePreset: "generateSkyscraper",
                housePresetArg: 4, 
                position: { x: 550, y: 0, z: -500 },
                isSolid: true
            },
            livingQuarters: {
                name: "Chossid_Mansion",
                housePreset: "Mansion",
                position: { x: -200, y: 0, z: 150 },
                isSolid: true
            },
            guestHouse: {
                name: "Hospitality_Chamber",
                housePreset: "TwoStoryWithStairs",
                position: { x: -300, y: 0, z: -50 },
                isSolid: true
            },
            learningHall: {
                name: "The_Inner_Beis_Medrash",
                housePreset: "BeisMedrash",
                position: { x: 200, y: 0, z: 300 },
                isSolid: true
            }
        },

        ProceduralTree: [
            { name: "Giant_Oak_1", position: { x: 100, y: 0, z: -100 }, scale: 2.5 },
            { name: "Giant_Oak_2", position: { x: -100, y: 0, z: 100 }, scale: 2.5 },
            { name: "Grove_1", position: { x: 120, y: 0, z: -120 }, scale: 1.2 },
            { name: "Grove_2", position: { x: 130, y: 0, z: -110 }, scale: 1.0 },
            { name: "Grove_3", position: { x: 110, y: 0, z: -130 }, scale: 0.8 },
            { name: "Guardian_Tree", position: { x: 0, y: 0, z: 0 }, scale: 3.0 }
        ],

        Domem: {
            worldCenter: {
                name: "The_Cornerstone",
                golem: { guf: { BoxGeometry: [2, 10, 2] }, toyr: { MeshStandardMaterial: { color: "#ffd700" } } },
                position: { x: 0, y: 5, z: 0 }
            }
        },

        Chossid:[
            {
                name: "The Chossid",
                height: 1.5,
                speed: 15, // Normal game speed
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb?k=2",
                position: { x: 10, y: 5, z: 10 }
            }
        ]
    }
};
