//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the limb memory vessel in this instant, revealing
 * its focused js skeleton physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function updateLimbMemory(f, pose) {
	const mem = (f.poseMemory ||= { points: {} });
	for (const [name, p] of Object.entries(pose)) {
		if (!p || !Number.isFinite(p.x)) continue;
		const old = mem.points[name] || { x: p.x, y: p.y, vx: 0, vy: 0 };
		old.vx = p.x - old.x;
		old.vy = p.y - old.y;
		old.x = p.x;
		old.y = p.y;
		mem.points[name] = old;
	}
	return mem;
}
/**
 * Reveals the memory velocity behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} name The name value entering this behavior.
 */
export function memoryVelocity(f, name) {
	return f.poseMemory?.points?.[name] || { vx: 0, vy: 0 };
}
