//B"H
import TabManager from "/heichelos/post/TabManager.js";
import { showCustomContextMenu } from "./functions/ui.js";
import { injectPostLayoutCSS } from "./styles/layout.js";
import { injectPostTabsCSS } from "./styles/tabs.js";
import { injectPostContentCSS } from "./styles/content.js";

// Re-export functions from sub-modules for backward compatibility
export * from "./functions/utils.js";
export * from "./functions/ui.js";
export * from "./functions/interaction.js";
export * from "./functions/logic.js";

// Inject Split Styles
injectPostLayoutCSS();
injectPostTabsCSS();
injectPostContentCSS();

// Tab Logic specific to postFunctions
var man = null;
export function addTab({
    header, content, append, rootParent=null, addClasses=false, parent=null, btnParent=null, tabParent=null, onswitch, onopen, onclose, oninit
}) {
    if (!man) {
        man = new TabManager({
            parent: rootParent,
            onclose() {
                window?.commentaryBtn?.dispatchEvent(new CustomEvent("click",{}))
            }
        });
        window.tabManager = man;
    }
    return man.addTab({
        header, content, append, addClasses, parent, btnParent, tabParent, onswitch, onopen, onclose, oninit
    });
}

// Initialize Context Menu listener
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    showCustomContextMenu(e.pageX, e.pageY, e);
});
