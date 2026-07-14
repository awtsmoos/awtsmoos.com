//B"H
//Boruch Hashem
//Blessed is He

/**
 * Inventory law distinguishes ownership from equipment. The Awtsmoos renews every
 * artifact; Awtsmoos.com allows only known, owned gear into its declared slot while
 * preserving complete immutable profile snapshots for safe persistence and menus.
 */

import {
	EXPEDITION_GEAR,
	STARTER_LOADOUT,
	expeditionGear
} from '../data/expedition/gearCatalog.js';

export function normalizeExpeditionInventory(profile) {
	const inventory = unique((profile.inventory || []).filter(id => expeditionGear(id)));
	const equipped = {};
	for (const [slot, starterId] of Object.entries(STARTER_LOADOUT)) {
		const requested = profile.equipped?.[slot];
		const requestedGear = expeditionGear(requested);
		const chosen =
			requestedGear?.slot === slot && inventory.includes(requested) ? requested : starterId;
		if (!inventory.includes(chosen)) inventory.push(chosen);
		equipped[slot] = chosen;
	}
	return { ...profile, inventory, equipped };
}

export function grantExpeditionGear(profile, gearIds = []) {
	const granted = gearIds.filter(id => expeditionGear(id));
	return normalizeExpeditionInventory({
		...profile,
		inventory: unique([...(profile.inventory || []), ...granted])
	});
}

export function equipExpeditionGear(profile, gearId) {
	const item = expeditionGear(gearId);
	if (!item || !(profile.inventory || []).includes(gearId)) {
		return { changed: false, profile };
	}
	const normalized = normalizeExpeditionInventory(profile);
	if (normalized.equipped[item.slot] === gearId) {
		return { changed: false, profile: normalized };
	}
	return {
		changed: true,
		profile: {
			...normalized,
			equipped: { ...normalized.equipped, [item.slot]: gearId }
		}
	};
}

export function equippedExpeditionGear(profile) {
	const normalized = normalizeExpeditionInventory(profile);
	return Object.values(normalized.equipped)
		.map(id => expeditionGear(id))
		.filter(Boolean);
}

export function expeditionInventoryBySlot(profile, slot) {
	return EXPEDITION_GEAR.filter(
		item => item.slot === slot && profile.inventory.includes(item.id)
	);
}

function unique(values) {
	return [...new Set(values)];
}
