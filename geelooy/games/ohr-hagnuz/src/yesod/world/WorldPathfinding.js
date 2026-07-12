/**
 * B"H
 * @module WorldPathfinding
 * @description Tile lookup, safe spawning, and path discovery separated from portal effects.
 */
import { State } from '../../binah/State.js';
import { WorldData, isPassableGlyph, tileMeta } from '../../data/WorldData.js';

export const tileAt = (x, y, mapId = State.MapId) => {
	const map = WorldData[mapId];
	if (!map || y < 0 || y >= map.length) return null;
	const row = map[y] || '';
	return x < 0 || x >= row.length ? null : row[x];
};

export const metaAt = (x, y, mapId = State.MapId) => tileMeta(tileAt(x, y, mapId));
export const mapSize = (mapId = State.MapId) => ({
	w: Math.max(0, ...(WorldData[mapId] || []).map(row => row.length)),
	h: (WorldData[mapId] || []).length
});
export const canPass = (x, y) => {
	const glyph = tileAt(x, y);
	return glyph !== null && isPassableGlyph(glyph);
};

const passableOnMap = (mapId, x, y) => {
	const glyph = tileAt(x, y, mapId);
	return glyph !== null && isPassableGlyph(glyph);
};

export const safeSpawn = (mapId, requested) => {
	if (passableOnMap(mapId, requested.x, requested.y)) return requested;
	const size = mapSize(mapId);
	for (let radius = 1; radius < Math.max(size.w, size.h); radius += 1) {
		for (let y = Math.max(0, requested.y - radius); y <= Math.min(size.h - 1, requested.y + radius); y += 1) {
			for (let x = Math.max(0, requested.x - radius); x <= Math.min(size.w - 1, requested.x + radius); x += 1) {
				if (passableOnMap(mapId, x, y)) return { x, y };
			}
		}
	}
	return { x: 1, y: 1 };
};

export const findPath = (sx, sy, tx, ty) => {
	if (sx === tx && sy === ty) return [];
	if (!canPass(tx, ty)) return null;
	const queue = [{ x: sx, y: sy, path: [] }];
	const visited = new Set([`${sx},${sy}`]);
	const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
	while (queue.length) {
		const current = queue.shift();
		if (current.x === tx && current.y === ty) return current.path;
		for (const [dx, dy] of directions) {
			const x = current.x + dx;
			const y = current.y + dy;
			const key = `${x},${y}`;
			if (visited.has(key) || !canPass(x, y)) continue;
			visited.add(key);
			queue.push({ x, y, path: [...current.path, { x, y }] });
		}
		if (visited.size > 2600) break;
	}
	return null;
};

export const approachOptions = (x, y) => [[0, 1], [1, 0], [-1, 0], [0, -1]]
	.map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
	.filter(point => canPass(point.x, point.y));
