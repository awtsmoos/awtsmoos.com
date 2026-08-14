//B"H
//Boruch Hashem
//Blessed is He

const SANCTUARY_COST = Object.freeze({ timber: 3, stone: 2 });
const INTERACTION_RADIUS = 2.1;

/**
 * @file chesed-context-projector.js
 * @description
 * The Awtsmoos renews nearby care as bounded intention; Awtsmoos.com lets Sanctuary work and explicit world-time passage appear only when the traveler reaches their real WebGL anchors.
 * These contexts describe actions only and never issue canonical commands themselves.
 */
export function chesedContexts(view, anchors, position) {
	const contexts = [];
	const sanctuary = sanctuaryContext(view, anchors?.sanctuary, position);
	const day = advanceDayContext(view, anchors?.day, position);
	if (sanctuary) {
		contexts.push(sanctuary);
	}
	if (day) {
		contexts.push(day);
	}
	return contexts;
}

export function selectSanctuaryParcel(view) {
	return (view?.parcels || []).find(parcel => {
		return !parcel.building && parcel.allowed?.includes('sanctuary');
	}) || null;
}

function sanctuaryContext(view, anchor, position) {
	if (!anchor) {
		return null;
	}
	const distance = planarDistance(position, anchor);
	if (distance > INTERACTION_RADIUS) {
		return null;
	}
	const parcel = selectSanctuaryParcel(view);
	const affordable = hasMaterials(view?.inventory, SANCTUARY_COST);
	return {
		type: 'ecology',
		actionId: 'build-sanctuary',
		id: 'chesed-build-sanctuary',
		parcelId: parcel?.id || null,
		title: 'Chesed Sanctuary Works',
		text: parcel
			? `Commission ${parcel.id} · cost 3 timber + 2 stone · reserves ${view.inventory?.timber || 0}/${view.inventory?.stone || 0}`
			: 'Every Sanctuary-zoned civic parcel is already occupied.',
		label: parcel && affordable ? 'Build Sanctuary' : 'Sanctuary unavailable',
		disabled: !parcel || !affordable,
		distance,
		root: anchor.root
	};
}

function advanceDayContext(view, anchor, position) {
	if (!anchor) {
		return null;
	}
	const distance = planarDistance(position, anchor);
	if (distance > INTERACTION_RADIUS) {
		return null;
	}
	const clock = view?.clock || {};
	const weather = view?.weather?.condition || view?.weather?.kind || 'unknown weather';
	return {
		type: 'ecology',
		actionId: 'advance-day',
		id: 'chesed-advance-day',
		title: 'Observe the Living World',
		text: `Day ${clock.day || 1} · ${clock.season || 'season'} · ${weather} · one canonical world day will pass`,
		label: 'Advance One Day',
		disabled: false,
		distance,
		root: anchor.root
	};
}

function hasMaterials(inventory = {}, cost) {
	return (inventory.timber || 0) >= cost.timber && (inventory.stone || 0) >= cost.stone;
}

function planarDistance(position = {}, anchor) {
	return Math.hypot((position.x || 0) - anchor.x, (position.z || 0) - anchor.z);
}
