/**
 * B"H
 * @file tanyaPassages.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TANYA — THE WRITTEN TORAH OF CHASSIDUS                              ║
 * ║  "The Map of the Soul" — by the Alter Rebbe (Rabbi Shneur Zalman)    ║
 * ║                                                                      ║
 * ║  Air-type passages. These strike deep into the Sod (secret) of       ║
 * ║  the enemy, bypassing external defenses entirely.                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const TANYA_PASSAGES = [
    {
        id: "tanya_ch1", name: "The Two Souls",
        text: "Every Jew has two souls: a divine soul from the side of holiness, and an animal soul from the side of the Kelipa.",
        source: "Tanya Ch. 1", icon: "⚗️",
        category: "Sod", damageType: "Air", tier: "RARE",
        power: 70, accuracy: 90, pp: 12,
        pshat:  "The two souls are literally two distinct spiritual entities inhabiting the body.",
        remez:  "Divine soul = 10 Sefirot of holiness. Animal soul = 10 Sefirot of the Kelipa.",
        drush:  "The entire human experience is the battleground of these two souls.",
        sod:    "The divine soul IS a part of the Awtsmoos — literally a spark of the Essence.",
        effect: "Air-RARE. Splits attack into divine and animal dimensions. Double-soul strike.",
        stats: { attack: 70, chochmah: 50, binah: 50, daas: 50 }
    },
    {
        id: "tanya_ch2", name: "Chelek Eloka Mimaal Mamash",
        text: "The divine soul is literally a part of G-d above.",
        source: "Tanya Ch. 2",  icon: "✨",
        category: "Sod", damageType: "Air", tier: "LEGENDARY",
        power: 100, accuracy: 85, pp: 6,
        pshat:  "The Jewish soul's origin is literally in the Ein Sof (Infinite Light).",
        remez:  "Mamash (literally) emphasizes this is not metaphor — it IS the Essence.",
        drush:  "No Kelipa can touch the root of the divine soul — it is beyond all worlds.",
        sod:    "This is the ultimate weapon: the Kelipa cannot exist in the presence of true Atzmus.",
        effect: "Air+Sod-LEGENDARY. Instant KO if opponent is an Air Kelipa.",
        stats: { attack: 100, special: "instant_ko_air_kelipa" }
    },
    {
        id: "tanya_ch12", name: "The Beinoni",
        text: "The Beinoni is the one who never sins in thought, speech, or action — though his heart is a battlefield.",
        source: "Tanya Ch. 12", icon: "⚔️",
        category: "Drush", damageType: "Fire", tier: "RARE",
        power: 80, accuracy: 88, pp: 10,
        pshat:  "A new category: not Tzaddik, not Rasha — a constant spiritual warrior.",
        remez:  "Thought/Speech/Action = three garments of the soul; the Beinoni controls all three.",
        drush:  "The Rebbe says: The Beinoni is the goal for EVERY Jew — achievable by all.",
        sod:    "Inner battle = the dynamic between Chesed-Gevurah; the Beinoni channels both.",
        effect: "Fire-RARE. Converts damage taken into attack power for next turn.",
        stats: { attack: 80, special: "convert_damage_to_power" }
    },
    {
        id: "tanya_ch25", name: "Ahavat Olam",
        text: "A person should know: even if he has committed many sins, the love of G-d for him never diminishes.",
        source: "Tanya Ch. 25", icon: "❤️‍🔥",
        category: "Sod", damageType: "Fire", tier: "RARE",
        power: 75, accuracy: 95, pp: 12,
        pshat:  "The unconditional love of the Creator — a foundation for teshuvah.",
        remez:  "Ahavat Olam = eternal love transcending all worlds including the Kelipa.",
        drush:  "Knowledge of this love is itself a weapon — it melts the coldness of exile.",
        sod:    "The Awtsmoos loves each soul as He loves Himself — because they ARE part of Him.",
        effect: "Fire-RARE. Removes all debuffs. Love flame heals 50HP.",
        stats: { attack: 75, special: "cleanse_and_heal_50" }
    },
    {
        id: "tanya_ch33", name: "Joy and Teshuvah",
        text: "After depression and bitterness of heart from one's sins, one should serve G-d with joy and a good heart.",
        source: "Tanya Ch. 33", icon: "🎉",
        category: "Drush", damageType: "Water", tier: "UNCOMMON",
        power: 60, accuracy: 100, pp: 15,
        pshat:  "Prescribed emotional sequence: process pain, then pivot to joy.",
        remez:  "Joy is a vessel (kli) that receives more divine light than sadness can contain.",
        drush:  "The Tanya prescribes joy as medicine; simcha literally strengthens the animal soul.",
        sod:    "Joy breaks the Kelipa of sadness (atzvut) more than any single act of teshuvah.",
        effect: "Water-UNCOMMON. Removes depression debuff. +20% attack for 4 turns.",
        stats: { attack: 60, special: "joy_attack_boost_4_turns" }
    },
    {
        id: "tanya_igeret_hakodesh", name: "The Letter of Holiness",
        text: "Through giving tzedakah, one's prayer ascends on wings of eagles.",
        source: "Tanya, Iggeret HaKodesh Ch. 2", icon: "🦅",
        category: "Remez", damageType: "Air", tier: "RARE",
        power: 85, accuracy: 88, pp: 10,
        pshat:  "Tzedakah empowers prayer by purifying the vessels through which it travels.",
        remez:  "Eagle wings = Chochmah; the prayer ascends to the highest level.",
        drush:  "The Rebbe: tzedakah and prayer together = complete spiritual weapon.",
        sod:    "Tzedakah elevates the sparks locked in material wealth into pure Atzilus light.",
        effect: "Air-RARE. Prayer counts as double this turn. Critical hit chance +50%.",
        stats: { attack: 85, chochmah: 60, special: "double_prayer_crit_50" }
    }
];
