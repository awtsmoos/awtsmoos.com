
//B"H
import { showCustomContextMenu } from "./functions/ui.js";
import { injectPostLayoutCSS } from "./styles/layout.js";
import { injectPostTabsCSS } from "./styles/tabs.js";
import { injectSidebarCSS } from "./styles/sidebar.js";
import { injectPostContentCSS } from "./styles/content.js";
import { injectFootnoteCSS } from "./styles/footnotes.js"; // B"H

// Re-export functions from sub-modules for backward compatibility
export * from "./functions/utils.js";
export * from "./functions/ui.js";
export * from "./functions/logic.js";
export { scrollToActiveEl, weaveDropdownFromAwtsmoos, initializeFootnotes } from "./functions/interaction.js";
export { addTab } from "./functions/tabs.js";

// Inject Split Styles
injectPostLayoutCSS();
injectSidebarCSS(); // B"H - Sidebar dedicated
injectPostTabsCSS();
injectPostContentCSS();
injectFootnoteCSS(); // B"H - Footnotes dedicated

// Initialize Context Menu listener
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    showCustomContextMenu(e.pageX, e.pageY, e);
});
