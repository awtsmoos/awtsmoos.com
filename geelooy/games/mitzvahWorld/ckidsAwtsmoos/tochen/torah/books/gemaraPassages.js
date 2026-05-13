/**
 * B"H
 * @file gemaraPassages.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE GEMARA — FIRE OF THE SAGES                                      ║
 * ║  "The Torah is fire, the Mishna is coal, the Talmud is burning flame"║
 * ║                                                                      ║
 * ║  Fire-type moves. These strike through the logical armor of the      ║
 * ║  Kelipa with devastating analytical power.                           ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const GEMARA_PASSAGES = [
    {
        id: "gemara_bava_metzia_1", name: "Two Grasp the Garment",
        text: "Two people come before the court, each holding a garment, each claiming it is theirs.",
        source: "Bava Metzia 2a", icon: "🧥",
        category: "Drush", damageType: "Fire", tier: "COMMON",
        power: 50, accuracy: 95, pp: 20,
        pshat:  "A classic legal dispute requiring careful adjudication.",
        remez:  "Garment = the physical world; both souls claim dominion over it.",
        drush:  "The divine soul and animal soul both 'hold' the body — Talmud teaches how to judge.",
        sod:    "The garment (Torah) belongs to both — it is infinite enough for all claimants.",
        effect: "Fire-COMMON. Splits the enemy's defense in two.",
        stats: { attack: 50, daas: 25 }
    },
    {
        id: "gemara_berachos_55a", name: "Dreams",
        text: "A dream uninterpreted is like a letter unread.",
        source: "Berachos 55a", icon: "💭",
        category: "Remez", damageType: "Air", tier: "UNCOMMON",
        power: 55, accuracy: 90, pp: 18,
        pshat:  "Dreams carry messages that demand interpretation.",
        remez:  "Dreams = the language of the subconscious, the imagination (tzelem) of the soul.",
        drush:  "The Kelipa whispers through nightmares; Torah interpretation reveals the truth within.",
        sod:    "Prophetic dreams come from the level of Netzach-Hod; interpretation = Daas.",
        effect: "Air-UNCOMMON. Puts enemy in confusion state for 2 turns (dream state).",
        stats: { attack: 55, special: "confuse_2_turns" }
    },
    {
        id: "gemara_shabbos_31a", name: "Hillel's Teaching",
        text: "What is hateful to you, do not do to your fellow. This is the entire Torah; the rest is commentary. Go and learn.",
        source: "Shabbos 31a", icon: "📚",
        category: "Pshat", damageType: "Ground", tier: "RARE",
        power: 78, accuracy: 100, pp: 12,
        pshat:  "The entire Torah distilled into one principle of interpersonal ethics.",
        remez:  "Commentary (peirush) = the unfolding of Chochmah into Binah and Daas.",
        drush:  "'Go and learn' = the commandment is not just knowledge but active embodiment.",
        sod:    "The Golden Rule is the Sod of Ahavas Yisroel — all souls are one Root.",
        effect: "Ground-RARE. Cannot miss. Converts opponent's next attack into healing for player.",
        stats: { attack: 78, daas: 55, special: "reflect_as_heal" }
    },
    {
        id: "gemara_sanhedrin_37a", name: "Each Person is a World",
        text: "Whoever saves a single life, Scripture accounts it as if he had saved an entire world.",
        source: "Sanhedrin 37a", icon: "🌍",
        category: "Sod", damageType: "Air", tier: "RARE",
        power: 88, accuracy: 88, pp: 10,
        pshat:  "The infinite value of a single human life.",
        remez:  "World = Olam; each person IS an Olam (world) — a complete spiritual universe.",
        drush:  "To save one person spiritually (teach Torah, bring joy) = saving an entire cosmos.",
        sod:    "Adam was created alone to teach that each soul contains all 600,000 sub-sparks.",
        effect: "Air-RARE. Prevents the next death — auto-revive with 50HP. One-time.",
        stats: { attack: 88, special: "auto_revive_once_50hp" }
    },
    {
        id: "gemara_makkos_24a", name: "Habakkuk's One Principle",
        text: "Habakkuk came and established all of Torah on one principle: the righteous shall live by his faith.",
        source: "Makkos 24a", icon: "🏔️",
        category: "Sod", damageType: "Air", tier: "RARE",
        power: 82, accuracy: 92, pp: 10,
        pshat:  "The reduction of all 613 mitzvot to the single principle of faith (emunah).",
        remez:  "Faith = Yesod; the righteous (Tzaddik) channels this faith through all worlds.",
        drush:  "Emunah doesn't require understanding — it transcends the intellect entirely.",
        sod:    "Emunah = the Yechida (highest soul level) which cannot be affected by Kelipa at all.",
        effect: "Air-RARE. Faith shield — blocks all attacks for 1 full turn.",
        stats: { attack: 82, defense: 100, special: "faith_shield_1_turn" }
    },
    {
        id: "gemara_yoma_86a", name: "Great is Teshuvah",
        text: "Great is teshuvah, for intentional sins become like merits.",
        source: "Yoma 86a", icon: "♻️",
        category: "Drush", damageType: "Fire", tier: "UNCOMMON",
        power: 65, accuracy: 95, pp: 15,
        pshat:  "The transformative power of teshuvah (repentance) — it reverses spiritual polarity.",
        remez:  "Merits from sins = sparks released from the Kelipa and elevated to holiness.",
        drush:  "The higher the fall, the higher the potential rise — 'And a man goes to his world.'",
        sod:    "Teshuvah touches the Atzmus — therefore even sins become merits in its wake.",
        effect: "Fire-UNCOMMON. Converts all current debuffs into equal buffs. Reversal.",
        stats: { attack: 65, special: "debuffs_to_buffs" }
    }
];
