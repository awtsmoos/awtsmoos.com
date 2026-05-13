/**
 * B"H
 * @file weapons.js — SCROLLS, STAVES, AND SACRED INSTRUMENTS
 * These are tools that amplify Torah debate power.
 */
export const WEAPONS_REGISTRY = {
    // ─── SCROLLS ─────────────────────────────────────────────────────────────
    scroll_chumash: {
        id: "scroll_chumash", name: "Chumash Scroll",
        category: "Scroll", slot: "weapon", icon: "📜", rarity: "COMMON", price: 100, sellPrice: 30,
        description: "The Five Books of Moses. Ground-type moves +20%.",
        stats: { chochmah: 20, attack: 15 },
        passiveEffect: { type: "boost_type", damageType: "Ground", amount: 0.20 }
    },
    scroll_mishnah: {
        id: "scroll_mishnah", name: "Mishnah Volume",
        category: "Scroll", slot: "weapon", icon: "📙", rarity: "UNCOMMON", price: 280, sellPrice: 90,
        description: "Six orders of law. Water-type moves +30%.",
        stats: { chochmah: 35, binah: 20, attack: 25 },
        passiveEffect: { type: "boost_type", damageType: "Water", amount: 0.30 }
    },
    scroll_gemara: {
        id: "scroll_gemara", name: "Gemara Masechta",
        category: "Scroll", slot: "weapon", icon: "📘", rarity: "RARE", price: 700, sellPrice: 230,
        description: "A tractate of Talmud. Fire-type moves +40%.",
        stats: { chochmah: 55, binah: 40, daas: 30, attack: 45 },
        passiveEffect: { type: "boost_type", damageType: "Fire", amount: 0.40 }
    },
    scroll_tanya: {
        id: "scroll_tanya", name: "Tanya — Likkutei Amarim",
        category: "Scroll", slot: "weapon", icon: "📕", rarity: "EPIC", price: 2000, sellPrice: 650,
        description: "The Written Torah of Chassidus. Air-type moves +50%. Reveals PaRDeS levels faster.",
        stats: { chochmah: 80, binah: 70, daas: 60, attack: 70 },
        passiveEffect: { type: "boost_type", damageType: "Air", amount: 0.50 },
        specialEffect: "pardes_unlock_speed_double"
    },
    scroll_zohar: {
        id: "scroll_zohar", name: "Zohar — Sefer HaZohar",
        category: "Scroll", slot: "weapon", icon: "✨", rarity: "LEGENDARY", price: 10000, sellPrice: 4000,
        description: "The Book of Radiance. All move types +30%. Unlocks Zohar passages.",
        stats: { chochmah: 150, binah: 130, daas: 120, attack: 100 },
        passiveEffect: { type: "boost_all_types", amount: 0.30 },
        specialEffect: "unlock_zohar_passages"
    },

    // ─── STAVES & RODS ───────────────────────────────────────────────────────
    staff_simple: {
        id: "staff_simple", name: "Simple Wooden Staff",
        category: "Staff", slot: "weapon", icon: "🪄", rarity: "COMMON", price: 60, sellPrice: 18,
        description: "A plain wooden staff — like Moshe in the desert.",
        stats: { attack: 20, defense: 10 }
    },
    staff_almond: {
        id: "staff_almond", name: "Almond-Wood Staff of Aaron",
        category: "Staff", slot: "weapon", icon: "🌳", rarity: "RARE", price: 900, sellPrice: 300,
        description: "From the flowering rod of Aaron. Air-type + chance to sprout new passages.",
        stats: { attack: 60, chochmah: 45, daas: 35 },
        specialEffect: "sprout_random_passage_30pct"
    },
    staff_fire: {
        id: "staff_fire", name: "Pillar of Fire Staff",
        category: "Staff", slot: "weapon", icon: "🔥", rarity: "EPIC", price: 3500, sellPrice: 1200,
        description: "Channeling the pillar of fire in the desert. Fire moves critical chance +25%.",
        stats: { attack: 90, chochmah: 60, binah: 40 },
        passiveEffect: { type: "boost_type", damageType: "Fire", amount: 0.25 },
        specialEffect: "fire_crit_25pct"
    },

    // ─── INSTRUMENTS ─────────────────────────────────────────────────────────
    violin: {
        id: "violin", name: "Niggun Violin",
        category: "Instrument", slot: "weapon", icon: "🎻", rarity: "RARE", price: 1200, sellPrice: 400,
        description: "A Chassidic niggun played before battle opens hearts. Heals allies each turn.",
        stats: { chochmah: 50, daas: 60, defense: 20 },
        specialEffect: "heal_all_allies_15hp_per_turn"
    },
    flute: {
        id: "flute", name: "Flute of King David",
        category: "Instrument", slot: "weapon", icon: "🎶", rarity: "LEGENDARY", price: 8000, sellPrice: 3000,
        description: "\"Awake, O north wind\" — the flute that awakened divine inspiration.",
        stats: { daas: 100, chochmah: 80, binah: 60 },
        specialEffect: "ruach_hakodesh_chance_10pct"
    },
    shofar: {
        id: "shofar", name: "Ram's Horn Shofar",
        category: "Instrument", slot: "weapon", icon: "📯", rarity: "EPIC", price: 2500, sellPrice: 800,
        description: "The sound of the shofar shatters all Kelipa barriers.",
        stats: { attack: 80, daas: 70, chochmah: 50 },
        specialEffect: "shofar_blast_stun_all_enemies"
    }
};

export const WEAPONS_LIST = Object.values(WEAPONS_REGISTRY);
