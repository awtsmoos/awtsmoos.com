
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
            { floraType: "grass", count: 260, radius: 180, position: { x: 0, y: 0, z: 0 } },
            { floraType: "grass", count: 180, radius: 140, position: { x: 130, y: 0, z: 110 } },
            { floraType: "grass", count: 180, radius: 140, position: { x: -130, y: 0, z: -110 } },
            { floraType: "grass", count: 120, radius: 90, position: { x: 300, y: 0, z: 0 } },
            { floraType: "grass", count: 120, radius: 90, position: { x: 0, y: 0, z: 300 } },
            
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
                points: [[10,10], [40, 35], [120, 80], [230, 220], [500, -500]],
                width: 18,
                sidewalkWidth: 2,
                position: { x: 0, y: 0.1, z: 0 },
                isSolid: true
            },
            villageLoop: {
                name: "Sanctuary_Circle",
                points: [[30,30], [0, 40], [-200, 150], [-300, -50], [30,30]],
                width: 12,
                sidewalkWidth: 1,
                position: { x: 0, y: 0.1, z: 0 },
                isSolid: true
            }
        },

        ProceduralBuilding: {
            simpleHouse1: {
                name: "Simple_Dwelling_1",
                housePreset: "generateSimple",
                position: { x: 30, y: 0, z: 30 },
                isSolid: true
            },
            simpleHouse2: {
                name: "Simple_Dwelling_2",
                housePreset: "generateSimple",
                position: { x: 0, y: 0, z: 40 },
                isSolid: true
            },
            sanctuary1: {
                name: "The_Great_Yeshiva",
                housePreset: "BeisMedrash",
                position: { x: 120, y: 0, z: 80 },
                isSolid: true
            },
            livingQuarters: {
                name: "Chossid_House",
                housePreset: "TwoStoryWithStairs",
                position: { x: -70, y: 0, z: 70 },
                isSolid: true
            },
            guestHouse: {
                name: "Hospitality_Chamber",
                housePreset: "generateSimple",
                position: { x: -120, y: 0, z: -30 },
                isSolid: true
            },
            learningHall: {
                name: "The_Inner_Beis_Medrash",
                housePreset: "generateSimple",
                position: { x: 200, y: 0, z: 160 },
                isSolid: true
            },
            skyScraper1: {
                name: "Village_Workshop",
                housePreset: "generateSimple",
                position: { x: 70, y: 0, z: -35 },
                isSolid: true
            },
            skyScraper2: {
                name: "Market_House",
                housePreset: "generateSimple",
                position: { x: -35, y: 0, z: 105 },
                isSolid: true
            }
        },

        ProceduralTree: [
            { name: "Giant_Oak_1",   position: { x: 100,  y: 0, z: -100 }, scale: 2.5, isSolid: true },
            { name: "Giant_Oak_2",   position: { x: -100, y: 0, z: 100  }, scale: 2.5, isSolid: true },
            { name: "Grove_1",       position: { x: 120,  y: 0, z: -120 }, scale: 1.2, isSolid: true },
            { name: "Grove_2",       position: { x: 130,  y: 0, z: -110 }, scale: 1.0, isSolid: true },
            { name: "Grove_3",       position: { x: 110,  y: 0, z: -130 }, scale: 0.8, isSolid: true },
            { name: "Guardian_Tree", position: { x: 0,    y: 0, z: 0    }, scale: 3.0, isSolid: true }
        ],


        Domem: {
            villageMarker: {
                name: "Village_Path_Marker",
                golem: { guf: { BoxGeometry: [1.2, 1.8, 1.2] }, toyr: { MeshStandardMaterial: { color: "#d7ad35" } } },
                position: { x: 12, y: 0.9, z: 12 }
            }
        },

        InteractiveNpc: [
            { name: "Chossid_Friend_1", position: { x: 35, y: 0, z: 35 }, dialog: ["B\"H! The Awtsmoos is everywhere!", "Look at these magnificent dwellings!"] },
            { name: "Chossid_Friend_2", position: { x: -5, y: 0, z: 45 }, dialog: ["B\"H. We are learning how the letters of creation sustain all reality!"] }
        ],

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
