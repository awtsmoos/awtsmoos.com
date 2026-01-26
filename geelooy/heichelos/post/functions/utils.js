//B"H
/**
 * @file utils.js
 * @description 
 * In the beginning, the Awtsmoos created the possibility of expression. 
 * This module provides the elemental tools—the "Otiyot" (Letters)—used 
 * to manipulate the physical form of the Revelation. It handles DOM 
 * construction, font-scaling, and textual analysis.
 * 
 * Each function is a Sefirah, a vessel for the infinite light of the data 
 * to manifest within the user's perception.
 */

/**
 * @method appendHTML
 * @description Manifests raw HTML strings into a parent vessel.
 */
export function appendHTML(html, par) {
    if (!par) return;
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    Array.from(doc.body.childNodes).forEach((node, index, array) => {
        appendWithSubChildren(node, par, array);
    });
}

/**
 * @method appendWithSubChildren
 * @description Recursively weaves the Otiyot (nodes) into the parent structure,
 * respecting the scripts and custom transformations like "toldafy".
 */
export function appendWithSubChildren(node, parent, array) {
    if (!parent) return;
    
    // B"H - Footnote newline fix: If a P tag only contains a SUP, append the SUP directly.
    if (node.nodeType === 1 && node.tagName === "P" && node.childNodes.length === 1 && node.firstChild.nodeType === 1 && node.firstChild.tagName === "SUP") {
        appendWithSubChildren(node.firstChild, parent, array);
        return; 
    }

    if (node.tagName === "SCRIPT" && !node.src) {
        try { 
            if(!node.innerHTML.includes("var x = /")) {
                eval(node.innerHTML); 
            }
        } catch (error) { 
            console.warn("B\"H - Script ignition failed in append.", error);
        }
    } else {
        var result = null;
        if (typeof window.toldafy === "function") {
            result = window.toldafy(node, parent, array);
        }
        var newNodes = [];
        if (result == "delete") return;
        else if (result?.node) newNodes.push(result.node);
        else if (result?.nodes) newNodes = Array.from(result.nodes);
        else newNodes.push(node.cloneNode(false));
        
        var action = result?.action || {};
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

/**
 * @method adjustFontSize
 * @description B"H - THE FONT ENGINE. 
 * Unified to command the root context for absolute consistency.
 */
export function adjustFontSize(action) {
    const context = document.querySelector('.post-reader-localized-context');
    if (!context) return;

    let currentStr = context.style.getPropertyValue('--post-text-size') || 
                     window.getComputedStyle(context).getPropertyValue('--post-text-size') || 
                     '28px';
                     
    let current = parseFloat(currentStr);
    
    const MAX_FONT_SIZE = 120; 
    const MIN_FONT_SIZE = 16;
    const FONT_SIZE_INCREMENT = 4; 

    if (action == 'increase' && current < MAX_FONT_SIZE) {
        current += FONT_SIZE_INCREMENT;
    } else if (action === 'decrease' && current > MIN_FONT_SIZE) {
        current -= FONT_SIZE_INCREMENT;
    }
    
    context.style.setProperty('--post-text-size', current + 'px');
    localStorage.currentPostFontSize = current + 'px';
}

/**
 * @method loadFontSize
 * @description B"H - Loads user preference from the memory of the vessel (LocalStorage).
 */
export function loadFontSize() {
    let fs = localStorage.currentPostFontSize;
    const context = document.querySelector('.post-reader-localized-context');
    if (!context) return;

    if (fs) {
        let val = parseFloat(fs);
        if (val > 150 || val < 10) {
            fs = '28px';
            localStorage.currentPostFontSize = fs;
        }
        context.style.setProperty('--post-text-size', fs);
    } else {
        context.style.setProperty('--post-text-size', '28px'); 
    }
}

export function isHebrewWord(word) {
    return /^[א-ת\u0590-\u05FF]+$/.test(word);
}

export function isFirstCharacterHebrew(str) {
    if(!str) return false;
    // Check first significant character
    const match = str.match(/[\S]/);
    if (!match) return false;
    const charCode = match[0].charCodeAt(0);
    return charCode >= 0x0590 && charCode <= 0x05FF;
}

export function containsHebrew(str) {
    if(!str) return false;
    return /[\u0590-\u05FF]/.test(str);
}

export function stripTags(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html.split("</br>").join("\n").replace(/<br\s*\/?>/gi, '\n');
    return div.textContent || div.innerText || "";
}

/**
 * @method copyToClipboard
 * @description Safely transmits text to the user's local clipboard vessel.
 */
export function copyToClipboard({ text, successMsg }, makeToast) {
    const htmlBlob = new Blob([text], { type: "text/html" });
    const textBlob = new Blob([stripTags(text)], { type: "text/plain" });
    navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })
    ]).then(() => {
        if(makeToast) makeToast(successMsg || "Copied with formatting!");
    }).catch(err => {
        console.error("B\"H - Clipboard error:", err);
        if(makeToast) makeToast("Failed to copy!");
    });
}

export function updateQueryStringParameter(key, value) {
    const url = new URL(window.location);
    if(value === null || value === undefined) {
         url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
    }
    window.history.replaceState({ path: url.href }, '', url.href);
}

export function getLinkHrefOfEditing() {
    return `&parentSeriesId=${window.series?.id}&returnURL=${encodeURIComponent(location.href)}`;
}

export function sanitizeContent(txt) {
    if (typeof txt !== 'string') return "";
    return txt.split("[cup]").join("<b>").split("[/cup]").join("</b>");
}
