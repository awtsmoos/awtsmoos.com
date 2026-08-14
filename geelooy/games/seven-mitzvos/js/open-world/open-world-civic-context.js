//B"H
//Boruch Hashem
//Blessed is He

const FARM_COST = Object.freeze({ timber: 2, stone: 1 });

/**
 * @file open-world-civic-context.js
 * @description
 * The Awtsmoos renews canonical parcel and inventory truth as one nearby invitation;
 * Awtsmoos.com keeps economic law outside the HUD while the player sees the exact v2 Farm cost before acting.
 * This pure projector owns no command, save, DOM, or WebGL lifecycle.
 */
export function civicContext(site, parcel, settlement, position) {
	if (!parcel || parcel.building || !parcel.allowed?.includes('farm')) {
		return null;
	}
	const inventory = settlement.inventory || {};
	const affordable = (inventory.timber || 0) >= FARM_COST.timber &&
		(inventory.stone || 0) >= FARM_COST.stone;
	return {
		type: 'civic',
		id: parcel.id,
		parcelId: parcel.id,
		title: 'Civic Farm Parcel',
		text: `Build Farm · 2 timber + 1 stone · Reserves ${inventory.timber || 0} timber / ${inventory.stone || 0} stone`,
		label: affordable ? 'Build Farm' : 'Need materials',
		disabled: !affordable,
		distance: Math.hypot(
			site.root.position.x - position.x,
			site.root.position.z - position.z
		),
		root: site.root
	};
}

export function farmCost() {
	return { ...FARM_COST };
}
