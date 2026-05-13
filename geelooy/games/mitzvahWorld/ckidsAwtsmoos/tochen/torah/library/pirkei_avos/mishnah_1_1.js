/**
 * B"H
 * @file mishnah_1_1.js
 * @description
 * 📙 PIRKEI AVOS 1:1 — The Transmission of Truth 📙
 * 
 * Chapter 4: The Chain of Tradition.
 * 
 * "Moshe received the Torah from Sinai..."
 */

export const avos_1_1 = {
    id: "avos_1_1",
    name: "The Chain of Sinai",
    source: "Pirkei Avos 1:1",
    book: "PIRKEI_AVOS",
    levels: {
        pshat: {
            name: "Pshat",
            description: "The historical transmission of the Torah.",
            bonus: { chochmah: 10, defense: 10 },
            explanation: "Moshe received from Sinai, passed it to Yehoshua, then to the Elders, the Prophets, and the Men of the Great Assembly."
        },
        remez: {
            name: "Remez",
            description: "The three pillars of the world.",
            bonus: { binah: 15, health: 30 },
            explanation: "Be deliberate in judgment, raise many disciples, and make a fence around the Torah."
        },
        drush: {
            name: "Drush",
            description: "Receiving 'from Sinai' — humility.",
            bonus: { daas: 25, special: "sinai_humility" },
            explanation: "Sinai was the smallest of mountains. Humility is the vessel for receiving Wisdom."
        },
        sod: {
            name: "Sod",
            description: "The reception from the Essence (Sinai/Sneh).",
            bonus: { chochmah: 40, special: "infinite_reception" },
            explanation: "The Torah is an infinite revelation that transcends time and space, received anew every instant."
        }
    }
};
