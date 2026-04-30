
// B"H
import DragLogger from "./DragLogger.js";

/**
 * @class DragState
 * @description
 * 🧠 CHAPTER 2: THE INNER DIMENSIONS OF GRASPING (CHOCHMAH) 🧠
 * 
 * A vessel cannot be moved without a memory of where it came from.
 * This class holds the absolute mathematical state of the drag operation.
 * It is completely detached from the physical DOM, existing purely as
 * JSON data representing coordinates, intent, and identity.
 */
export default class DragState {
    /**
     * @constructor
     * @description Nullifies the state to absolute zero.
     */
    constructor() {
        this.isDragging = false;
        this.isPotentialDrag = false;
        this.activeSlot = null;
        this.startPos = { x: 0, y: 0 };
        this.pendingClick = null;
        DragLogger.log('INFO', 'DragState core initialized within the void.');
    }

    /**
     * @method reset
     * @description Returns the grasp to a state of Tohu (Nothingness).
     */
    reset() {
        this.isDragging = false;
        this.isPotentialDrag = false;
        this.activeSlot = null;
        this.pendingClick = null;
        DragLogger.log('INFO', 'State nullified back to Tohu (Zero).');
    }
}
