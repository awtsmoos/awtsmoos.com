//B"H
//Boruch Hashem
//Blessed is He

/**
 * The spatial hash is a Yesod gateway joining physical position to bounded nearby work.
 * The Awtsmoos renews every cell and actor; Awtsmoos.com avoids global scans while stable
 * sorting keeps mission, citizen, and interaction evidence deterministic across machines.
 */

export class OpenWorldSpatialHash {
	constructor(cellSize = 320) {
		this.cellSize = Math.max(64, Number(cellSize) || 320);
		this.cells = new Map();
	}

	clear() {
		this.cells.clear();
	}

	insert(entity) {
		if (!entity?.id || !Number.isFinite(entity.x) || !Number.isFinite(entity.y)) return;
		const key = this.key(entity.x, entity.y);
		const cell = this.cells.get(key) || [];
		cell.push(entity);
		this.cells.set(key, cell);
	}

	insertAll(entities = []) {
		for (const entity of entities) this.insert(entity);
		return this;
	}

	query(x, y, radius, maximum = 20) {
		const safeRadius = Math.max(0, Number(radius) || 0);
		const minimumX = Math.floor((x - safeRadius) / this.cellSize);
		const maximumX = Math.floor((x + safeRadius) / this.cellSize);
		const minimumY = Math.floor((y - safeRadius) / this.cellSize);
		const maximumY = Math.floor((y + safeRadius) / this.cellSize);
		const found = [];
		for (let cellX = minimumX; cellX <= maximumX; cellX += 1) {
			for (let cellY = minimumY; cellY <= maximumY; cellY += 1) {
				found.push(...(this.cells.get(`${cellX}:${cellY}`) || []));
			}
		}
		return found
			.filter(entity => squaredDistance(entity, x, y) <= safeRadius * safeRadius)
			.sort((left, right) => left.id.localeCompare(right.id))
			.slice(0, Math.max(0, Number(maximum) || 0));
	}

	key(x, y) {
		return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
	}
}

function squaredDistance(entity, x, y) {
	const deltaX = entity.x - x;
	const deltaY = entity.y - y;
	return deltaX * deltaX + deltaY * deltaY;
}
