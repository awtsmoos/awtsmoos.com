//B"H
// Boruch Hashem
// Blessed is He
/**
 * Twenty-seven authored gates form a finite ladder before endless renewal; Awtsmoos.com creates both limit and beyond.
 * Every recipe selects its own terrain motif, enemy family, atmosphere, objective, and night-market rhythm.
 */
const gate = (number, name, theme, motif, roles, objective, options = {}) => Object.freeze({
	number, name, theme, motif, roles: Object.freeze(roles), objective,
	width: options.width ?? 2600 + number * 38,
	enemyCount: options.enemyCount ?? 4 + Math.floor(number * 0.62),
	coinCount: options.coinCount ?? 10 + number,
	night: options.night ?? number % 3 === 0,
	boss: options.boss ?? false,
	moving: options.moving ?? number > 4,
	hazards: options.hazards ?? number > 6
});

export const LEVELS = Object.freeze([
	gate(1, "Garden of First Breath", "garden", "terraces", ["wanderer"], "Clear the garden and reach the gate", { width: 2300, enemyCount: 4, hazards: false, moving: false }),
	gate(2, "Orchard of Echoing Steps", "moon", "arches", ["wanderer", "guard", "leaper"], "Follow the echoes and awaken the moon gate", { width: 2860, enemyCount: 4, night: true, hazards: false, moving: false }),
	gate(3, "Moonlit Orchard", "moon", "arches", ["wanderer", "leaper"], "Cross the orchard at night", { night: true, hazards: false }),
	gate(4, "Bridge of Four Winds", "sky", "bridges", ["guard", "leaper"], "Defeat the bridge keepers", { moving: true, hazards: false }),
	gate(5, "Steps of Ascent", "dawn", "stairway", ["wanderer", "charger"], "Climb without falling", { width: 3000 }),
	gate(6, "Lantern Bazaar", "night-city", "rooftops", ["guard", "archer"], "Silence the rooftop archers", { night: true }),
	gate(7, "River of Letters", "river", "islands", ["leaper", "archer"], "Leap between the letter-islands"),
	gate(8, "Walls of the Inner City", "city", "walls", ["guard", "charger", "archer"], "Open the sealed city gate"),
	gate(9, "Guardian of Nine Gates", "temple", "sanctum", ["giant", "guard"], "Defeat the first guardian", { boss: true, night: true, enemyCount: 5, width: 2800 }),
	gate(10, "Copper Dunes", "desert", "dunes", ["wanderer", "charger"], "Cross the shifting copper sand"),
	gate(11, "Canyon of Returning Sound", "desert", "canyon", ["leaper", "archer"], "Break the canyon ambush"),
	gate(12, "Night Caravan", "desert-night", "caravan", ["guard", "charger"], "Protect the path of sparks", { night: true }),
	gate(13, "Furnace of Resolve", "furnace", "foundry", ["charger", "guard"], "Endure the moving foundry"),
	gate(14, "Blue Thread Caverns", "cave", "caverns", ["leaper", "archer"], "Find the hidden blue passage"),
	gate(15, "Stars Below the Earth", "cave-night", "crystals", ["wanderer", "leaper", "guard"], "Gather the underground constellations", { night: true }),
	gate(16, "Fortress of Noise", "fortress", "battlements", ["guard", "archer", "charger"], "Shatter the fortress formation"),
	gate(17, "Valley of the Lion", "sunset", "valley", ["charger", "leaper"], "Run with the lion wind"),
	gate(18, "Giant of Concealment", "storm", "arena", ["giant", "archer"], "Defeat the storm giant", { boss: true, night: true, enemyCount: 7, width: 3100 }),
	gate(19, "Cloud Stair of Chesed", "heaven", "clouds", ["leaper", "archer"], "Ascend the dissolving stair"),
	gate(20, "Mirror Paths", "heaven", "mirrors", ["guard", "wanderer"], "Choose the living path"),
	gate(21, "Choir of Midnight", "cosmic", "choir", ["archer", "leaper", "charger"], "Cross the midnight harmony", { night: true }),
	gate(22, "Wheel Within Wheel", "merkavah", "wheels", ["guard", "charger"], "Ride the turning platforms"),
	gate(23, "Sea of Sapphire Fire", "sapphire", "fire-sea", ["leaper", "archer"], "Cross fire without surrender"),
	gate(24, "Palace of Quiet Thunder", "cosmic-night", "palace", ["guard", "charger", "archer"], "Awaken the quiet palace", { night: true }),
	gate(25, "Crown Bridges", "crown", "crowns", ["leaper", "guard"], "Cross the crown bridges"),
	gate(26, "Edge of Created Time", "void", "fractures", ["charger", "archer", "guard"], "Reach the edge before it closes", { width: 3900 }),
	gate(27, "Gate Beyond Gates", "infinite", "final-sanctum", ["giant", "guard", "archer", "charger"], "Reveal the endless road", { boss: true, night: true, enemyCount: 11, width: 4200 })
]);

export const THEMES = Object.freeze({
	garden: ["#172e32", "#5e8e62", "#d6d071"], moon: ["#080c25", "#36336f", "#b8d5ff"], sky: ["#142750", "#5a8fc4", "#dceeff"],
	desert: ["#301b2a", "#b06445", "#f7cd70"], cave: ["#0b1220", "#253a57", "#56cfe1"], cosmic: ["#070718", "#35246b", "#f3c8ff"],
	infinite: ["#020207", "#331d5e", "#fff4b0"]
});
