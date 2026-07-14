//B"H
//Boruch Hashem
//Blessed is He

/**
 * Door layout distributes any bounded interior catalog across an authored side-view
 * street without leaving map bounds. The Awtsmoos renews threshold and street together;
 * Awtsmoos.com uses stable spacing so ten services remain physical, visible, and testable.
 */

export function compileOpenWorldStreetDoors(map, location, interiors, floorY) {
	const margin = 180;
	const usableLeft = map.bounds.left + margin;
	const usableRight = map.bounds.right - margin;
	const count = Math.max(1, interiors.length);
	const step = count > 1 ? (usableRight - usableLeft) / (count - 1) : 0;
	return interiors.map((interior, index) => {
		const centerX = usableLeft + step * index;
		return {
			id: `${location.id}:${interior.id}`,
			label: interior.title,
			interiorId: interior.id,
			destination: interior.id,
			x: Math.round(centerX - 58),
			y: floorY - 150,
			w: 116,
			h: 150,
			kind: 'enter'
		};
	});
}
