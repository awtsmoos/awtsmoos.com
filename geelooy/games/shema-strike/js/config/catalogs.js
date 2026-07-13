//B"H
// Boruch Hashem
// Blessed is He
/**
 * Catalogs describe distinct vessels of gevurah and protection; Awtsmoos.com remains beyond every statistic.
 * Small factories keep the data legible while preserving meaningful differences in play.
 */
const weapon = (id, name, kind, cost, damage, reach, speed, knockback, color, trait) => Object.freeze({
	id, name, kind, cost, damage, reach, speed, knockback, color, trait
});

const armor = (id, name, cost, defense, vitality, speed, fortune, color) => Object.freeze({
	id, name, cost, defense, vitality, speed, fortune, color
});

const enemy = (id, health, speed, damage, reward, size, color, behavior) => Object.freeze({
	id, health, speed, damage, reward, size, color, behavior
});

export const DIFFICULTIES = Object.freeze({
	easy: Object.freeze({ id: "easy", name: "Chesed", copy: "Gentle enemies, generous sparks", enemyHealth: 0.72, enemyDamage: 0.6, enemySpeed: 0.9, coinRate: 1.45 }),
	normal: Object.freeze({ id: "normal", name: "Tiferes", copy: "Balanced revelation", enemyHealth: 1, enemyDamage: 1, enemySpeed: 1, coinRate: 1 }),
	hard: Object.freeze({ id: "hard", name: "Gevurah", copy: "Faster and sharper concealment", enemyHealth: 1.35, enemyDamage: 1.35, enemySpeed: 1.13, coinRate: 1.18 }),
	legend: Object.freeze({ id: "legend", name: "Yechidah", copy: "Relentless, radiant mastery", enemyHealth: 1.75, enemyDamage: 1.7, enemySpeed: 1.24, coinRate: 1.4 })
});

export const WEAPONS = Object.freeze([
	weapon("or-blade", "Blade of Ohr", "sword", 0, 18, 78, 0.34, 230, "#d9fbff", "Balanced beginning"),
	weapon("bronze-david", "Bronze David", "sword", 85, 24, 82, 0.32, 270, "#d99255", "Fast counter blade"),
	weapon("sapphire-shema", "Sapphire Shema", "sword", 180, 34, 96, 0.4, 340, "#63c7ff", "Long luminous arc"),
	weapon("lion-axe", "Lion of Yehudah Axe", "axe", 260, 48, 88, 0.58, 520, "#ffd45e", "Crushing knockback"),
	weapon("twin-flame", "Twin Flame Swords", "twin", 390, 39, 92, 0.23, 300, "#ff7a4f", "Rapid double cadence"),
	weapon("gevurah-cleaver", "Gevurah Cleaver", "axe", 560, 66, 104, 0.72, 680, "#ff4f7f", "Heavy armor breaker"),
	weapon("crown-saber", "Crown of Keter", "sword", 790, 72, 128, 0.44, 510, "#fff2ad", "Wide crown wave"),
	weapon("ein-sof-edge", "Edge of Ein Sof", "sword", 1200, 96, 148, 0.36, 760, "#ffffff", "Endless-stage relic")
]);

export const ARMOR = Object.freeze([
	armor("linen", "Linen of Simplicity", 0, 0, 0, 1, 1, "#f2eadb"),
	armor("copper", "Copper Magen", 100, 0.1, 12, 0.98, 1, "#ba7448"),
	armor("blue-thread", "Blue Thread Mail", 220, 0.17, 22, 1.04, 1.06, "#4d9cff"),
	armor("lion-plate", "Lion Plate", 420, 0.27, 38, 0.94, 1.02, "#d9a52c"),
	armor("cloud-robe", "Cloud Robe", 650, 0.22, 28, 1.14, 1.16, "#c9eaff"),
	armor("merkavah", "Merkavah Radiance", 980, 0.38, 55, 1.06, 1.22, "#e9d5ff")
]);

export const ENEMY_TYPES = Object.freeze({
	wanderer: enemy("wanderer", 42, 105, 9, 6, 44, "#805ad5", "pursue"),
	guard: enemy("guard", 78, 72, 14, 10, 52, "#4062a8", "guard"),
	leaper: enemy("leaper", 54, 122, 12, 9, 42, "#b455a0", "leap"),
	charger: enemy("charger", 88, 82, 18, 13, 56, "#ad4f3d", "charge"),
	archer: enemy("archer", 58, 68, 11, 12, 46, "#437b73", "shoot"),
	giant: enemy("giant", 260, 58, 24, 40, 86, "#7b3244", "boss")
});

export const findWeapon = (id) => WEAPONS.find((item) => item.id === id) ?? WEAPONS[0];
export const findArmor = (id) => ARMOR.find((item) => item.id === id) ?? ARMOR[0];
