
// B"H
// js/data/bestiary/letters.js

/**
 * The Aleph-Bet are the building blocks of creation.
 * In the Tower of Letters, they manifest as challenges to the Scribe.
 */
export const letterBeasts = {
    'letter_aleph_mob': { name: "Aleph", emoji: '🅰️', type: 'Keter', baseStats: { hp: 500, attack: 10, defense: 10, diligence: 100 }, moves: ['Aleph_Breath'], xpYield: 100, moneyYield: { perutah: 1 } },
    'letter_bet_mob': { name: "Bet", emoji: '🅱️', type: 'Binah', baseStats: { hp: 200, attack: 20, defense: 50, diligence: 20 }, moves: ['Bet_House'], xpYield: 50, moneyYield: { perutah: 2 } },
    'letter_gimel_mob': { name: "Gimel", emoji: '🚶', type: 'Chesed', baseStats: { hp: 150, attack: 30, defense: 20, diligence: 30 }, moves: ['Gimel_Run'], xpYield: 60, moneyYield: { perutah: 3 } },
    'letter_dalet_mob': { name: "Dalet", emoji: '🚪', type: 'Malkuth', baseStats: { hp: 100, attack: 10, defense: 80, diligence: 10 }, moves: ['Dalet_Door'], xpYield: 40, moneyYield: { perutah: 4 } },
    'letter_hei_mob': { name: "Hei", emoji: '😮', type: 'Binah', baseStats: { hp: 120, attack: 15, defense: 15, diligence: 60 }, moves: ['Hei_Expression'], xpYield: 50, moneyYield: { perutah: 5 } },
    'letter_vav_mob': { name: "Vav", emoji: '⚓', type: 'Tiferet', baseStats: { hp: 180, attack: 25, defense: 25, diligence: 25 }, moves: ['Vav_Connect'], xpYield: 60, moneyYield: { perutah: 6 } },
    'letter_zayin_mob': { name: "Zayin", emoji: '🗡️', type: 'Gevurah', baseStats: { hp: 140, attack: 60, defense: 10, diligence: 40 }, moves: ['Zayin_Strike'], xpYield: 70, moneyYield: { perutah: 7 } }
};
