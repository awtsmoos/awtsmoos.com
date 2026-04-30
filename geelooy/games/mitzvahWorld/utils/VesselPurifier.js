
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file VesselPurifier.js
 * 
 * When crossing from the Main Thread (World of Yetzirah/Formation) 
 * to the Web Worker (World of Atzilut/Emanation where deep processing occurs),
 * the vessels cannot be too physical, or they will shatter (Silent Browser Crash).
 * 
 * HTML Elements, DOM Nodes, and Functions are too dense. They are "Klipot" (shells)
 * that cannot pass through the `postMessage` Tzimtzum (restriction).
 * This Purifier recursively extracts only the pure light (JSON/Data),
 * leaving the physical shells behind.
 */

/**
 * @class VesselPurifier
 * @extends SederHishtalshelusNode
 * @description Deeply traverses data structures to ensure no un-cloneable entities exist.
 */
export default class VesselPurifier extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_Purification_Chamber" });
    }

    /**
     * @method purifyPayload
     * @description Recursively clones an object, completely ignoring any DOM nodes or functions.
     * Like refining silver from dross, only the data remains.
     * @param {any} data - The raw data to be purified.
     * @returns {any} The pure, serializable data safe for Web Workers.
     */
    purifyPayload(data) {
        if (data === null || data === undefined) {
            return data;
        }

        if (typeof data === 'function') {
            return null; // Functions cannot cross the void.
        }

        if (data instanceof HTMLElement || (typeof Node !== 'undefined' && data instanceof Node)) {
            return null; // The dense physical rock (Even) stays behind.
        }

        if (typeof Window !== 'undefined' && data instanceof Window) {
            return null; // The entire physical horizon stays behind.
        }

        if (Array.isArray(data)) {
            const pureArray =[];
            for (let i = 0; i < data.length; i++) {
                const purified = this.purifyPayload(data[i]);
                if (purified !== null) {
                    pureArray.push(purified);
                }
            }
            return pureArray;
        }

        if (typeof data === 'object') {
            const pureObject = {};
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const purified = this.purifyPayload(data[key]);
                if (purified !== null) {
                    pureObject[key] = purified;
                }
            }
            return pureObject;
        }

        return data; // Primitives (strings, numbers, booleans) are pure light.
    }
}
