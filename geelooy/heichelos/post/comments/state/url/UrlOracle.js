
/**
 * B"H
 * @module UrlOracle
 * @chapter The Record of the Speech in the Heavens
 * @description
 * Before a thing is manifest in the physical world of the DOM,
 * it is spoken into the potentiality of the URL. This Oracle
 * deciphers the query strings—the holy letters of pathfinding.
 */

/**
 * @class AwtsmoosURLOracle
 * @description The Sovereign interpreter of the browser's coordinates.
 */
export class AwtsmoosURLOracle {
    /**
     * @method read
     * @description Extracts a specific spark from the URL's potential.
     * @param {string} key - The identity of the coordinate.
     * @returns {string|null} - The manifest value.
     */
    static read(key) {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    }

    /**
     * @method getAll
     * @description Provides the full array of celestial coordinates.
     * @returns {URLSearchParams}
     */
    static getAll() {
        return new URLSearchParams(window.location.search);
    }
    
    /**
     * @method update
     * @description Commands the URL to change its speech without refreshing reality.
     */
    static update(key, value) {
        const url = new URL(window.location);
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
        window.history.replaceState({ path: url.href }, '', url.href);
    }
}
