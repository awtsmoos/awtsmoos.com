
/**
 * @file garden.js
 * @description
 * THE GARDEN OF EMBODIED PURPOSE (GAN EDEN)
 * 
 * Chapter 77: THE HARMONY OF THE FORGE
 * This world is a living testament to 3D procedural generation.
 * It features a rolling landscape, a house with functional doors,
 * and multiple NPCs offering missions to elevate the sparks of the desert.
 */

export default {
    shaym: "The Garden of Embodied Purpose",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb"
    },
    nivrayim: {
        ProceduralTerrain: {
            mainGround: {
                name: "Holy Soil", width: 800, depth: 800, segments: 160,
                textureType: "safegrass",
                hills: [
                    { x: 50, z: 50, radius: 120, height: 20 },
                    { x: -80, z: -100, radius: 150, height: 35 }
                ],
                position: { x: 0, y: -1, z: 0 }, isSolid: true
            }
        },
        ProceduralBuilding: {
            sanctuary: {
                name: "House of Gathering",
                blueprint: {
                    width: 20, height: 10, depth: 20, wallThickness: 1.2,
                    materials: [
                        { AwtsmoosBrickMaterial: { color: "#f5f5f5" } },
                        { AwtsmoosWoodMaterial: { color: "#2d1a0a" } }
                    ],
                    entrances: [
                        { wall: 'front', width: 5, height: 7, offset: 0 }
                    ]
                },
                position: { x: 50, y: 19, z: 50 }, isSolid: true
            }
        },
        CustomNpc: {
            rabbi: {
                name: "Rabbi Levi", path: "awtsmoos://awduhm",
                position: { x: 10, y: 0, z: 15 },
                customData: {
                    color: "#ffffff",
                    clothes: { jacket: true, glasses: true, yamulka: true, "top-hat": true },
                    dialogueTree: [{
                        message: "B\"H\nShalom! The world is waiting for your unique light. Will you help me gather some holy sparks (coins) lost in the hills?",
                        responses: [
                            { text: "I am ready for the Shlichus!", type: "shlichus", action: "ACCEPT_COIN_QUEST" },
                            { text: "Tell me about this garden.", nextMessageIndex: 1 }
                        ]
                    }, {
                        message: "This garden is a physical reflection of spiritual intentions. Every blade of grass is calculated by the GPU, just as every deed is calculated in the Heavens.",
                        responses: [{ text: "Amazing.", type: "close" }]
                    }],
                    quests: [{
                        id: "collect_sparks_1", title: "Redemption of the Lost",
                        description: "Find 5 Perutahs in the garden.",
                        totalCollectedObjects: 5,
                        requirements: { "Perutah": 5 },
                        spawnItems: [
                            { className: "Coin", position: { x: 20, y: 5, z: 20 }, value: 1 },
                            { className: "Coin", position: { x: -30, y: 10, z: 40 }, value: 1 },
                            { className: "Coin", position: { x: 80, y: 2, z: -10 }, value: 1 },
                            { className: "Coin", position: { x: 100, y: 15, z: 100 }, value: 1 },
                            { className: "Coin", position: { x: -50, y: 25, z: -50 }, value: 1 }
                        ]
                    }]
                }
            }
        },
        Chossid: {
            me: {
                name: "player", height: 1.5, speed: 180, path: "awtsmoos://awduhm",
                position: { x: 0, y: 20, z: 0 },
                on: {
                    ready(n) { n.updateAppearance(); }
                }
            }
        }
    }
};
