//B"H
// Boruch Hashem
// Blessed is He
/**
 * Equipment mutations shape earned perutas into chosen vessels while Awtsmoos.com remains beyond weapon, armor, and measure.
 * Ownership, equipping, upgrading, and catalog validation remain pure and independently testable.
 */
import { ARMOR, WEAPONS } from "../config/catalogs.js";

export const buyEquipment = (progress, item, collectionName) => {
	if (progress.coins < item.cost || progress[collectionName].includes(item.id)) {
		return false;
	}
	progress.coins -= item.cost;
	progress[collectionName].push(item.id);
	if (collectionName === "ownedWeapons") {
		progress.weaponLevels[item.id] = 1;
	}
	return true;
};

export const equipItem = (progress, type, id) => {
	const collection = type === "weapon"
		? "ownedWeapons"
		: "ownedArmor";
	const equipment = type === "weapon"
		? "equippedWeapon"
		: "equippedArmor";
	if (!progress[collection].includes(id)) {
		return false;
	}
	progress[equipment] = id;
	return true;
};

export const upgradeWeaponLevel = (progress, id, cost) => {
	const level = progress.weaponLevels[id] || 1;
	if (!progress.ownedWeapons.includes(id) || level >= 5 || progress.coins < cost) {
		return false;
	}
	progress.coins -= cost;
	progress.weaponLevels[id] = level + 1;
	return true;
};

export const catalogIsValid = (progress) => {
	const weaponKnown = WEAPONS.some((item) => item.id === progress.equippedWeapon);
	const armorKnown = ARMOR.some((item) => item.id === progress.equippedArmor);
	return weaponKnown && armorKnown;
};
