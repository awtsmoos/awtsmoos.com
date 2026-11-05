// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileActorSpatialIndex.js
 * @description Resolves stable hostile IDs directly and bounds regional combat queries to grid cells.
 */

export class HostileActorSpatialIndex {
	constructor(cellSize = 12) {
		this.cellSize = Math.max(1, cellSize);
		this.actorsById = new Map();
		this.cells = new Map();
		this.memberships = new Map();
		this.lookupCount = 0;
		this.queryCount = 0;
		this.lastQuery = emptyQuery();
	}

	replace(actors = []) {
		this.clear();
		for (const actor of actors) this.update(actor);
	}

	update(actor) {
		const id = actorId(actor);
		const position = actor?.group?.position;
		if (!id || !Number.isFinite(position?.x) || !Number.isFinite(position?.z)) return false;
		const cellX = Math.floor(position.x / this.cellSize);
		const cellZ = Math.floor(position.z / this.cellSize);
		const previous = this.memberships.get(id);
		this.actorsById.set(id, actor);
		if (previous?.cellX === cellX && previous?.cellZ === cellZ) return true;
		if (previous) this.removeFromCell(previous.cellX, previous.cellZ, id);
		this.cell(cellX, cellZ, true).set(id, actor);
		this.memberships.set(id, { cellX, cellZ });
		return true;
	}

	remove(actorOrId) {
		const id = actorId(actorOrId);
		const membership = this.memberships.get(id);
		if (!membership) return false;
		this.removeFromCell(membership.cellX, membership.cellZ, id);
		this.memberships.delete(id);
		this.actorsById.delete(id);
		return true;
	}

	resolve(actorOrId) {
		this.lookupCount += 1;
		return this.actorsById.get(actorId(actorOrId)) || null;
	}

	queryRadius(center, radius) {
		const safeRadius = Math.max(0, Number(radius) || 0);
		const minimumX = Math.floor((center.x - safeRadius) / this.cellSize);
		const maximumX = Math.floor((center.x + safeRadius) / this.cellSize);
		const minimumZ = Math.floor((center.z - safeRadius) / this.cellSize);
		const maximumZ = Math.floor((center.z + safeRadius) / this.cellSize);
		const actors = [];
		let visitedCells = 0;
		let candidateCount = 0;
		for (let cellX = minimumX; cellX <= maximumX; cellX += 1) {
			for (let cellZ = minimumZ; cellZ <= maximumZ; cellZ += 1) {
				visitedCells += 1;
				const bucket = this.cell(cellX, cellZ, false);
				if (!bucket) continue;
				candidateCount += bucket.size;
				for (const actor of bucket.values()) actors.push(actor);
			}
		}
		this.queryCount += 1;
		this.lastQuery = { candidateCount, radius: safeRadius, visitedCells };
		return actors;
	}

	diagnostics() {
		return {
			actorCount: this.actorsById.size,
			cellCount: countCells(this.cells),
			directLookups: this.lookupCount,
			lastQuery: { ...this.lastQuery },
			regionalQueries: this.queryCount
		};
	}

	clear() {
		this.actorsById.clear();
		this.cells.clear();
		this.memberships.clear();
	}

	cell(cellX, cellZ, create) {
		let column = this.cells.get(cellX);
		if (!column && create) this.cells.set(cellX, column = new Map());
		let bucket = column?.get(cellZ);
		if (!bucket && create) column.set(cellZ, bucket = new Map());
		return bucket || null;
	}

	removeFromCell(cellX, cellZ, id) {
		const column = this.cells.get(cellX);
		const bucket = column?.get(cellZ);
		bucket?.delete(id);
		if (bucket?.size === 0) column.delete(cellZ);
		if (column?.size === 0) this.cells.delete(cellX);
	}
}

function actorId(actorOrId) {
	return typeof actorOrId === 'string' ? actorOrId : actorOrId?.profile?.id || '';
}

function countCells(columns) {
	let count = 0;
	for (const column of columns.values()) count += column.size;
	return count;
}

function emptyQuery() {
	return { candidateCount: 0, radius: 0, visitedCells: 0 };
}
