
/**
 * B"H
 * UI Manager - Aggregator
 */

import UI from "/scripts/awtsmoos/ui/index.js";
import initialization from "./methods/initialization.js";
import gameMenuMethods from "./methods/gameMenu.js";

export default class UIManager {
    constructor() {
        this.UIClass = UI;
        Object.assign(this, initialization);
        Object.assign(this, gameMenuMethods);
    }
}
