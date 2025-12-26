//B"H
/**
 * Post Functions Aggregator.
 * Purged of all obsolete JS-based CSS injectors to satisfy the Divine Will of clean modularity.
 */
import { showCustomContextMenu } from "./functions/ui.js";

// Re-export functions from sub-modules for backward compatibility
export * from "./functions/utils.js";
export * from "./functions/ui.js";
export * from "./functions/logic.js";
export { scrollToActiveEl, weaveDropdownFromAwtsmoos, initializeFootnotes } from "./functions/interaction.js";
export { addTab } from "./functions/tabs.js";

/**
 * @method initPostInteractions
 * @description B"H - Sets up the high-level event listeners for the reader.
 */
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    showCustomContextMenu(e.pageX, e.pageY, e);
});