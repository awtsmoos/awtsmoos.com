/**
 * B"H
 * @file pirkeiAvos.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  PIRKEI AVOS — ETHICS OF THE FATHERS                                 ║
 * ║  "The world stands on three things: Torah, Avodah, and Gemilut       ║
 * ║   Chasadim." (Avos 1:2)                                              ║
 * ║                                                                      ║
 * ║  These passages are battle-moves in the Arena of Clarification.      ║
 * ║  Each one carries the weight of eternity and the fire of truth.      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const PIRKEI_AVOS_PASSAGES = [
    // ─── CHAPTER 1 ───────────────────────────────────────────────────────────
    {
        id: "avos_1_1", name: "The Great Assembly",
        text: "Be deliberate in judgment, raise many students, and make a fence for the Torah.",
        author: "Men of the Great Assembly", chapter: 1, verse: 1,
        category: "Pshat", damageType: "Ground", icon: "📜",
        power: 45, accuracy: 95, pp: 20,
        pshat:  "A direct instruction for leaders of Israel in three domains.",
        remez:  "The 'fence' hints at protective layers of holiness around the divine speech.",
        drush:  "Raising students = spreading light; every student is a world reborn.",
        sod:    "The fence (geder) has gematria equal to the 32 paths of wisdom (lev).",
        effect: "Raises Defense by 15%. Stability of the Ground.",
        stats: { attack: 45, daas: 20, defense: 15 }
    },
    {
        id: "avos_1_2", name: "Three Pillars of the World",
        text: "The world stands on three things: Torah, Avodah, and Gemilut Chasadim.",
        author: "Shimon the Righteous", chapter: 1, verse: 2,
        category: "Pshat", damageType: "Ground", icon: "🌍",
        power: 60, accuracy: 100, pp: 15,
        pshat:  "The three pillars sustaining creation in the physical domain.",
        remez:  "Torah=Chochmah, Avodah=Binah, Chesed=Daas — three upper Sefirot.",
        drush:  "Without any one pillar, the world trembles and the Kelipa gains hold.",
        sod:    "These are the three garments of the soul: thought, speech, action.",
        effect: "Massive Ground damage. Cannot be dodged.",
        stats: { attack: 60, chochmah: 25, binah: 25, daas: 25 }
    },
    {
        id: "avos_1_4", name: "Sit in the Dust",
        text: "Yose ben Yoezer says: Let your house be a meeting place for the sages; sit in the dust of their feet and drink their words with thirst.",
        author: "Yose ben Yoezer", chapter: 1, verse: 4,
        category: "Pshat", damageType: "Water", icon: "💧",
        power: 50, accuracy: 90, pp: 18,
        pshat:  "Total bittul (nullification) before wisdom — the beginning of all learning.",
        remez:  "Dust = the lowest level, hinting that from lowliness come the highest revelations.",
        drush:  "Thirst for Torah is the vessel that receives the Infinite Light.",
        sod:    "Dust (afar) has the same letters as 'ohr' (light) — in the dust dwells the Light.",
        effect: "Water-type. Restores Mana. Confusion chance for opponent.",
        stats: { attack: 50, binah: 40, health: 30 }
    },
    {
        id: "avos_1_6", name: "Judge Favorably",
        text: "Receive every person with a pleasant countenance. Judge every person favorably.",
        author: "Yehoshua ben Perachya", chapter: 1, verse: 6,
        category: "Remez", damageType: "Air", icon: "☁️",
        power: 40, accuracy: 100, pp: 25,
        pshat:  "A mitzvah to see the good in others — a fence against baseless hatred.",
        remez:  "Pleasant face = the Shechinah smiling; judging favorably = revealing hidden sparks.",
        drush:  "Every person contains a hidden spark. Judging favorably helps release it.",
        sod:    "Kaf zchut (merit) has gematria of 537, equal to 'anavah' (humility) + 'ahavah' (love).",
        effect: "Air-type. 50% chance to flip opponent's next attack back.",
        stats: { attack: 40, daas: 50, special: "mercy_shield" }
    },
    {
        id: "avos_1_14", name: "If Not Now, When?",
        text: "If I am not for myself, who will be for me? And if I am only for myself, what am I? And if not now, when?",
        author: "Hillel", chapter: 1, verse: 14,
        category: "Drush", damageType: "Fire", icon: "🔥",
        power: 75, accuracy: 85, pp: 10,
        pshat:  "Personal responsibility, communal duty, and urgency of action.",
        remez:  "\"Not now\" = the Kelipa of procrastination. The fire burns NOW.",
        drush:  "The soul cries out: every moment of delay is a world lost!",
        sod:    "\"When\" (Matai) = Moshiach. The question IS the answer: Moshiach comes NOW.",
        effect: "Fire-type. Massive damage. Burns enemy for 3 turns.",
        stats: { attack: 75, chochmah: 30, special: "burn_3_turns" }
    },
    {
        id: "avos_1_15", name: "Greet Everyone in Peace",
        text: "Shammai says: Make your Torah a fixed practice; say little and do much; receive every person with a pleasant face.",
        author: "Shammai", chapter: 1, verse: 15,
        category: "Pshat", damageType: "Ground", icon: "🤝",
        power: 35, accuracy: 100, pp: 30,
        pshat:  "Consistent Torah study, reliability in speech, warmth to all people.",
        remez:  "Fixed (keva) Torah = the immovable foundation stone of Yesod.",
        drush:  "Say little, do much = the Tzaddik who acts without proclamation.",
        sod:    "Pleasant face (panim) = the 13 attributes of mercy illuminating the countenance.",
        effect: "Ground-type. Heals player 20HP per turn for 2 turns.",
        stats: { attack: 35, defense: 30, health: 50 }
    },

    // ─── CHAPTER 2 ───────────────────────────────────────────────────────────
    {
        id: "avos_2_1", name: "Which is the Right Path?",
        text: "Which is the right path that a person should choose? Whatever is glorious for the doer and brings glory from others.",
        author: "Rebbe (Rabbi Yehuda HaNasi)", chapter: 2, verse: 1,
        category: "Drush", damageType: "Air", icon: "✨",
        power: 55, accuracy: 90, pp: 15,
        pshat:  "The straight path balances personal dignity and the perception of others.",
        remez:  "Glorious (tiferet) = the middle path of Tiferet between Chesed and Gevurah.",
        drush:  "The right path is the one that radiates light in all directions simultaneously.",
        sod:    "Tiferet is the heart of Zeir Anpin, the beauty that unites above and below.",
        effect: "Air-type. Boosts all stats by 10% for 3 turns.",
        stats: { attack: 55, chochmah: 20, binah: 20, daas: 20 }
    },
    {
        id: "avos_2_4", name: "Do Not Trust in Yourself",
        text: "Do not trust in yourself until the day of your death. Do not judge your fellow until you have reached his place.",
        author: "Hillel", chapter: 2, verse: 4,
        category: "Sod", damageType: "Air", icon: "🌀",
        power: 65, accuracy: 80, pp: 12,
        pshat:  "Warning against pride and hasty judgment — the twin dangers of the Kelipa.",
        remez:  "Until death = until the Yetzer Hara is finally defeated; humility is eternal.",
        drush:  "The Kelipa of arrogance falls before the sword of bittul (nullification).",
        sod:    "Atzmo (himself) = the spark of Atzmus within; trust only THAT, not the ego.",
        effect: "Air+Sod. Nullifies opponent's highest stat. Humility blast.",
        stats: { attack: 65, daas: 60, special: "nullify_highest_stat" }
    },
    {
        id: "avos_2_5", name: "Do Not Separate Yourself",
        text: "Do not separate yourself from the community. Do not trust in yourself until the day of your death.",
        author: "Hillel", chapter: 2, verse: 5,
        category: "Pshat", damageType: "Water", icon: "🌊",
        power: 50, accuracy: 95, pp: 18,
        pshat:  "Unity with the community is a protection against spiritual failure.",
        remez:  "Community = Knesset Yisroel, the vessel of the Shechinah.",
        drush:  "Separation opens a gap for the Kelipa; unity seals it with infinite light.",
        sod:    "The 600,000 Jewish souls are one unified light; separation is illusion.",
        effect: "Water-type. Area effect — damages ALL Kelipas in range.",
        stats: { attack: 50, defense: 25, special: "aoe_splash" }
    },

    // ─── CHAPTER 3 ───────────────────────────────────────────────────────────
    {
        id: "avos_3_1", name: "Know Where You Came From",
        text: "Know where you came from, where you are going, and before Whom you will give account.",
        author: "Akavya ben Mahalalel", chapter: 3, verse: 1,
        category: "Sod", damageType: "Air", icon: "🌌",
        power: 80, accuracy: 75, pp: 8,
        pshat:  "Three meditations that lead to humility: origin, destination, accountability.",
        remez:  "From = Binah (womb of creation). Going = Malchus (the end-point). Before Whom = Keter.",
        drush:  "Remembering our source in the Infinite is the greatest weapon against the Kelipa.",
        sod:    "This pasuk contains the entire structure of Seder Hishtalshelus (cosmic chain).",
        effect: "Sod-type. Ignores all enemy defenses. Pure Atzilus radiance.",
        stats: { attack: 80, chochmah: 50, binah: 50, daas: 50 }
    },
    {
        id: "avos_3_2", name: "Pray for the Welfare of the Government",
        text: "Pray for the welfare of the government, for were it not for the fear of it, people would swallow each other alive.",
        author: "Rabbi Chanina", chapter: 3, verse: 2,
        category: "Remez", damageType: "Ground", icon: "🏛️",
        power: 45, accuracy: 100, pp: 20,
        pshat:  "Civil order is a divine gift preventing societal collapse.",
        remez:  "Government = the system of Malchus (kingship) in the lower worlds.",
        drush:  "Even imperfect order contains holy sparks of Malchus waiting to be elevated.",
        sod:    "Fear of government = yirat Shamayim (fear of Heaven) in its outer garment.",
        effect: "Ground-type. Shields player from 3 attacks.",
        stats: { attack: 45, defense: 60, special: "damage_shield_3" }
    },
    {
        id: "avos_3_14", name: "Beloved is Man",
        text: "Beloved is man, for he was created in the image of G-d. Beloved are Israel, for they are called children of G-d.",
        author: "Rabbi Akiva", chapter: 3, verse: 14,
        category: "Sod", damageType: "Air", icon: "💫",
        power: 90, accuracy: 70, pp: 5,
        pshat:  "Double belovedness: universal humanity AND the special relationship of Israel.",
        remez:  "Image of G-d = Tzelem Elokim = the intellectual Sefirot in the human soul.",
        drush:  "Every Jewish soul carries an infinite spark that can never be extinguished.",
        sod:    "The Awtsmoos Himself is revealed in the Jewish soul at Matan Torah permanently.",
        effect: "Ultimate Air-Sod. Reveals the Atzilus within. Max damage possible.",
        stats: { attack: 90, chochmah: 70, binah: 70, daas: 70, special: "atzilus_reveal" }
    },

    // ─── CHAPTER 4 ───────────────────────────────────────────────────────────
    {
        id: "avos_4_1", name: "Who is Mighty?",
        text: "Who is mighty? One who conquers his evil inclination. Who is rich? One who is satisfied with his portion.",
        author: "Ben Zoma", chapter: 4, verse: 1,
        category: "Drush", damageType: "Fire", icon: "⚡",
        power: 70, accuracy: 85, pp: 12,
        pshat:  "Redefining might and wealth in spiritual terms.",
        remez:  "Conquering the Yetzer = refining the Fire Kelipa of passion into holy energy.",
        drush:  "The true warrior fights his inner battle; every victory is cosmic.",
        sod:    "Yetzer Hara = the left column of Gevurah; refinement transforms Gevurah to Chesed.",
        effect: "Fire-type. 30% chance to convert enemy into ally for 1 turn.",
        stats: { attack: 70, daas: 45, special: "convert_chance_30" }
    },
    {
        id: "avos_4_2", name: "Mitzvah Leads to Mitzvah",
        text: "The reward of a mitzvah is a mitzvah, and the reward of a transgression is a transgression.",
        author: "Ben Azzai", chapter: 4, verse: 2,
        category: "Remez", damageType: "Fire", icon: "🔗",
        power: 55, accuracy: 90, pp: 15,
        pshat:  "Actions have momentum; good deeds open the path to more good deeds.",
        remez:  "The chain of mitzvot = the chain of divine light descending through the worlds.",
        drush:  "Each Mitzvah is a link in the cosmic chain connecting the Chossid to the Infinite.",
        sod:    "Mitzvah (command) = connection (tzavta). Each mitzvah IS the Awtsmoos.",
        effect: "Fire-type. If this attack hits, next attack does double damage.",
        stats: { attack: 55, chochmah: 35, special: "chain_bonus" }
    },
    {
        id: "avos_4_17", name: "Better One Hour",
        text: "Better is one hour of teshuvah and good deeds in this world than all of the World to Come.",
        author: "Rabbi Yaakov", chapter: 4, verse: 17,
        category: "Sod", damageType: "Air", icon: "⏳",
        power: 85, accuracy: 80, pp: 8,
        pshat:  "This world is the unique arena for action and rectification.",
        remez:  "One hour = the eternal now; action transcends even the World to Come.",
        drush:  "Teshuvah reaches higher than the angels — it touches the very root of the soul.",
        sod:    "The power of physical action in THIS world reverberates through ALL worlds above.",
        effect: "Sod-type. Restores full HP and clears all debuffs. One-time use.",
        stats: { attack: 85, special: "full_restore_once" }
    },

    // ─── CHAPTER 5 ───────────────────────────────────────────────────────────
    {
        id: "avos_5_1", name: "Ten Utterances",
        text: "With ten utterances the world was created.",
        author: "Sages", chapter: 5, verse: 1,
        category: "Sod", damageType: "Ground", icon: "🌐",
        power: 100, accuracy: 65, pp: 5,
        pshat:  "The ten divine statements in Bereishis created all of existence.",
        remez:  "Ten utterances = ten Sefirot = ten dimensions of the Infinite Light.",
        drush:  "Every particle of creation is sustained by these utterances RIGHT NOW.",
        sod:    "The letters of 'Bereishis Bara' contain the entire power of all ten utterances.",
        effect: "ULTIMATE Ground. Shatters all Kelipa defenses. Earthquake of Bereishis.",
        stats: { attack: 100, chochmah: 80, binah: 80, daas: 80, special: "break_all_defenses" }
    },
    {
        id: "avos_5_20", name: "Be Bold as a Leopard",
        text: "Be bold as a leopard, light as an eagle, swift as a deer, and strong as a lion to do the will of your Father in Heaven.",
        author: "Yehuda ben Tema", chapter: 5, verse: 20,
        category: "Drush", damageType: "Fire", icon: "🦁",
        power: 75, accuracy: 90, pp: 10,
        pshat:  "Four animal archetypes representing four modes of Divine service.",
        remez:  "Leopard=boldness, Eagle=vision, Deer=swiftness, Lion=strength = four worlds.",
        drush:  "The Chossid must embody ALL four simultaneously in Avodas Hashem.",
        sod:    "These four correspond to the four faces of the Divine Chariot (Merkava).",
        effect: "Fire-type. Grants all four buffs: +Speed, +Sight, +Power, +Defense.",
        stats: { attack: 75, special: "all_stats_boost_2_turns" }
    },
];
