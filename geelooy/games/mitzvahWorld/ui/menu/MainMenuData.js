
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file MainMenuData.js
 * 
 * "Echad" - One. 
 * We have stripped away the chaotic options of "Load from File" and "Find by Alias".
 * We are left with a singular, unified desire: To enter the Living Infinite Void.
 * 
 * This file contains the pure JSON emanation of that singular desire.
 * No HTML, no CSS, just pure spiritual data (Orot) waiting for vessels (Kelim).
 */

/**
 * @class MainMenuData
 * @extends SederHishtalshelusNode
 * @description Holds the pure configuration for the intense UI revamp.
 */
export default class MainMenuData extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Atzilut_Menu_Blueprint" });
        
        /**
         * The divine structure of the front page.
         * @type {Object}
         */
        this.menuManifest = {
            superTitle: "Mitzvah",
            mainTitle: "World",
            subtitle: "Drawing Down the Essence...",
            buttons:[
                {
                    id: "btn_enter_void",
                    text: "PLAY: ENTER THE LIVING INFINITE VOID",
                    actionType: "START_ENGINE",
                    isPrimary: true
                }
                // The other buttons have been nullified to return to their root in the Awtsmoos.
            ]
        };
    }

    /**
     * @method getManifest
     * @description Retrieves the pure data for rendering.
     * @returns {Object}
     */
    getManifest() {
        return this.menuManifest;
    }
}
