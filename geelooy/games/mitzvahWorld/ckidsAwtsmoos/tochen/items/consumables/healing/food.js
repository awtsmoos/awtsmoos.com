/**
 * B"H
 * @file food.js
 * @description THE BREAD OF LIFE — Holy foods and sustenance.
 * 
 * Physical food is a vessel for spiritual energy. By eating with 
 * holy intention, the Chossid elevates the sparks within the matter.
 */

export const FOOD = {
    challah_small: {
        id: "challah_small", name: "Shabbos Challah",
        category: "Food", icon: "🍞", rarity: "COMMON", price: 8, sellPrice: 2,
        description: "Freshly baked challah. Restores health and brings the taste of Shabbos.",
        effect: { type: "heal", value: 25, joy: 5 }
    },
    challah_round: {
        id: "challah_round", name: "Round Rosh Hashana Challah",
        category: "Food", icon: "🍞", rarity: "UNCOMMON", price: 25, sellPrice: 8,
        description: "Symbolizing the circularity of time and the crown of the King.",
        effect: { type: "heal", value: 60, sweetness: 10 }
    },
    rugelach: {
        id: "rugelach", name: "Rugelach",
        category: "Food", icon: "🥐", rarity: "COMMON", price: 12, sellPrice: 4,
        description: "Sweet rolls of delight. A quick energy boost for the soul.",
        effect: { type: "heal", value: 35, energy: 10 }
    },
    honey_cake: {
        id: "honey_cake", name: "Lekach Honey Cake",
        category: "Food", icon: "🍰", rarity: "UNCOMMON", price: 40, sellPrice: 12,
        description: "Traditionally given on Erev Yom Kippur. May we have a sweet year.",
        effect: { type: "heal", value: 80, buff: { attack: 10, duration: 60 } }
    },
    kugel_jerusalem: {
        id: "kugel_jerusalem", name: "Jerusalem Kugel",
        category: "Food", icon: "🟡", rarity: "UNCOMMON", price: 30, sellPrice: 10,
        description: "Peppery and sweet, mirroring the complexity of the Holy City.",
        effect: { type: "heal", value: 50, buff: { defense: 15, duration: 45 } }
    },
    matzah_freedom: {
        id: "matzah_freedom", name: "Matzah of Freedom",
        category: "Food", icon: "🫓", rarity: "RARE", price: 150, sellPrice: 50,
        description: "The 'Bread of Faith' that strengthens the soul's resolve.",
        effect: { type: "heal", value: 100, clearDebuffs: true, faith_boost: 20 }
    }
};
