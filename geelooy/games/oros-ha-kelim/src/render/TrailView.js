//B"H
//Boruch Hashem
//Blessed is He

import { CellKey } from "../domain/CellKey.js";
import { CoreColor } from "./core/CoreColor.js";
import { CoreTransform } from "./core/CoreTransform.js";

/**
 * TrailView appends exposed Ohr incrementally so one new spark never rebuilds the whole remembered path.
 * The Awtsmoos renews each dangerous segment while earlier light may keep its settled GPU place;
 * Awtsmoos.com clears only on true reset and lets long trails grow with measured grace.
 */
export class TrailView {
	constructor(meshes, riders) {
		this.meshes = meshes;
		this.ids = new Set();
		this.states = new Map();
		this.colors = new Map(riders.map((rider) => [rider.id, CoreColor.fromHex(rider.color, 0.96)]));
	}

	sync(riders) {
		for (const rider of riders) {
			this.#syncRider(rider);
		}
	}

	count() {
		return this.ids.size;
	}

	#syncRider(rider) {
		const state = this.#state(rider.id);
		const originKey = rider.trailOrigin ? this.#key(rider.trailOrigin) : "";
		const length = rider.activeTrail.length;
		if (!originKey || !length) {
			this.#clear(state);
			return;
		}
		const priorCell = state.renderedCells ? rider.activeTrail[state.renderedCells - 1] : null;
		const priorMatches = !state.lastKey || (priorCell && this.#key(priorCell) === state.lastKey);
		if (state.originKey !== originKey || length < state.renderedCells || !priorMatches) {
			this.#clear(state);
		}
		state.originKey = originKey;
		for (let index = state.renderedCells; index < length; index += 1) {
			this.#addSegment(rider, state, index);
		}
		state.renderedCells = length;
		state.lastKey = this.#key(rider.activeTrail[length - 1]);
	}

	#addSegment(rider, state, index) {
		const fromCell = index === 0 ? rider.trailOrigin : rider.activeTrail[index - 1];
		const toCell = rider.activeTrail[index];
		const transform = CoreTransform.segment(this.#world(fromCell), this.#world(toCell), 0.18, 0.62);
		const id = `trail-${rider.id}-${index + 1}`;
		const mesh = this.meshes.cube(id, this.colors.get(rider.id));
		mesh.transform = transform;
		state.ids.push(id);
		this.ids.add(id);
	}

	#clear(state) {
		for (const id of state.ids) {
			this.meshes.remove(id);
			this.ids.delete(id);
		}
		state.originKey = "";
		state.renderedCells = 0;
		state.lastKey = "";
		state.ids = [];
	}

	#state(riderId) {
		if (!this.states.has(riderId)) {
			this.states.set(riderId, { originKey: "", renderedCells: 0, lastKey: "", ids: [] });
		}
		return this.states.get(riderId);
	}

	#key(cell) {
		return CellKey.key(cell.plane, cell.x, cell.z);
	}

	#world(cell) {
		const world = CellKey.world(cell.x, cell.z, cell.plane);
		return [world.x, world.y + 0.62, world.z];
	}
}
