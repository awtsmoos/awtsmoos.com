
import { HTMLVesselGenerator } from './vessels/HTMLVesselGenerator.js';
import { MainMenuBlueprint } from './data/MainMenuBlueprint.js';
import { LevelSelectBlueprint } from './data/LevelSelectBlueprint.js';
import { AwtsmoosCSSEngine } from '../styles/AwtsmoosCSSEngine.js';

/**
 * @class MenuChariot
 * @description
 * B"H
 * The Merkabah (Chariot) that carries the UI between states.
 * It removes the old vessels and draws down the new ones,
 * ensuring the user's focus is exactly where the Divine Will dictates.
 * This class completely nullifies its own existence, serving only
 * as a conduit to render the JSON blueprints into the DOM.
 */
export class MenuChariot {
    /**
     * Map of menu names to their respective JSON blueprints.
     * @private
     */
    static #blueprints = {
        'main': MainMenuBlueprint,
        'levelSelect': LevelSelectBlueprint
    };

    /**
     * @function init
     * @description
     * B"H
     * Initializes the CSS and sets up the root chariot.
     * 
     * @returns {void}
     */
    static init() {
        AwtsmoosCSSEngine.manifest();
        this.manifestMenu('main');
    }

    /**
     * @function manifestMenu
     * @description
     * B"H
     * Clears existing menus and builds the requested one from nothingness.
     * 
     * @param {string} menuName - The key in the blueprints map.
     * @returns {void}
     */
    static manifestMenu(menuName) {
        this.clearAllMenues();
        const blueprint = this.#blueprints[menuName];
        
        if (!blueprint) {
            console.error(`B"H - Blueprint for ${menuName} does not exist in the Sefirot.`);
            return;
        }

        const vessel = HTMLVesselGenerator.build(blueprint);
        document.body.appendChild(vessel);
    }

    /**
     * @function clearAllMenues
     * @description
     * B"H
     * Returns the UI to the state of Ayin (Nothingness), preparing
     * for a new creation. Removes any overlays currently in the DOM.
     * 
     * @returns {void}
     */
    static clearAllMenues() {
        const existingMenus = document.querySelectorAll('.awtsmoos-overlay');
        existingMenus.forEach(menu => menu.remove());
    }
}
