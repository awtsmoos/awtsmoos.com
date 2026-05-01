/**
 * B"H
 * @module URLParamManager
 * @chapter The Scroll of Search
 * @description
 * Before anything could exist in the lower worlds, it was spoken in the upper ones.
 * The URL is the record of that speech. This module retrieves the 'Letters of Intention'
 * from the heavens of the browser.
 */

/**
 * @class AwtsmoosURLOracle
 * @description Deciphers the parameters of creation from the location.
 */
export class AwtsmoosURLOracle {
    /**
     * @method read
     * @description Fetches a specific value from the URL's potentiality.
     * @param {string} key - The identity of the parameter.
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
}