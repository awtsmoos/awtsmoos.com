
//B"H
import TabManager from "/heichelos/post/TabManager.js";
import { appendHTML } from "./utils.js";

var man = null;

export function addTab({
    header, content, append, rootParent=null, addClasses=false, parent=null, btnParent=null, tabParent=null, onswitch, onopen, onclose, oninit
}) {
    if (!man) {
        // If rootParent isn't provided, try to find the sidebar if it exists in DOM
        if(!rootParent) rootParent = document.querySelector(".sidebar");
        
        man = new TabManager({
            parent: rootParent,
            onclose() {
                const btn = document.getElementById("commentaryBtn");
                if(btn) btn.dispatchEvent(new CustomEvent("click",{}));
            }
        });
        window.tabManager = man;
    }
    return man.addTab({
        header, content, append, addClasses, parent, btnParent, tabParent, onswitch, onopen, onclose, oninit
    });
}
