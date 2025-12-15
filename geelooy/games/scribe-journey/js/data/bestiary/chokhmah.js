
// B"H
// js/data/bestiary/chokhmah.js

export const chokhmahBeasts = {
    'spark_of_insight': { name: "Spark of Insight", emoji: '💡', type: 'Chokhmah', baseStats: { hp: 40, attack: 40, defense: 10, diligence: 40 }, moves: ['Chokhmah_Flash', 'Fade'], xpYield: 120, moneyYield: { perutah: 80 } },
    'paradox_loop': { name: "Paradox Loop", emoji: '➰', type: 'Chokhmah', baseStats: { hp: 150, attack: 5, defense: 50, diligence: 5 }, moves: ['Circular_Logic', 'Invalidate'], xpYield: 180, moneyYield: { perutah: 150 } },
    'point_of_origin': { name: "Point of Origin", emoji: '📍', type: 'Chokhmah', baseStats: { hp: 20, attack: 100, defense: 0, diligence: 100 }, moves: ['Chokhmah_Flash', 'Ethereal_Strike'], xpYield: 500, moneyYield: { perutah: 300 }, drops: [{itemId: 'ink_of_creation', chance: 0.1}] },
};
