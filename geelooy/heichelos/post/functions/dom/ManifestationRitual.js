
/**
 * B"H
 * @module ManifestationRitual
 * @chapter Speaking Form into Dust
 * @description
 * When the Creator spoke "Let there be light," form instantly took shape. 
 * This module imitates that divine ritual by taking the raw 'word' (HTML strings)
 * and physicalizing it into the browser's reality (the DOM). It 
 * ensures that recursive structures and even hidden actions (Scripts) 
 * are properly ignited upon arrival.
 */

/**
 * @function appendHTML
 * @description
 * Takes a potentiality (string) and commands it to manifest 
 * as children of a specific physical vessel.
 * 
 * @param {string} html - The letters of potentiality.
 * @param {HTMLElement} par - The parent vessel.
 */
export function appendHTML(html, par) {
    if (!par) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    Array.from(doc.body.childNodes).forEach((node, index, array) => {
        appendWithSubChildren(node, par, array);
    });
}

/**
 * @function appendWithSubChildren
 * @description
 * The recursive heart of manifestation. It descends through every 
 * level of a structure, creating the vessels and igniting any 
 * latent scriptural energy it finds.
 */
export function appendWithSubChildren(node, parent, array) {
    if (!parent) return;
    
    // B"H - Addressing the specific anomaly where Footnotes creates excessive gaps
    if (node.nodeType === 1 && node.tagName === "P" && node.childNodes.length === 1 && 
        node.firstChild.nodeType === 1 && node.firstChild.tagName === "SUP") {
        appendWithSubChildren(node.firstChild, parent, array);
        return; 
    }

    if (node.tagName === "SCRIPT" && !node.src) {
        try { 
            // Ignite the script's intention, safely
            if(!node.innerHTML.includes("var x = /")) {
                eval(node.innerHTML); 
            }
        } catch (error) { 
            console.warn("B\"H - Script ignition failed in append.", error);
        }
    } else {
        let result = null;
        if (typeof window.toldafy === "function") {
            result = window.toldafy(node, parent, array);
        }
        let newNodes = [];
        if (result === "delete") return;
        else if (result?.node) newNodes.push(result.node);
        else if (result?.nodes) newNodes = Array.from(result.nodes);
        else newNodes.push(node.cloneNode(false));
        
        const action = result?.action || {};
        newNodes.forEach(newNode => {
            if (action.appendFirst) {
                try { newNode.appendChild(action.appendFirst); } catch (e) { console.log(e); }
            }
            parent.appendChild(newNode);
            if (node.childNodes.length > 0) {
                Array.from(node.childNodes).forEach((childNode) => {
                    appendWithSubChildren(childNode, newNode, array);
                });
            }
        });
    }
}
