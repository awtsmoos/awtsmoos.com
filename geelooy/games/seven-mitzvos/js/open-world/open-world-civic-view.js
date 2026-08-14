//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file open-world-civic-view.js
 * @description
 * The Awtsmoos renews one canonical world while Awtsmoos.com exposes only the finite facts a browser world needs to witness.
 * Region, settlement, ecology, animals, clock, alerts, inventory, and parcels remain projections of LivingWorld state, never alternate authority.
 */
export function activeRegionFrom(state) {
	return state?.regions?.find(region => region.id === state.activeRegionId) || null;
}

export function activeSettlementFrom(state) {
	const region = activeRegionFrom(state);
	return region?.settlements?.find(item => item.id === state.activeSettlementId) ||
		state?.regions?.flatMap(item => item.settlements || [])
			.find(item => item.id === state?.activeSettlementId) || null;
}

/** Returns a compact clone-safe view for world renderers, witnesses, and interaction projectors. */
export function civicWorldView(state, lastSaveError = '') {
	const region = activeRegionFrom(state);
	const settlement = activeSettlementFrom(state);
	return {
		revision: state?.revision || 0,
		clock: { ...(state?.clock || {}) },
		regionId: region?.id || null,
		regionName: region?.name || '',
		weather: { ...(region?.weather || {}) },
		settlementId: settlement?.id || null,
		settlementName: settlement?.name || '',
		inventory: { ...(settlement?.inventory || {}) },
		ecology: { ...(settlement?.ecology || {}) },
		animals: { ...(settlement?.animals || {}) },
		welfare: settlement?.welfare ?? 0,
		publicTrust: settlement?.publicTrust ?? 0,
		households: clone(settlement?.households || []),
		buildings: [...(settlement?.buildings || [])],
		parcels: (settlement?.parcels || []).map(parcel => ({
			id: parcel.id,
			allowed: [...(parcel.allowed || [])],
			building: parcel.building || null
		})),
		alerts: clone((state?.alerts || []).filter(alert => {
			return !alert?.settlementId || alert.settlementId === settlement?.id;
		})),
		lastSaveError
	};
}

export function isCompatibleCivicWorld(state) {
	return Boolean(
		state &&
		state.schemaVersion >= 2 &&
		Array.isArray(state.regions) &&
		state.regions.length === 7
	);
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
