// B"H
/**
 * @module TorahPassages
 * @description THE FOUR WORLDS OF POWER
 * Categorized by Pshat, Remez, Drush, and Sod (PRDS - Pardes).
 */

export const TORAH_PASSAGES = {
    "shema_yisrael": {
        id: "shema_yisrael",
        name: "Shema Yisrael",
        level: "pshat", world: "asiyah", element: "dust",
        passage: "Hear, O Israel: The Lord our God, the Lord is One.",
        description: "The grounding cry of unity. A double-edged sword that shatters the close-range illusions of the dust.",
        effect: "holy_blast", damage: 45, cost: 5, color: "#c2b280", icon: "🌍",
        weaponAffinity: "sword", doubleEdged: true, rangeType: "close"
    },
    "shmoneh_esray": {
        id: "shmoneh_esray",
        name: "Shmoneh Esray",
        level: "remez", world: "yetzirah", element: "spirit",
        passage: "O L-rd, open my lips, that my mouth may declare Your praise.",
        description: "The celestial bow. It reaches the far-flung shadows of the ego, drawing down infinite light.",
        effect: "spiritual_surge", damage: 85, cost: 25, color: "#9c27b0", icon: "🏹",
        weaponAffinity: "bow", rangeType: "far"
    },

    "vhafta_es_hashem": {
        id: "vhafta_es_hashem",
        name: "V'ahavta",
        level: "remez", world: "yetzirah", element: "water",
        passage: "And you shall love the Lord your God...",
        description: "A fluid hint of the Divine. Heals the soul and slows the rush of the ego's tide.",
        effect: "heal_soul", heal: 25, cost: 12, color: "#00ffff", icon: "💧"
    },
    "torah_fire": {
        id: "torah_fire",
        name: "Esh Dos",
        level: "drush", world: "beriah", element: "fire",
        passage: "From His right hand, a fiery law for them.",
        description: "The burning fire of creation. Consumes the Mazikim of pride with holy heat.",
        effect: "spiritual_surge", damage: 120, cost: 40, color: "#ff4500", icon: "🔥"
    },
    "atzilus_breath": {
        id: "atzilus_breath",
        name: "Nishmas Chayim",
        level: "sod", world: "atzilus", element: "air",
        passage: "He breathed into his nostrils the breath of life.",
        description: "The secret air of the highest world. Transforms the darkness into light through pure spirit.",
        effect: "redemption_pulse", damage: 250, aoe: true, cost: 80, color: "#ffffff", icon: "🌬️"
    },
    "yechi_hamelech": {
        id: "yechi_hamelech",
        name: "Yechi HaMelech",
        level: "sod", world: "atzilus", element: "light",
        passage: "Long live our Master, Teacher, and Rebbe...",
        description: "The ultimate call of redemption. Transcends all elements to reveal the Awtsmoos.",
        effect: "redemption_pulse", damage: 500, aoe: true, cost: 150, color: "#ffd700", icon: "👑"
    }
};

