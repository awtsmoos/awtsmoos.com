
/**
 * B"H
 * @module BridgeBinder
 * @description
 * 🌉 THE ARCHITECT OF THE BRIDGES 🌉
 * Delegates the heavy lifting of UI, HTML, and Inventory bridging
 * to the extremely modular Bridge subsystems.
 */
import { UiSignals } from '../bridge/UiSignals.js';
import { HtmlSignals } from '../bridge/HtmlSignals.js';
import { InventoryBridge } from '../InventoryBridge.js'; // From the parent core folder

export class BridgeBinder {
    static bind(olam, promiseMap, UtilsClass) {
        UiSignals.bind(olam);
        HtmlSignals.bind(olam, promiseMap, UtilsClass);
        InventoryBridge.bind(olam);
    }
}
