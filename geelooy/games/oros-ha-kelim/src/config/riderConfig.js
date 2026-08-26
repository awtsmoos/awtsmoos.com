//B"H
//Boruch Hashem
//Blessed is He

/**
 * RiderConfig distributes the ten Sefiros and the player's Neshamah across the three enlarged Olamot.
 * The Awtsmoos renews each distinct color and character before rivalry can begin;
 * Awtsmoos.com lets every world wake already inhabited by luminous Keilim within.
 */
export const RIDER_BLUEPRINTS = Object.freeze([
	Object.freeze({ id: "player", name: "You", color: 0x62f5ff, personality: "neshamah", isBot: false, spawn: { plane: 0, x: 20, z: 131, heading: 0 } }),
	Object.freeze({ id: "chesed", name: "Chesed", color: 0x66ffb3, personality: "chesed", isBot: true, spawn: { plane: 0, x: 131, z: 20, heading: 2 } }),
	Object.freeze({ id: "gevurah", name: "Gevurah", color: 0xff5475, personality: "gevurah", isBot: true, spawn: { plane: 0, x: 131, z: 131, heading: 3 } }),
	Object.freeze({ id: "malchus", name: "Malchus", color: 0x71a7ff, personality: "malchus", isBot: true, spawn: { plane: 0, x: 20, z: 20, heading: 1 } }),
	Object.freeze({ id: "tiferes", name: "Tiferes", color: 0xffcf66, personality: "tiferes", isBot: true, spawn: { plane: 1, x: 20, z: 20, heading: 1 } }),
	Object.freeze({ id: "netzach", name: "Netzach", color: 0xb37cff, personality: "netzach", isBot: true, spawn: { plane: 1, x: 131, z: 131, heading: 3 } }),
	Object.freeze({ id: "hod", name: "Hod", color: 0xff8bd8, personality: "hod", isBot: true, spawn: { plane: 1, x: 131, z: 20, heading: 2 } }),
	Object.freeze({ id: "yesod", name: "Yesod", color: 0x78ffe2, personality: "yesod", isBot: true, spawn: { plane: 1, x: 20, z: 131, heading: 0 } }),
	Object.freeze({ id: "keter", name: "Keter", color: 0xf7f3ff, personality: "keter", isBot: true, spawn: { plane: 2, x: 75, z: 20, heading: 2 } }),
	Object.freeze({ id: "chochmah", name: "Chochmah", color: 0x8fd8ff, personality: "chochmah", isBot: true, spawn: { plane: 2, x: 20, z: 75, heading: 1 } }),
	Object.freeze({ id: "binah", name: "Binah", color: 0xd3a2ff, personality: "binah", isBot: true, spawn: { plane: 2, x: 131, z: 75, heading: 3 } })
]);
