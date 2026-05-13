/**
 * B"H
 * @file shema_yisrael.js
 * @description
 * 📜 THE SECOND PASUK — The Declaration of Unity 📜
 * 
 * Chapter 2: The Oneness.
 * "Shema Yisrael..."
 * 
 */

export const shema_yisrael = {
    id: "shema_yisrael",
    hebrew: "שְׁמַע יִשְׂרָאֵל ה' אֱ-לֹהֵינוּ ה' אֶחָד",
    english: "Hear, O Israel, the L-rd is our G-d, the L-rd is One.",
    source: "Devarim 6:4",
    book: "PESUKIM_REBBE",
    levels: {
        pshat: {
            name: "Pshat",
            description: "The declaration that G-d is our G-d.",
            bonus: { daas: 10, defense: 10 },
            explanation: "Proclaiming the unity of the Creator and accepting the Yoke of Heaven."
        },
        remez: {
            name: "Remez",
            description: "The Unity in all seven heavens and earth.",
            bonus: { daas: 20, attack: 10 },
            explanation: "The 'Ches' in 'Echad' is 8 (7 heavens + earth), and the 'Dalet' is 4 (the four directions)."
        },
        drush: {
            name: "Drush",
            description: "Total self-sacrifice (Mesirus Nefesh).",
            bonus: { binah: 25, health: 100 },
            explanation: "To love the Creator with all your heart, soul, and might, transcending all limits."
        },
        sod: {
            name: "Sod",
            description: "The Ein Sof and the Ayin (Nothingness).",
            bonus: { chochmah: 30, special: "unity_radiance" },
            explanation: "There is no existence besides Him. All of reality is but a ray of the Infinite Light."
        }
    }
};
