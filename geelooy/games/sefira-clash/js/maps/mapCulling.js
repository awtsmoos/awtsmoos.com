//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the map culling vessel in this instant, revealing
 * its focused js maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Map culling helpers.
 *
 * Chapter 60: what the camera cannot see should not beg to be drawn. The map
 * yields only visible stones, walls, holes, and hazards within a soft margin.
 */
export function cameraRect(camera, w, h, margin = 260) {
	const zoom = camera?.zoom || 1;
	const halfW = w / zoom / 2 + margin;
	const halfH = h / zoom / 2 + margin;
	const cx = w / 2 - (camera?.x || 0);
	const cy = h / 2 - (camera?.y || 0);
	return { left: cx - halfW, right: cx + halfW, top: cy - halfH, bottom: cy + halfH };
}

/**
 * Reveals the visible map parts behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 * @param {*} rect The rect value entering this behavior.
 */
export function visibleMapParts(map, rect) {
	return {
		platforms: filterRects(map.platforms || [], rect),
		walls: filterRects(map.walls || [], rect),
		hazards: filterPoints(map.hazards || [], rect),
		holes: map.holes || []
	};
}

function filterRects(items, r) {
	return items.filter(
		p => p.x + p.w >= r.left && p.x <= r.right && p.y + p.h >= r.top && p.y <= r.bottom
	);
}
function filterPoints(items, r) {
	return items.filter(p => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom);
}
