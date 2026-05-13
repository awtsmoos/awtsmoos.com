/**
 * B"H
 * @file pesukim.js
 * @description 
 * 📜 THE TWELVE PESUKIM 📜
 * 
 * Chapter 1: The Foundations of Knowledge.
 * "Torah Tziva Lanu Moshe..."
 * 
 * This module contains the data for the holy passages that refine the soul.
 * Each passage is a vessel for different levels of understanding:
 * Pshat (Simple), Remez (Hint), Drush (Parable), and Sod (Secret).
 * 
 * As the Chossid studies each level, they unlock deep powers (stats) 
 * to refine the world and its inhabitants.
 */

export const PESUKIM_DATA = {
    "torah_tziva": {
        id: "torah_tziva",
        hebrew: "תּוֹרָה צִוָּה לָנוּ מֹשֶׁה מוֹרָשָׁה קְהִלַּת יַעֲקֹב",
        english: "The Torah that Moshe commanded us is the heritage of the congregation of Yaakov.",
        category: "Twelve Pesukim",
        levels: {
            pshat: {
                name: "Pshat",
                description: "The heritage of every Jew.",
                bonus: { chochmah: 5, defense: 2 },
                unlockCost: 0
            },
            remez: {
                name: "Remez",
                description: "A hint to the eternal connection.",
                bonus: { chochmah: 10, attack: 5 },
                unlockCost: 100 // Study points or Perutahs
            },
            drush: {
                name: "Drush",
                description: "The depth of the community.",
                bonus: { binah: 15, defense: 10 },
                unlockCost: 500
            },
            sod: {
                name: "Sod",
                description: "The secret spark of the letter.",
                bonus: { daas: 20, special: "mazik_vision" },
                unlockCost: 1000
            }
        }
    },
    "shema_yisrael": {
        id: "shema_yisrael",
        hebrew: "שְׁמַע יִשְׂרָאֵל ה' אֱ-לֹהֵינוּ ה' אֶחָד",
        english: "Hear, O Israel, the L-rd is our G-d, the L-rd is One.",
        category: "Twelve Pesukim",
        levels: {
            pshat: {
                name: "Pshat",
                description: "Acceptance of the Yoke of Heaven.",
                bonus: { daas: 10, defense: 5 },
                unlockCost: 0
            },
            remez: {
                name: "Remez",
                description: "The unity in all directions.",
                bonus: { daas: 20, attack: 10 },
                unlockCost: 200
            },
            drush: {
                name: "Drush",
                description: "Loving with all your soul.",
                bonus: { binah: 25, health: 50 },
                unlockCost: 600
            },
            sod: {
                name: "Sod",
                description: "The essence of Oneness.",
                bonus: { chochmah: 30, special: "invulnerability_spark" },
                unlockCost: 1500
            }
        }
    },
    "vhafta_es_hashem": {
        id: "vhafta_es_hashem",
        hebrew: "וְאָהַבְתָּ אֵת ה' אֱ-לֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶךָ",
        english: "And you shall love the L-rd your G-d with all your heart, with all your soul, and with all your might.",
        category: "Love and Awe",
        levels: {
            pshat: { bonus: { binah: 10, attack: 5 } },
            remez: { bonus: { binah: 20, speed: 1.2 } },
            drush: { bonus: { binah: 30, stamina: 100 } },
            sod: { bonus: { daas: 40, special: "fire_affinity" } }
        }
    }
    // More can be added as the Awtsmoos manifests them
};
