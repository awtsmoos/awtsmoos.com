
// B"H
import DragLogger from "./DragLogger.js";

/**
 * @class DragGhostManager
 * @description
 * 👻 CHAPTER 3: THE ETHEREAL PROJECTION (TIFERET) 👻
 * 
 * When a spark is pulled from its vessel, its physical body remains in the slot 
 * until the drop is completed. What the user drags across the screen is merely an 
 * ethereal projection—a ghost. This manager summons and banishes that ghost.
 */
export default class DragGhostManager {
    /**
     * @method show
     * @description Projects the image of the item into the cursor's coordinates.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @param {string} iconUrl - The visual pattern of the spark.
     */
    static show(x, y, iconUrl) {
        const ghost = document.getElementById('awtsmoos-drag-ghost');
        if (ghost) {
            ghost.style.backgroundImage = 'url("' + iconUrl + '")';
            ghost.style.left = x + 'px';
            ghost.style.top = y + 'px';
            ghost.classList.remove('hidden');
            ghost.style.display = 'block'; 
            DragLogger.log('ACTION', 'Ghost entity manifested on screen.');
        } else {
            DragLogger.log('CRITICAL', 'Ghost Element Missing from DOM! The projection failed.');
        }
    }

    /**
     * @method update
     * @description Shifts the ghost's spatial coordinates instantly.
     * @param {number} x 
     * @param {number} y 
     */
    static update(x, y) {
        const ghost = document.getElementById('awtsmoos-drag-ghost');
        if (ghost) {
            ghost.style.left = x + 'px';
            ghost.style.top = y + 'px';
        }
    }

    /**
     * @method hide
     * @description Returns the ghost to the void.
     */
    static hide() {
        const ghost = document.getElementById('awtsmoos-drag-ghost');
        if (ghost) {
            ghost.classList.add('hidden');
            ghost.style.display = 'none';
        }
    }
}
