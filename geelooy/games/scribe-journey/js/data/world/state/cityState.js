// B"H
// js/data/world/state/cityState.js

/**
 * Chapter 6: CityState is the first vessel where the Awtsmoos lets a city
 * remember. A map is a body; this state is the pulse beneath its stones, counting
 * repair, corruption, morale, and the shlichus flame without guessing from place.
 */
export class CityState {
    /**
     * @param {object} city Authored city registry entry.
     * @param {object} [overrides] Saved-state overrides.
     */
    constructor(city, overrides = {}) {
        this.id = city.id;
        this.name = city.name;
        this.chabadHouse = city.chabadHouse;
        this.houses = [...(city.houses || [])];
        this.masterRabbi = { ...city.masterRabbi };
        this.nextCity = city.nextCity;
        this.repair = overrides.repair ?? 0;
        this.corruption = overrides.corruption ?? 50;
        this.morale = overrides.morale ?? 50;
        this.liberated = overrides.liberated ?? false;
        this.activeProjects = [...(overrides.activeProjects || [])];
        this.flags = [...(overrides.flags || [])];
    }

    /** @returns {boolean} True when the city is stable enough to guide roads. */
    get isRestored() {
        return this.repair >= 100 && this.corruption <= 0;
    }

    /** @returns {object} JSON-safe snapshot for saves and tests. */
    toJSON() {
        return { ...this, isRestored: this.isRestored };
    }
}

/**
 * @param {object[]} cities Authored city list.
 * @param {Record<string, object>} [saved] Optional saved city states.
 * @returns {Record<string, CityState>} City states keyed by city id.
 */
export function createCityStates(cities, saved = {}) {
    return Object.fromEntries(cities.map(city => [city.id, new CityState(city, saved[city.id])]));
}
