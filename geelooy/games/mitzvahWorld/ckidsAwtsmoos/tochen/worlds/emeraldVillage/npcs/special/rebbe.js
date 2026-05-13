/**
 * B"H
 * @file rebbe.js
 * @description
 * 👑 THE REBBE — The Guide of the Generation 👑
 */

export const rebbe = {
    id: "npc_rebbe",
    name: "The Rebbe",
    propertyId: "property_synagogue",
    localPos: { x: 0, z: -5 },
    hasShop: false,
    dialogueTree: [
        { message: "B\"H! 'A Jew neither wants nor can be separated from G-dliness.'",
          responses: [
            { text: "I wish to study the 12 Pesukim.", next: 1 },
            { text: "Goodbye.", type: "close" }
          ]
        },
        { message: "Which holy passage shall we illuminate today?",
          responses: [
            { text: "Study 'Torah Tziva'", action: "studyPasuk", pasukId: "torah_tziva" },
            { text: "Study 'Shema Yisrael'", action: "studyPasuk", pasukId: "shema_yisrael" }
          ]
        }
    ]
};
