/**
 * B"H
 * @file rebbesPesakim.js  
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE REBBE'S 12 PESUKIM — Eternal Torah Utterances                   ║
 * ║                                                                      ║
 * ║  These are the 12 Torah passages the Rebbe chose for children to     ║
 * ║  memorize — each one a pillar of light, a weapon of infinite power   ║
 * ║  against the forces of forgetfulness and darkness.                   ║
 * ║                                                                      ║
 * ║  In battle: these are the LEGENDARY TIER moves — rarest and most     ║
 * ║  devastating, unlocked through learning and reaching high Madreiga.  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const REBBE_12_PESUKIM = [
    {
        id: "rebbe_pesuk_1", tier: "LEGENDARY",
        name: "Torah Tzivah Lanu Moshe",
        text: "The Torah that Moses commanded us is the heritage of the congregation of Jacob.",
        source: "Devarim 33:4",
        icon: "🔱", damageType: "Ground", category: "Pshat",
        power: 95, accuracy: 90, pp: 10,
        pshat:  "The Torah belongs to EVERY Jew — it is our eternal inheritance, never to be taken away.",
        remez:  "Heritage (morasha) = betrothal; Israel is betrothed to Torah as bride to groom.",
        drush:  "Every Jewish child owns the Torah fully from birth. No Kelipa can claim it.",
        sod:    "Torah and the Awtsmoos are completely one. The heritage IS the Atzmus Himself.",
        effect: "Ground-LEGENDARY. Shatters Earth Kelipa completely. Inheritance strike.",
        stats: { attack: 95, chochmah: 60, defense: 40, special: "inherit_power" }
    },
    {
        id: "rebbe_pesuk_2", tier: "LEGENDARY",
        name: "Shema Yisroel",
        text: "Hear O Israel, the L-rd is our G-d, the L-rd is One.",
        source: "Devarim 6:4",
        icon: "☀️", damageType: "Air", category: "Sod",
        power: 110, accuracy: 100, pp: 8,
        pshat:  "The declaration of Divine unity — the bedrock of all Jewish faith.",
        remez:  "Hear = Binah; Israel = beauty of the soul; One = Ein Sof beyond all Sefirot.",
        drush:  "Saying Shema with kavana (intent) unifies the name of G-d in all worlds simultaneously.",
        sod:    "Yichud Ila'ah (higher unity) — everything is literally One with no other existence.",
        effect: "Air-SOD-LEGENDARY. All Kelipas in the entire zone take full damage. Unity blast.",
        stats: { attack: 110, chochmah: 100, binah: 100, daas: 100, special: "zone_unity_blast" }
    },
    {
        id: "rebbe_pesuk_3", tier: "LEGENDARY",
        name: "Boruch Shem",
        text: "Blessed is the name of His glorious kingdom forever and ever.",
        source: "Response after Shema",
        icon: "👑", damageType: "Air", category: "Sod",
        power: 100, accuracy: 95, pp: 8,
        pshat:  "The silent response to Shema — whispering the secret truth of His kingdom.",
        remez:  "Kingdom (malchuso) = Malchus (Shechinah) elevated to Atzilus.",
        drush:  "This verse was whispered because it is SO holy — used only secretly by Yaakov Avinu.",
        sod:    "On Yom Kippur it is said aloud — hinting that above time, ALL is revealed openly.",
        effect: "Sod-LEGENDARY. Reveals hidden stats of all enemies. Perfect vision.",
        stats: { attack: 100, daas: 90, special: "reveal_all_enemy_stats" }
    },
    {
        id: "rebbe_pesuk_4", tier: "LEGENDARY",
        name: "Vahavta",
        text: "You shall love the L-rd your G-d with all your heart, all your soul, and all your might.",
        source: "Devarim 6:5",
        icon: "❤️", damageType: "Fire", category: "Drush",
        power: 105, accuracy: 90, pp: 8,
        pshat:  "The commandment to love G-d in three dimensions: emotional, spiritual, material.",
        remez:  "Heart=Chesed, Soul=Netzach, Might=Hod — love expressed through all 3 lower Sefirot.",
        drush:  "Even at the moment of dying (kol nafshecha) = the Yechida never ceases to love.",
        sod:    "This is the Beinoni's eternal fuel — Ahavah Rabbah ignites even without natural feeling.",
        effect: "Fire-LEGENDARY. Burns all Kelipas for 5 turns. Love is stronger than death.",
        stats: { attack: 105, chochmah: 70, special: "love_burn_5_turns" }
    },
    {
        id: "rebbe_pesuk_5", tier: "LEGENDARY",
        name: "Anochi",
        text: "I am the L-rd your G-d who took you out of the land of Egypt, from the house of slaves.",
        source: "Shemos 20:2",
        icon: "⚡", damageType: "Fire", category: "Sod",
        power: 120, accuracy: 80, pp: 5,
        pshat:  "The first of the Ten Commandments — Divine self-revelation as liberator.",
        remez:  "Egypt (Mitzrayim) = constraints (meitzarim); exodus = liberation of the soul.",
        drush:  "The Rebbe teaches: Anochi (I) = mystical acronym Ana Nafshi Ketavit Yahavet — I Myself wrote this.",
        sod:    "The Awtsmoos Himself descended to Sinai and is embedded in every Torah letter forever.",
        effect: "LEGENDARY-ULTIMATE. Breaks ALL opponent constraints. Liberation strike.",
        stats: { attack: 120, chochmah: 90, special: "break_all_constraints" }
    },
    {
        id: "rebbe_pesuk_6", tier: "LEGENDARY",
        name: "Kabed Es Avicha",
        text: "Honor your father and your mother.",
        source: "Shemos 20:12",
        icon: "🌟", damageType: "Ground", category: "Remez",
        power: 85, accuracy: 100, pp: 12,
        pshat:  "The commandment that bridges divine service (first 5) and interpersonal laws (last 5).",
        remez:  "Father=Abba (Chochmah), Mother=Imma (Binah) — honoring them = honoring the divine intellect.",
        drush:  "The Rebbe: Parents are partners with G-d in creation. Honoring them IS honoring G-d.",
        sod:    "Kabbalah: Father-Mother-Child = Chochmah-Binah-Zeir; the cosmic family revealed.",
        effect: "Ground-LEGENDARY. Summons parental shield. Cannot be defeated for 2 turns.",
        stats: { attack: 85, defense: 80, special: "invincible_2_turns" }
    },
    {
        id: "rebbe_pesuk_7", tier: "LEGENDARY",
        name: "Lo Signov",
        text: "You shall not steal.",
        source: "Shemos 20:13",
        icon: "⚖️", damageType: "Water", category: "Pshat",
        power: 80, accuracy: 100, pp: 15,
        pshat:  "Prohibition of theft — the divine protection of boundaries.",
        remez:  "Theft = taking sparks of holiness without the vessel of permission.",
        drush:  "The Rebbe: stealing includes stealing people's time, dignity, or emotional peace.",
        sod:    "Each person's possessions contain holy sparks assigned ONLY to them by divine decree.",
        effect: "Water-LEGENDARY. Steals 30% of opponent's highest stat for 3 turns.",
        stats: { attack: 80, daas: 50, special: "stat_drain_30_pct" }
    },
    {
        id: "rebbe_pesuk_8", tier: "LEGENDARY",
        name: "Vzehakosov",
        text: "And these words that I command you today shall be upon your heart.",
        source: "Devarim 6:6",
        icon: "📖", damageType: "Air", category: "Remez",
        power: 90, accuracy: 95, pp: 10,
        pshat:  "The commandment to internalize Torah — not just know it but BE it.",
        remez:  "Heart = Tiferet; the heart as the seat where Torah becomes living fire.",
        drush:  "Even when Torah doesn't penetrate fully, keep it NEAR the heart like a door left open.",
        sod:    "The Tanya opens with this: the heart is the battleground of the two souls.",
        effect: "Air-LEGENDARY. Unlocks a secret 5th battle slot for this battle only.",
        stats: { attack: 90, binah: 60, special: "unlock_slot_5" }
    },
    {
        id: "rebbe_pesuk_9", tier: "LEGENDARY",
        name: "Veshinantam",
        text: "And you shall teach them diligently to your children and speak of them.",
        source: "Devarim 6:7",
        icon: "🎓", damageType: "Ground", category: "Drush",
        power: 88, accuracy: 95, pp: 10,
        pshat:  "The mitzvah of Torah education — the chain of transmission.",
        remez:  "Children = the next generation of Sefirot; the light descends through teaching.",
        drush:  "The Rebbe made this his life's mission: every child is an entire world.",
        sod:    "Veshinantam = veshinantam (you shall sharpen them) — Torah sharpens the intellect to infinite depth.",
        effect: "Ground-LEGENDARY. Duplicates the next attack — hits twice.",
        stats: { attack: 88, chochmah: 55, special: "duplicate_next_attack" }
    },
    {
        id: "rebbe_pesuk_10", tier: "LEGENDARY",
        name: "Uvlechtecha Baderech",
        text: "When you sit in your house, when you walk on the way, when you lie down, and when you rise up.",
        source: "Devarim 6:7",
        icon: "🛤️", damageType: "Air", category: "Pshat",
        power: 82, accuracy: 100, pp: 12,
        pshat:  "Torah in all four states of existence — comprehensive life sanctification.",
        remez:  "House=Malchus, Way=Yesod, Lying=Netzach, Rising=Hod — Torah in all 4 lower Sefirot.",
        drush:  "The Rebbe: every moment of every day is an opportunity for connection.",
        sod:    "These four states = four letters of the Divine Name (Yud-Heh-Vav-Heh).",
        effect: "Air-LEGENDARY. Attacks 4 times in one turn — one for each state.",
        stats: { attack: 82, special: "quad_strike" }
    },
    {
        id: "rebbe_pesuk_11", tier: "LEGENDARY",
        name: "Ahavas Yisroel",
        text: "You shall love your fellow as yourself — this is the great principle of the Torah.",
        source: "Vayikra 19:18 / Rabbi Akiva",
        icon: "🤝", damageType: "Fire", category: "Sod",
        power: 115, accuracy: 85, pp: 6,
        pshat:  "The greatest mitzvah of the Torah according to Rabbi Akiva.",
        remez:  "Fellow (re'acha) has gematria of 210 = years of Egyptian exile, now dissolved by love.",
        drush:  "The Rebbe: Ahavas Yisroel is the foundation on which all Torah study rests.",
        sod:    "All Jewish souls are one Root. Loving another IS loving yourself at the soul level.",
        effect: "Fire+Sod-LEGENDARY. Heals all friendly NPCs in range. Ahavas Yisroel aura.",
        stats: { attack: 115, special: "heal_all_allies_full" }
    },
    {
        id: "rebbe_pesuk_12", tier: "LEGENDARY",
        name: "Tzaddik Yesod Olam",
        text: "The righteous one is the foundation of the world.",
        source: "Mishlei 10:25",
        icon: "💎", damageType: "Ground", category: "Sod",
        power: 130, accuracy: 75, pp: 4,
        pshat:  "The Tzaddik sustains the entire world through his righteousness.",
        remez:  "Foundation (Yesod) = the Sefirah of the Tzaddik that channels divine abundance downward.",
        drush:  "The Rebbe himself IS this pasuk — the foundation of a generation.",
        sod:    "The Tzaddik's connection to the Awtsmoos literally recreates the world every instant.",
        effect: "ULTIMATE-LEGENDARY. Destroys all Kelipas in the world for 10 turns. World reset.",
        stats: { attack: 130, chochmah: 100, binah: 100, daas: 100, defense: 100, special: "world_reset_10_turns" }
    }
];
