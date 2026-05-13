// B"H
/**
 * @module HousePresets
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE BLUEPRINTS OF THE SANCTUARY — HOUSE PRESETS                                ║
 * ║                                                                                  ║
 * ║  "According to all that I show you, the pattern of the Tabernacle..."           ║
 * ║  (Shemos 25:9)                                                                  ║
 * ║                                                                                  ║
 * ║  Defines intense, complex JSON blueprints for multi-room, multi-story houses.    ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

export const HousePresets = {
    "SingleRoom": {
        rooms: [
            {
                width: 14, height: 8, depth: 14, wallThickness: 1, offset: [0, 0, 0],
                entrances: [{ wall: 'front', width: 4, height: 6.5, offset: 0 }],
                furniture: [
                    { type: "table", pos: [0, 0, 0], scale: [3, 1, 3] },
                    { type: "chair", pos: [4, 0, 0], rotation: [0, Math.PI, 0] }
                ]
            }
        ]
    },
    "TwoBedroom": {
        rooms: [
            // B"H: The Living Soul of the House
            {
                width: 22, height: 12, depth: 22, wallThickness: 1.5, offset: [0, 0, 0],
                entrances: [
                    { wall: 'front', width: 5, height: 7, offset: 0 },
                    { wall: 'left', width: 4, height: 6.5, offset: 6 },
                    { wall: 'right', width: 4, height: 6.5, offset: -6 }
                ],
                furniture: [
                    { type: "table", pos: [0, 0, 0], scale: [6, 1, 4] },
                    { type: "chair", pos: [7, 0, 0], rotation: [0, Math.PI / 2, 0] },
                    { type: "chair", pos: [-7, 0, 0], rotation: [0, -Math.PI / 2, 0] },
                    { type: "bookshelf", pos: [0, 0, -10], scale: [12, 10, 1.5] }
                ]
            },
            {
                width: 14, height: 10, depth: 14, wallThickness: 1, offset: [-18, 0, 4],
                entrances: [{ wall: 'right', width: 4, height: 6.5, offset: 4 }],
                furniture: [{ type: "bed", pos: [-3, 0, -3] }]
            },
            {
                width: 14, height: 10, depth: 14, wallThickness: 1, offset: [18, 0, -4],
                entrances: [{ wall: 'left', width: 4, height: 6.5, offset: -4 }],
                furniture: [{ type: "bed", pos: [3, 0, 3] }]
            }
        ]
    },
    "GrandLibrary": {
        rooms: [
            {
                width: 35, height: 25, depth: 35, wallThickness: 2.5, offset: [0, 0, 0],
                entrances: [{ wall: 'front', width: 6, height: 8, offset: 0 }],
                furniture: [
                    { type: "bookshelf", pos: [-15, 0, -15], scale: [1, 22, 30] },
                    { type: "bookshelf", pos: [15, 0, -15], scale: [1, 22, 30] },
                    { type: "bookshelf", pos: [0, 0, -16], scale: [25, 22, 1] },
                    { type: "table", pos: [0, 0, 0], scale: [12, 1, 6] },
                    { type: "chair", pos: [0, 0, 5], rotation: [0, Math.PI, 0] },
                    { type: "chair", pos: [0, 0, -5], rotation: [0, 0, 0] }
                ]
            }
        ]
    },
    "TwoStoryWithStairs": {
        rooms: [
            // Ground Floor: Public Realm
            {
                width: 20, height: 12, depth: 20, wallThickness: 1.2, offset: [0, 0, 0],
                entrances: [{ wall: 'front', width: 4.5, height: 7, offset: 0 }],
                furniture: [
                    { type: "stairs", pos: [7, 0, 7], targetY: 12 },
                    { type: "table", pos: [-5, 0, 0], scale: [4, 1, 4] },
                    { type: "chair", pos: [-5, 0, 3] }
                ]
            },
            // Second Floor: Private Sanctum
            {
                width: 20, height: 10, depth: 20, wallThickness: 1.2, offset: [0, 12, 0],
                entrances: [{ wall: 'front', width: 4, height: 6.5, offset: 0 }], 
                furniture: [
                    { type: "bed", pos: [0, 0, -5] },
                    { type: "railing", pos: [0, 0, 9.5], scale: [20, 3, 0.5] }
                ]
            }
        ]
    },
    "BeisMedrash": {
        rooms: [
            {
                width: 40, height: 30, depth: 40, wallThickness: 3, offset: [0, 0, 0],
                entrances: [{ wall: 'front', width: 6, height: 8, offset: 0 }],
                furniture: [
                    { type: "aron_kodesh", pos: [0, 0, -18], scale: [8, 20, 4] },
                    { type: "bimah", pos: [0, 0, 0], scale: [8, 3, 8] },
                    { type: "table", pos: [-10, 0, 10], scale: [12, 1, 4] },
                    { type: "table", pos: [10, 0, 10], scale: [12, 1, 4] },
                    { type: "chair", pos: [-10, 0, 13] },
                    { type: "chair", pos: [10, 0, 13] }
                ]
            }
        ]
    },
    "Mansion": {
        rooms: [
            // Central Foyer
            { width: 24, height: 15, depth: 24, wallThickness: 2, offset: [0, 0, 0],
              entrances: [
                  { wall: 'front', width: 6, height: 8, offset: 0 },
                  { wall: 'back', width: 4, height: 7, offset: 0 },
                  { wall: 'left', width: 4, height: 7, offset: 0 },
                  { wall: 'right', width: 4, height: 7, offset: 0 }
              ],
              furniture: [{ type: "stairs", pos: [0, 0, 0], targetY: 15 }]
            },
            // Left Wing: Hall of Hospitality
            { width: 20, height: 15, depth: 30, wallThickness: 1.5, offset: [-22, 0, 0],
              entrances: [{ wall: 'right', width: 4, height: 7, offset: 0 }],
              furniture: [{ type: "table", pos: [0, 0, 0], scale: [15, 1, 5] }]
            },
            // Right Wing: Chamber of Contemplation
            { width: 20, height: 15, depth: 30, wallThickness: 1.5, offset: [22, 0, 0],
              entrances: [{ wall: 'left', width: 4, height: 7, offset: 0 }],
              furniture: [{ type: "bookshelf", pos: [8, 0, 0], scale: [1, 10, 20] }]
            },
            // Second Floor: Celestial Hallway
            { width: 64, height: 12, depth: 20, wallThickness: 2, offset: [0, 15, 0],
              entrances: [{ wall: 'front', width: 4, height: 7, offset: 0 }],
              furniture: [{ type: "railing", pos: [0, 0, 9.5], scale: [64, 4, 1] }]
            }
        ]
    },
    "HouseWithPatio": {
        rooms: [
            {
                width: 20, height: 10, depth: 15, wallThickness: 1.2, offset: [0, 0, 0],
                entrances: [
                    { wall: 'front', width: 4, height: 7, offset: 0 },
                    { wall: 'back', width: 8, height: 8, offset: 0 } // Large glass door to patio
                ],
                furniture: [
                    { type: "couch", pos: [-5, 0, 0], scale: [6, 2, 3] },
                    { type: "table", pos: [4, 0, 0], scale: [3, 1, 3] }
                ]
            },
            {
                width: 10, height: 2, depth: 15, wallThickness: 0.5, offset: [0, 0, 15], // The Patio
                furniture: [{ type: "bench", pos: [0, 0, 0], scale: [6, 1, 2] }]
            }
        ]
    },
    "GardenHome": {
        rooms: [
            {
                width: 18, height: 10, depth: 18, wallThickness: 1, offset: [0, 0, 0],
                entrances: [{ wall: 'front', width: 4, height: 7, offset: 0 }],
                furniture: [
                    { type: "flower_pot", pos: [7, 0, 7] },
                    { type: "flower_pot", pos: [-7, 0, 7] },
                    { type: "bookshelf", pos: [0, 0, -8], scale: [10, 8, 1] }
                ]
            }
        ]
    },
    "generateSkyscraper": function(stories = 5) {
        const rooms = [];
        for (let i = 0; i < stories; i++) {
            rooms.push({
                width: 30, height: 15, depth: 30, wallThickness: 2.5, offset: [0, i * 15, 0],
                entrances: i === 0 ? [{ wall: 'front', width: 5, height: 7.5, offset: 0 }] : [
                    { wall: 'front', width: 4, height: 6.5, offset: 0 } 
                ],
                furniture: [
                    { type: "stairs", pos: [12, 0, 12], targetY: (i + 1) * 15 },
                    { type: "table", pos: [0, 0, 0], scale: [6, 1, 6] },
                    { type: "lamp", pos: [-10, 8, -10] }
                ]
            });
        }
        return { rooms };
    }
};

