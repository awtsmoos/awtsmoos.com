/**
 * B"H
 * @file merchants.js
 * @description
 * 💰 THE MERCHANTS — The Vessels of Commerce 💰
 * 
 * All shop-owning NPCs with full dialogue trees, inventories, and stat-based clothing.
 */

export const MERCHANTS = [
    {
        id: "npc_merchantMoshe", name: "Moshe the Merchant",
        propertyId: "property_merchantMoshe",
        localPos: { x: 3, z: 3 },
        hasShop: true,
        dialogueTree: [
            { message: "B\"H! Welcome to my humble shop! The finest goods in the village.",
              responses: [
                { text: "Show me your wares.", action: "openShop" },
                { text: "Tell me about the village.", next: 1 },
                { text: "Goodbye.", type: "close" }
              ]
            },
            { message: "The Emerald Village was founded by ten families of Torah scholars. We trade in holy goods!",
              responses: [{ text: "Interesting!", type: "close" }]
            }
        ],
        shopInventory: [
            { id: "yamulka_blue", name: "Blue Satin Yamulka", price: 50, className: "Apparel",
              icon: "🧢", stats: { chochmah: 5, defense: 2 }, meshName: "yamulka", color: "#0033cc" },
            { id: "shirt_white", name: "White Shabbos Shirt", price: 80, className: "Apparel",
              icon: "👔", stats: { binah: 8, defense: 5 }, meshName: "outer-shirt", color: "#ffffff" },
            { id: "pants_black", name: "Chassidic Pants", price: 70, className: "Apparel",
              icon: "👖", stats: { daas: 5, defense: 4 }, meshName: "pants", color: "#111111" },
            { id: "challah", name: "Challah Bread", price: 5, className: "Brick", icon: "🍞" }
        ]
    },
    {
        id: "npc_sarahBaker", name: "Sarah the Baker",
        propertyId: "property_sarahBaker",
        localPos: { x: 4, z: 2 },
        hasShop: true,
        dialogueTree: [
            { message: "B\"H! The aroma of fresh bread is the fragrance of Shabbos!",
              responses: [
                { text: "What do you sell?", action: "openShop" },
                { text: "Goodbye.", type: "close" }
              ]
            }
        ],
        shopInventory: [
            { id: "challah_round", name: "Round Challah", price: 10, className: "Food", icon: "🍞",
              effect: { heal: 20 } },
            { id: "rugelach", name: "Rugelach", price: 15, className: "Food", icon: "🥐",
              effect: { heal: 35 } },
            { id: "honey_cake", name: "Honey Cake", price: 30, className: "Food", icon: "🍰",
              effect: { heal: 75, buff: { attack: 5, duration: 60 } } }
        ]
    },
    {
        id: "npc_yosef_forge", name: "Yosef the Weaponsmith",
        propertyId: "property_blacksmith",
        localPos: { x: 3, z: 3 },
        hasShop: true,
        dialogueTree: [
            { message: "B\"H! The forge is hot today! Need a weapon to fight the Kelipos?",
              responses: [
                { text: "Show me your weapons.", action: "openShop" },
                { text: "Tell me about the Kelipos.", next: 1 },
                { text: "Goodbye.", type: "close" }
              ]
            },
            { message: "The Kelipos are husks of unrectified energy. Each has an elemental type. Use the right Torah passage!",
              responses: [{ text: "I understand.", type: "close" }]
            }
        ],
        shopInventory: [
            { id: "hebrew_sword", name: "Hebrew Sword of Aleph", price: 200, className: "Weapon",
              icon: "⚔️", stats: { attack: 25, chochmah: 5 } },
            { id: "bow_truth", name: "Bow of Truth", price: 300, className: "Weapon",
              icon: "🏹", stats: { attack: 20, daas: 10 } },
            { id: "torah_staff", name: "Torah Staff of 22 Letters", price: 500, className: "Weapon",
              icon: "🪄", stats: { attack: 35, chochmah: 10, binah: 10, daas: 10 } }
        ]
    },
    {
        id: "npc_chaim_tailor", name: "Chaim the Tailor",
        propertyId: "property_dovid",
        localPos: { x: 5, z: 3 },
        hasShop: true,
        dialogueTree: [
            { message: "B\"H! Every garment is a vessel for the soul. Let me dress you properly!",
              responses: [
                { text: "Show me your garments.", action: "openShop" },
                { text: "Goodbye.", type: "close" }
              ]
            }
        ],
        shopInventory: [
            { id: "jacket_black", name: "Black Chassidic Jacket", price: 150, className: "Apparel",
              icon: "🧥", stats: { defense: 15, binah: 10 }, meshName: "jacket", color: "#111111" },
            { id: "jacket_blue", name: "Royal Blue Kapota", price: 250, className: "Apparel",
              icon: "🧥", stats: { defense: 20, chochmah: 15 }, meshName: "jacket", color: "#001a66" },
            { id: "tophat_black", name: "Black Top Hat", price: 120, className: "Apparel",
              icon: "🎩", stats: { defense: 8, daas: 12 }, meshName: "top-hat", color: "#0a0a0a" },
            { id: "shoes_leather", name: "Leather Shoes", price: 100, className: "Apparel",
              icon: "👞", stats: { defense: 6, speed: 2 }, meshName: "shoes", color: "#3d1c02" },
            { id: "shirt_gold", name: "Golden Shabbos Shirt", price: 400, className: "Apparel",
              icon: "👔", stats: { chochmah: 20, binah: 15, defense: 10 }, meshName: "outer-shirt", color: "#ffd700" },
            { id: "gartel_silver", name: "Silver Gartel", price: 180, className: "Apparel",
              icon: "🪢", stats: { daas: 18, defense: 5 }, meshName: "gartel", color: "#c0c0c0" }
        ]
    },
    {
        id: "npc_miriam_healer", name: "Miriam the Healer",
        propertyId: "property_healer",
        localPos: { x: 3, z: 4 },
        hasShop: true,
        dialogueTree: [
            { message: "B\"H! Healing is a Divine art. Let me tend to your wounds.",
              responses: [
                { text: "I need healing supplies.", action: "openShop" },
                { text: "Goodbye.", type: "close" }
              ]
            }
        ],
        shopInventory: [
            { id: "potion_small", name: "Small Healing Elixir", price: 25, className: "Potion",
              icon: "🧪", effect: { heal: 50 } },
            { id: "potion_large", name: "Grand Healing Elixir", price: 75, className: "Potion",
              icon: "🧪", effect: { heal: 150 } },
            { id: "potion_revive", name: "Spark of Resurrection", price: 200, className: "Potion",
              icon: "✨", effect: { revive: true, heal: 100 } }
        ]
    },
    {
        id: "npc_shlomo_gems", name: "Shlomo the Gem Dealer",
        propertyId: "property_gemShop",
        localPos: { x: 3, z: 3 },
        hasShop: true,
        dialogueTree: [
            { message: "B\"H! Gems are the concentrated sparks of holiness from the earth!",
              responses: [
                { text: "Show me your gems.", action: "openShop" },
                { text: "Tell me about the Choshen.", next: 1 },
                { text: "Goodbye.", type: "close" }
              ]
            },
            { message: "The 12 gems on the High Priest's breastplate correspond to the 12 tribes!",
              responses: [{ text: "Amazing.", type: "close" }]
            }
        ],
        shopInventory: [
            { id: "gem_emerald", name: "Emerald of Levi", price: 500, className: "Gem",
              icon: "💎", stats: { chochmah: 25, binah: 25 } },
            { id: "gem_ruby", name: "Ruby of Reuven", price: 400, className: "Gem",
              icon: "💎", stats: { attack: 30, health: 50 } },
            { id: "gem_sapphire", name: "Sapphire of Yissachar", price: 600, className: "Gem",
              icon: "💎", stats: { daas: 40, defense: 15 } }
        ]
    }
];
