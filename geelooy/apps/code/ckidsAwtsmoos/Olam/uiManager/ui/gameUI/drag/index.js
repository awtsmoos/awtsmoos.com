
// B"H
/**
 * @file index.js
 * @description
 * 🌟 CHAPTER 5: THE GATHERING POINT 🌟
 * 
 * "Everything follows the head." 
 * This index file wraps the vast complexity of the DragCore, DragGhostManager, 
 * DragState, and DragLogger into a single function call to be ignited by the UI array.
 */
import DragCore from "./DragCore.js";

/**
 * @function initDragSystem
 * @description Ignites the physical drag interactions in the window.
 */
export default function initDragSystem() {
    DragCore.init();
}
