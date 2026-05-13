/**
 * B"H
 * @file rabbi_levi.js
 * @description
 * 📜 RABBI LEVI YITZCHAK — The Advocate 📜
 */

export const rabbi_levi = {
    id: "npc_rabbi_levi",
    name: "Rabbi Levi Yitzchak",
    propertyId: "property_rabbiLevi",
    localPos: { x: 4, z: 4 },
    hasShop: true,
    dialogueTree: [
        { message: "B\"H! Every Jew is a holy spark in the heart of the Creator!",
          responses: [
            { text: "Tell me about the sparks.", next: 1 },
            { text: "Goodbye.", type: "close" }
          ]
        },
        { message: "The sparks are hidden in the Kelipos. Your mission is to find them and elevate them back to their Source!",
          responses: [{ text: "I will!", type: "close" }]
        }
    ],
    shopInventory: [
        { id: "challah", name: "Challah Bread", price: 5, className: "Brick", icon: "🍞" }
    ]
};
