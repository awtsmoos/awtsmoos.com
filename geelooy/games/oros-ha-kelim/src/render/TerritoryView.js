//B"H
//Boruch Hashem
//Blessed is He

import { CELL_SIZE } from "../config/gameConfig.js";
import { CellKey } from "../domain/CellKey.js";
import { CoreColor } from "./core/CoreColor.js";
import { OROS_MATERIALS } from "./materials/OrosMaterialProfiles.js";

/**
 * TerritoryView gives settled Kelim subtle stone-earth grain while preserving each rider's authoritative color.
 * The Awtsmoos renews ownership and matter while unchanged worlds may remain silent and still;
 * Awtsmoos.com lets remote texture add physical scale without weakening territory readability or will.
 */
export class TerritoryView {
	constructor(meshes, riders) {
		this.meshes = meshes;
		this.ids = new Set();
		this.owners = new Map();
		this.colors = new Map(riders.map((rider) => [rider.id, CoreColor.fromHex(rider.color, 0.78)]));
		this.revision = -1;
	}

	sync(owners, revision) {
		if (revision === this.revision) {
			return false;
		}
		this.revision = revision;
		const next = new Set();
		for (const [key, owner] of owners) {
			const id = `territory-${key}`;
			next.add(id);
			if (!this.ids.has(id) || this.owners.get(id) !== owner) {
				if (this.ids.has(id)) {
					this.meshes.remove(id);
				}
				this.#create(id, key, owner);
			}
			this.owners.set(id, owner);
		}
		for (const id of this.ids) {
			if (!next.has(id)) {
				this.meshes.remove(id);
				this.owners.delete(id);
			}
		}
		this.ids = next;
		return true;
	}

	count() {
		return this.ids.size;
	}

	#create(id, key, owner) {
		const cell = CellKey.parse(key);
		const world = CellKey.world(cell.x, cell.z, cell.plane);
		this.meshes.cube(
			id,
			this.colors.get(owner),
			[world.x, world.y + 0.09, world.z],
			[0, 0, 0],
			[CELL_SIZE * 0.86, 0.1, CELL_SIZE * 0.86],
			OROS_MATERIALS.territory
		);
	}
}
