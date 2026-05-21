/**
 * B"H
 * Chapter 24: The House Remembered The Footstep.
 */

export class HousePersistenceRuntime {
  constructor(initial = {}) {
    this.state = structuredClone(initial);
  }

  setHouseState(houseId, patch) {
    this.state[houseId] = { ...(this.state[houseId] || {}), ...patch };
    return this.getHouseState(houseId);
  }

  recordDoor(houseId, doorId, isOpen) {
    const house = this.state[houseId] || {};
    const doors = { ...(house.doors || {}), [doorId]: { isOpen } };
    return this.setHouseState(houseId, { doors });
  }

  getHouseState(houseId) {
    return structuredClone(this.state[houseId] || {});
  }

  snapshot() {
    return structuredClone(this.state);
  }
}

export default HousePersistenceRuntime;
