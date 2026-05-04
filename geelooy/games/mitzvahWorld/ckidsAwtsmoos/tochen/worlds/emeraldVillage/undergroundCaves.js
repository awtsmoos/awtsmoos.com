// B"H
/**
 * @module undergroundCaves
 * @description THE HIDDEN DEPTHS — Underground tunnel systems and caves
 * Built using ProceduralBuilding placed underground (y < 0) or SolidBlocks.
 * Every dark place contains hidden sparks of light waiting to be elevated.
 */

export const CAVE_SYSTEMS = [
    {
        id: "cave_system_alpha",
        name: "The Gevurah Depths",
        center: { x: 50, z: -80 },
        depth: -10,
        blueprint: {
            rooms: [
                { width: 20, height: 10, depth: 20, offset: [0, 0, 0], wallThickness: 2, entrances: [{ wall: 'front', width: 4, height: 6, offset: 0 }] },
                { width: 15, height: 8, depth: 30, offset: [17.5, 0, 5], wallThickness: 2, entrances: [{ wall: 'left', width: 4, height: 6, offset: -5 }] },
                { width: 40, height: 15, depth: 40, offset: [45, 0, 0], wallThickness: 2, entrances: [{ wall: 'left', width: 4, height: 6, offset: 0 }] }
            ],
            materials: [
                { MeshStandardMaterial: { color: "#222222", roughness: 1.0 } }, // Walls
                { MeshStandardMaterial: { color: "#111111", roughness: 1.0 } }, // Roof
                { MeshStandardMaterial: { color: "#1a1a1a", roughness: 1.0 } }, // Floor
                { MeshStandardMaterial: { color: "#333333", roughness: 1.0 } }  // Trim
            ]
        },
        ramps: [
            // A long staircase from the surface (y=0) down to the cave entrance (y=-10)
            { x: 50, z: -70, width: 4, height: 10, depth: 10, rotY: 0 }
        ],
        collectables: [
            { itemId: "gem_diamond", itemName: "Diamond of Truth", itemType: "resource", meshType: "sphere", color: 0xb9f2ff, amount: 1, offset: { x: 50, z: 0 } },
            { itemId: "coin_gold", itemName: "Ancient Shekel", itemType: "currency", meshType: "coin", color: 0xffd700, amount: 50, offset: { x: 40, z: 10 } }
        ],
        bosses: [
            { name: "The Ancient Mazik", localPos: { x: 45, z: 5 }, color: 0x440000, maxHp: 150, damage: 30, aggroRange: 35, xpValue: 500,
              drops: [{ itemId: "gem_diamond", itemName: "Ancient Diamond", itemType: "resource", meshType: "sphere", color: 0xb9f2ff, amount: 2 }] }
        ]
    },
    {
        id: "cave_system_beta",
        name: "The Chochmah Tunnels",
        center: { x: -100, z: 80 },
        depth: -15,
        blueprint: {
            rooms: [
                { width: 10, height: 8, depth: 50, offset: [0, 0, 0], wallThickness: 2, entrances: [{ wall: 'back', width: 4, height: 6, offset: 0 }] },
                { width: 30, height: 12, depth: 30, offset: [0, 0, -40], wallThickness: 2, entrances: [{ wall: 'front', width: 4, height: 6, offset: 0 }] }
            ],
            materials: [
                { MeshStandardMaterial: { color: "#1e2a38", roughness: 0.9 } }, // Walls
                { MeshStandardMaterial: { color: "#0f151c", roughness: 0.9 } }, // Roof
                { MeshStandardMaterial: { color: "#161f29", roughness: 0.9 } }, // Floor
                { MeshStandardMaterial: { color: "#253446", roughness: 0.9 } }  // Trim
            ]
        },
        ramps: [
            { x: -100, z: 105, width: 4, height: 15, depth: 15, rotY: Math.PI } // Flipped so player walks down into the back entrance
        ],
        collectables: [
            { itemId: "gem_amethyst", itemName: "Amethyst of Wisdom", itemType: "resource", meshType: "sphere", color: 0x9966cc, amount: 2, offset: { x: 0, z: -40 } }
        ],
        bosses: [
            { name: "Guardian of the Deep", localPos: { x: 5, z: -40 }, color: 0x000044, maxHp: 200, damage: 25, aggroRange: 25, xpValue: 600,
              drops: [{ itemId: "gem_amethyst", itemName: "Primal Amethyst", itemType: "resource", meshType: "sphere", color: 0x9966cc, amount: 3 }] }
        ]
    },
    {
        id: "labyrinth_of_confusion",
        name: "The Labyrinth of Tohu",
        center: { x: 200, z: 200 },
        depth: -20,
        blueprint: {
            rooms: [
                { width: 80, height: 10, depth: 80, offset: [0, 0, 0], wallThickness: 3, entrances: [{ wall: 'front', width: 4, height: 6, offset: 0 }] },
                // Inner maze walls
                { width: 60, height: 10, depth: 4, offset: [0, 0, 20], wallThickness: 2, entrances: [{ wall: 'left', width: 6, height: 6, offset: -25 }] },
                { width: 4, height: 10, depth: 60, offset: [20, 0, -10], wallThickness: 2, entrances: [{ wall: 'front', width: 6, height: 6, offset: 0 }] },
                { width: 40, height: 10, depth: 4, offset: [-10, 0, -20], wallThickness: 2, entrances: [{ wall: 'right', width: 6, height: 6, offset: 15 }] }
            ],
            materials: [
                { MeshStandardMaterial: { color: "#3a0000", roughness: 1.0 } }, // Walls
                { MeshStandardMaterial: { color: "#110000", roughness: 1.0 } }, // Roof
                { MeshStandardMaterial: { color: "#220000", roughness: 1.0 } }, // Floor
                { MeshStandardMaterial: { color: "#440000", roughness: 1.0 } }  // Trim
            ]
        },
        ramps: [
            { x: 200, z: 245, width: 6, height: 20, depth: 25, rotY: 0 } // Massive ramp down
        ],
        collectables: [
            { itemId: "shard_tohu", itemName: "Shard of Tohu", itemType: "resource", meshType: "sphere", color: 0xff4400, amount: 1, offset: { x: 0, z: 0 } },
            { itemId: "shard_tohu", itemName: "Shard of Tohu", itemType: "resource", meshType: "sphere", color: 0xff4400, amount: 1, offset: { x: -30, z: 30 } },
            { itemId: "shard_tohu", itemName: "Shard of Tohu", itemType: "resource", meshType: "sphere", color: 0xff4400, amount: 1, offset: { x: 30, z: -30 } }
        ],
        bosses: [
            { name: "The Minotaur of Confusion", localPos: { x: 0, z: 0 }, color: 0x880000, maxHp: 300, damage: 40, aggroRange: 30, xpValue: 1000 },
            { name: "Echo of Chaos", localPos: { x: -30, z: 30 }, color: 0x440044, maxHp: 150, damage: 20, aggroRange: 20, xpValue: 400 }
        ]
    },
    {
        id: "sky_palace_binah",
        name: "The Palace of Understanding (Binah)",
        center: { x: -200, z: -200 },
        depth: 200, // High in the sky!
        blueprint: {
            rooms: [
                { width: 50, height: 30, depth: 50, offset: [0, 0, 0], wallThickness: 2, entrances: [{ wall: 'front', width: 6, height: 10, offset: 0 }] },
                { width: 20, height: 50, depth: 20, offset: [0, 0, -20], wallThickness: 2, entrances: [] } // Central tower
            ],
            materials: [
                { MeshStandardMaterial: { color: "#ffffff", metalness: 0.8, roughness: 0.1 } }, // Walls
                { MeshStandardMaterial: { color: "#eeeeff", metalness: 0.5, roughness: 0.2 } }, // Roof
                { MeshStandardMaterial: { color: "#ddddff", metalness: 0.9, roughness: 0.05 } }, // Floor
                { MeshStandardMaterial: { color: "#gold", metalness: 1.0, roughness: 0.1 } }  // Trim
            ]
        },
        ramps: [
            // A colossal "Stairway to Heaven" starting far away
            { x: -100, z: -100, width: 10, height: 200, depth: 150, rotY: Math.PI / 4 }
        ],
        collectables: [
            { itemId: "crown_binah", itemName: "Crown of Understanding", itemType: "resource", meshType: "sphere", color: 0xffffff, amount: 1, offset: { x: 0, z: -20 } }
        ],
        bosses: [
            { name: "Seraph of Awe", localPos: { x: 0, z: 10 }, color: 0xffffff, maxHp: 500, damage: 50, aggroRange: 40, xpValue: 2000 }
        ]
    },
    // ═══ THE NEW REALMS OF ADVENTURE ═══
    {
        id: "void_of_kelipos",
        name: "The Void of the Kelipos",
        center: { x: 400, z: -400 },
        depth: -100, // Extremely deep
        blueprint: {
            rooms: [
                { width: 100, height: 40, depth: 100, offset: [0, 0, 0], wallThickness: 5, entrances: [{ wall: 'front', width: 10, height: 15, offset: 0 }] },
                { width: 40, height: 20, depth: 40, offset: [0, 0, 80], wallThickness: 2, entrances: [] }
            ],
            materials: [
                { MeshStandardMaterial: { color: "#050505", roughness: 1.0, emissive: "#110000", emissiveIntensity: 0.5 } }, // Walls
                { MeshStandardMaterial: { color: "#000000", roughness: 1.0 } }, // Roof
                { MeshStandardMaterial: { color: "#0a0000", roughness: 1.0 } }, // Floor
                { MeshStandardMaterial: { color: "#ff0000", roughness: 0.2 } }  // Trim
            ]
        },
        ramps: [
            { x: 400, z: -340, width: 8, height: 100, depth: 80, rotY: 0 } // A terrifyingly long staircase
        ],
        collectables: [
            { itemId: "spark_of_creation", itemName: "Lost Spark of Creation", itemType: "resource", meshType: "sphere", color: 0xffffff, amount: 1, offset: { x: 0, z: 80 } },
            { itemId: "spark_of_creation", itemName: "Lost Spark of Creation", itemType: "resource", meshType: "sphere", color: 0xffffff, amount: 1, offset: { x: 30, z: 0 } },
            { itemId: "spark_of_creation", itemName: "Lost Spark of Creation", itemType: "resource", meshType: "sphere", color: 0xffffff, amount: 1, offset: { x: -30, z: 0 } }
        ],
        bosses: [
            { name: "Leviathan of the Abyss", localPos: { x: 0, z: 0 }, color: 0x220033, maxHp: 1000, damage: 80, aggroRange: 50, xpValue: 5000,
              drops: [{ itemId: "spark_of_creation", itemName: "Essence of Creation", itemType: "resource", meshType: "sphere", color: 0xffffff, amount: 10 },
                      { itemId: "coin_gold", itemName: "Ancient Shekel", itemType: "currency", color: 0xffd700, amount: 500 }] }
        ]
    },
    {
        id: "temple_ruins",
        name: "The Hidden Temple Ruins",
        center: { x: -400, z: 400 },
        depth: -50,
        blueprint: {
            rooms: [
                { width: 60, height: 25, depth: 100, offset: [0, 0, 0], wallThickness: 3, entrances: [{ wall: 'front', width: 8, height: 12, offset: 0 }] }
            ],
            materials: [
                { MeshStandardMaterial: { color: "#ffd700", roughness: 0.4, metalness: 0.6 } }, // Golden Walls
                { MeshStandardMaterial: { color: "#ffffff", roughness: 0.1 } }, // Roof
                { MeshStandardMaterial: { color: "#eeeeee", roughness: 0.1 } }, // Marble Floor
                { MeshStandardMaterial: { color: "#0000ff", roughness: 0.5 } }  // Techeiles Trim
            ]
        },
        ramps: [
            { x: -400, z: 460, width: 8, height: 50, depth: 60, rotY: Math.PI } // Golden staircase
        ],
        collectables: [
            { itemId: "menorah_gold", itemName: "The Pure Menorah", itemType: "resource", meshType: "box", color: 0xffd700, amount: 1, offset: { x: 0, z: -30 } },
            { itemId: "shulchan_gold", itemName: "The Golden Table", itemType: "resource", meshType: "box", color: 0xffd700, amount: 1, offset: { x: -15, z: -10 } }
        ],
        bosses: [
            { name: "Guardian Cherub", localPos: { x: 0, z: -10 }, color: 0xffffff, maxHp: 600, damage: 45, aggroRange: 30, xpValue: 3000 }
        ]
    }
];
