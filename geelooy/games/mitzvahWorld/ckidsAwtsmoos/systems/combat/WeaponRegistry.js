/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE HOLY ARMORY — WeaponRegistry.js
 *   ──────────────────────────────────────────────────────────────────
 *
 *   📜 THE PSALM OF THE SACRED BLADE:
 *   From the forge of Sinai where fire met stone,
 *   The Hebrew letters carved into the bone,
 *   Of every sword and every bow they wield,
 *   The Awtsmoos's truth — an impenetrable shield!
 *
 *   Each weapon fires Hebrew letters of the Torah —
 *   The ultimate force that refines the klipah and restores the Orah.
 *
 *   @module WeaponRegistry
 *   @description Data-driven weapon definitions. Each weapon defines
 *   its type, damage, range, projectile appearance (Hebrew letter),
 *   and cost for purchasing from NPC merchants.
 * ════════════════════════════════════════════════════════════════════════
 */

// B"H - The 22 sacred Hebrew letters from which all creation flows
const HEBREW_LETTERS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ',
    'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
];

/**
 * B"H
 * @constant {Object} WEAPON_REGISTRY
 * @description The ledger of all holy armaments.
 * Each weapon channels a specific Hebrew letter as its projectile.
 */
export const WEAPON_REGISTRY = {
    /**
     * ⚔️ THE HEBREW SWORD (Cherev HaKodesh)
     * Close-range melee that fires a burst of Hebrew letters on swing.
     * The Aleph — the silent letter of breath — leads the charge.
     */
    cherev_hakodesh: {
        id: "cherev_hakodesh",
        name: "Cherev HaKodesh (Hebrew Sword)",
        icon: "⚔️",
        type: "melee",
        damage: 25,
        range: 4.0,
        attackSpeed: 0.5,
        price: 100,
        projectile: {
            letter: 'א',
            color: 0xffd700,
            speed: 30,
            lifetime: 0.4,
            size: 0.6,
            burst: 3,
            spread: 0.3
        },
        description: "The Aleph blade slices through darkness with silent fire."
    },

    /**
     * 🏹 THE HOLY BOW (Keshes HaEmes)
     * Long-range weapon that fires Hebrew letter arrows.
     * The Shin — the letter of divine fire — burns through the air.
     */
    keshes_haemes: {
        id: "keshes_haemes",
        name: "Keshes HaEmes (Bow of Truth)",
        icon: "🏹",
        type: "ranged",
        damage: 18,
        range: 50.0,
        attackSpeed: 1.0,
        price: 150,
        projectile: {
            letter: 'ש',
            color: 0xff4500,
            speed: 60,
            lifetime: 2.0,
            size: 0.4,
            burst: 1,
            spread: 0
        },
        description: "Arrows of Shin-fire arc through the heavens and strike the klipah."
    },

    /**
     * 📖 THE TORAH STAFF (Mateh HaTorah)
     * AoE weapon that fires ALL 22 letters in a radial burst.
     * The ultimate weapon — requires deep spiritual progression.
     */
    mateh_hatorah: {
        id: "mateh_hatorah",
        name: "Mateh HaTorah (Staff of Torah)",
        icon: "🪄",
        type: "magic",
        damage: 40,
        range: 20.0,
        attackSpeed: 2.0,
        price: 500,
        projectile: {
            letter: "ALL",
            color: 0xffffff,
            speed: 20,
            lifetime: 1.5,
            size: 0.3,
            burst: 22,
            spread: Math.PI * 2
        },
        description: "All 22 letters erupt in a ring of creation, refining all Mazzikim in range."
    }
};

/**
 * B"H
 * @function getRandomLetter
 * @returns {string} A random Hebrew letter from the sacred 22.
 */
export function getRandomLetter() {
    return HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
}

/**
 * B"H
 * @function getLetterByIndex
 * @param {number} i - Index into the 22 letters.
 * @returns {string} The Hebrew letter.
 */
export function getLetterByIndex(i) {
    return HEBREW_LETTERS[i % HEBREW_LETTERS.length];
}

export { HEBREW_LETTERS };
