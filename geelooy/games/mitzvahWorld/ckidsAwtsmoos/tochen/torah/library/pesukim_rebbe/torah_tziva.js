/**
 * B"H
 * @file torah_tziva.js
 * @description
 * 📜 THE FIRST PASUK — The Heritage of Yaakov 📜
 * 
 * Chapter 1: The Inheritance.
 * "Torah Tziva Lanu Moshe..."
 * 
 * This file contains the deep PaRDeS levels for the first of the Rebbe's 12 Pesukim.
 */

export const torah_tziva = {
    id: "torah_tziva",
    hebrew: "תּוֹרָה צִוָּה לָנוּ מֹשֶׁה מוֹרָשָׁה קְהִלַּת יַעֲקֹב",
    english: "The Torah that Moshe commanded us is the heritage of the congregation of Yaakov.",
    source: "Devarim 33:4",
    book: "PESUKIM_REBBE",
    levels: {
        pshat: {
            name: "Pshat",
            description: "The simple heritage of every Jew by birthright.",
            bonus: { chochmah: 5, defense: 5 },
            explanation: "Every single Jew, from the greatest scholar to the simplest child, has an equal share in the Torah."
        },
        remez: {
            name: "Remez",
            description: "A hint to the 611 Mitzvos (Gematria of Torah).",
            bonus: { chochmah: 10, attack: 5 },
            explanation: "The word 'Torah' has the gematria of 611. Combined with the two we heard at Sinai, we have 613."
        },
        drush: {
            name: "Drush",
            description: "The Kehillah (Congregation) as a unified body.",
            bonus: { binah: 15, health: 50 },
            explanation: "The Torah is given to the 'Congregation' — we are one body, and each individual is vital to the whole."
        },
        sod: {
            name: "Sod",
            description: "The essence of Moshe's speech inside the soul.",
            bonus: { daas: 20, special: "heritage_spark" },
            explanation: "Moshe Rabeinu is the 'faithful shepherd' whose spark exists within every Jewish soul throughout the generations."
        }
    }
};
