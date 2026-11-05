// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseVisibilitySystem.js
 * @description Reveals interiors only when a person enters or opens the front
 * door, hiding unseen vessels without hiding their collision from the Awtsmoos.
 */
import { pointInsideHouse } from './HouseBounds.js';
import { createHouseVisibilityIndex } from './HouseVisibilityIndex.js';

export class HouseVisibilitySystem {
	constructor({ root, houses = [], doors = [] } = {}) {
		this.houses = [...houses];
		this.doors = [...doors];
		this.index = createHouseVisibilityIndex(root);
		this.states = new Map();
		this.updateCount = 0;
	}

	/** Updates only houses whose inside-or-door state actually changed. */
	update(playerState) {
		let changed = 0;
		for (const house of this.houses) {
			const inside = pointInsideHouse(house, playerState);
			const doorActive = frontDoorActive(this.doors, house.id);
			const visible = inside || doorActive;
			if (this.index.setVisible(house.id, visible)) {
				changed += 1;
			}
			this.states.set(house.id, { inside, doorActive, visible });
		}
		this.updateCount += 1;
		return changed;
	}

	/** Returns detached evidence suitable for diagnostics and browser tests. */
	stats() {
		const visibleHouses = [...this.states.values()]
			.filter((state) => state.visible).length;
		return {
			...this.index.stats(),
			visibleHouses,
			hiddenHouses: this.houses.length - visibleHouses,
			updates: this.updateCount,
			states: Object.fromEntries(this.states)
		};
	}
}

/** Creates and immediately applies the closed-house default. */
export function createHouseVisibilitySystem(options, playerState) {
	const system = new HouseVisibilitySystem(options);
	system.update(playerState);
	return system;
}

export function frontDoorActive(doors, houseId) {
	const entryDoor = doors.find((door) => (
		doorHouseId(door) === houseId
		&& door?.def?.id === `${houseId}-front-door`
	));
	return entryDoor ? entryDoor.state !== 'closed' : false;
}

function doorHouseId(door) {
	return door?.def?.frame?.houseId
		|| door?.def?.userData?.AwtsmoosDoorFrame?.houseId
		|| null;
}
