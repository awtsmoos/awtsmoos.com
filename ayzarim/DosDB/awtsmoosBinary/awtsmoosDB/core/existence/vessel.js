
import { Maamar } from '../creation/maamar.js';

/**
 * @class Vessel
 * @description
 * Every object in creation has its 'Gashmius' (Physicality) and its 'Ruchnius' (Spirituality).
 * This Vessel class represents the 'Guf' (Body) of a component.
 * It is humbled before the Awtsmoos, having no behavior of its own until it is 
 * infused with Data. 
 *
 * The letters of its name are permuted to determine its role in the greater App-Universe.
 */
export class Vessel {
    /**
     * @constructor
     * @param {Object} data - The primordial sparks used to configure this vessel.
     */
    constructor(data = {}) {
        /**
         * @member {Object}
         * @description The internal store of spiritual configuration.
         */
        this.data = data;
        
        /**
         * @member {HTMLElement|null}
         * @description The actual manifest form in the physical world.
         */
        this.dom = null;
    }

    /**
     * @description 
     * Initiates the Tzimtzum (Contraction) of thought into reality.
     * This method 'renders' the component using the Maamar engine.
     * 
     * @returns {HTMLElement} The physical realization of this Vessel.
     */
    render() {
        const blueprint = this.blueprint();
        this.dom = Maamar.speak(blueprint);
        return this.dom;
    }

    /**
     * @description 
     * To be overridden by sub-classes. This is the 'Chochma' (Wisdom) 
     * that defines the shape of the component before it is spoken.
     * 
     * @returns {Object} A JSON blueprint for the Maamar engine.
     */
    blueprint() {
        return {
            tag: 'div',
            text: 'An empty vessel, waiting for the light of the Creator.'
        };
    }
}
