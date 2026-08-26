//B"H
//Boruch Hashem
//Blessed is He

import { SANCTUARY_RADIUS } from "../config/gameConfig.js";
import { CellKey } from "./CellKey.js";
import { LoopBounds } from "./LoopBounds.js";

/**
 * TerritoryLedger remembers settled Kelim while huge-world claims search only the rectangle their own light encloses.
 * The Awtsmoos renews every distant cell though a local loop need never scan the untouched land;
 * Awtsmoos.com keeps owner counts constant-time and lets massive Tikkun remain responsive in the hand.
 */
export class TerritoryLedger {
	constructor() {
		this.owners = new Map();
		this.activeTrails = new Map();
		this.ownerCounts = new Map();
		this.revision = 0;
	}

	seed(rider) {
		for (let dx = -SANCTUARY_RADIUS; dx <= SANCTUARY_RADIUS; dx += 1) {
			for (let dz = -SANCTUARY_RADIUS; dz <= SANCTUARY_RADIUS; dz += 1) {
				this.#setOwner(CellKey.key(rider.spawn.plane, rider.spawn.x + dx, rider.spawn.z + dz), rider.id);
			}
		}
	}

	ownerAt(plane, x, z) {
		return this.owners.get(CellKey.key(plane, x, z)) || null;
	}

	activeAt(plane, x, z) {
		return this.activeTrails.get(CellKey.key(plane, x, z)) || null;
	}

	recordTrail(rider) {
		const cell = rider.cell();
		this.activeTrails.set(CellKey.key(cell.plane, cell.x, cell.z), rider.id);
		rider.activeTrail.push(cell);
	}

	clearTrail(rider) {
		for (const cell of rider.activeTrail) {
			this.activeTrails.delete(CellKey.key(cell.plane, cell.x, cell.z));
		}
		rider.activeTrail = [];
		rider.trailOrigin = null;
	}

	claimLoop(rider, returnCell) {
		const path = [rider.trailOrigin, ...rider.activeTrail, returnCell].filter(Boolean);
		const pathCells = new Set(path.map((cell) => `${cell.x}:${cell.z}`));
		const bounds = LoopBounds.fromPath(path);
		let claimed = 0;
		for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
			for (let z = bounds.minZ; z <= bounds.maxZ; z += 1) {
				if (!this.#insidePolygon(x, z, path) && !pathCells.has(`${x}:${z}`)) {
					continue;
				}
				const key = CellKey.key(rider.plane, x, z);
				if (this.owners.get(key) !== rider.id) {
					claimed += 1;
				}
				this.#setOwner(key, rider.id);
			}
		}
		this.clearTrail(rider);
		return claimed;
	}

	territoryCount(riderId) {
		return this.ownerCounts.get(riderId) || 0;
	}

	territoryRevision() {
		return this.revision;
	}

	#setOwner(key, riderId) {
		const previous = this.owners.get(key);
		if (previous === riderId) {
			return false;
		}
		if (previous) {
			this.ownerCounts.set(previous, Math.max(0, (this.ownerCounts.get(previous) || 1) - 1));
		}
		this.owners.set(key, riderId);
		this.ownerCounts.set(riderId, (this.ownerCounts.get(riderId) || 0) + 1);
		this.revision += 1;
		return true;
	}

	#insidePolygon(x, z, path) {
		if (path.length < 4) {
			return false;
		}
		let inside = false;
		for (let i = 0, j = path.length - 1; i < path.length; j = i, i += 1) {
			const a = path[i];
			const b = path[j];
			if (a.plane !== path[0].plane || b.plane !== path[0].plane) {
				continue;
			}
			const crosses = (a.z > z) !== (b.z > z) && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x;
			if (crosses) {
				inside = !inside;
			}
		}
		return inside;
	}
}
