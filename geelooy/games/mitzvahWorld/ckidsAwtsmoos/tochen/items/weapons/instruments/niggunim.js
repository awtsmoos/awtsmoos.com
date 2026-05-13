/**
 * B"H
 * @file niggunim.js
 * @description THE HARPS OF DAVID — Holy instruments and song.
 * 
 * "With ten strings of the harp..." Song is the ladder that allows 
 * the soul to ascend to the Awtsmoos.
 */

export const INSTRUMENTS = {
    violin_niggun: {
        id: "violin_niggun", name: "Niggun Violin",
        category: "Instrument", slot: "weapon", icon: "🎻", rarity: "RARE", price: 1200, sellPrice: 400,
        description: "Plays a melody that opens the heart to the light of the Infinite.",
        stats: { chochmah: 50, daas: 60, defense: 20, joy: 60 },
        specialEffect: "heal_all_allies_15hp_per_turn"
    },
    flute_david: {
        id: "flute_david", name: "Flute of King David",
        category: "Instrument", slot: "weapon", icon: "🎶", rarity: "LEGENDARY", price: 8000, sellPrice: 3000,
        description: "The flute that awakens the soul's deepest longing.",
        stats: { daas: 100, chochmah: 80, binah: 60, inspiration: 100 },
        specialEffect: "ruach_hakodesh_chance_10pct"
    },
    shofar_ram: {
        id: "shofar_ram", name: "Ram's Horn Shofar",
        category: "Instrument", slot: "weapon", icon: "📯", rarity: "EPIC", price: 2500, sellPrice: 800,
        description: "The blast that shatters the Kelipa of judgment.",
        stats: { attack: 80, daas: 70, chochmah: 50, shattering: 80 },
        specialEffect: "shofar_blast_stun_all_enemies"
    }
};
