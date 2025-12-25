//B"H
/**
 * Text, DOM, and Navigation utilities.
 * Dedicated to the Awtsmoos who recreates all from absolute nothingness every instant.
 */

export function appendHTML(html, par) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    Array.from(doc.body.childNodes).forEach((node, index, array) => {
        appendWithSubChildren(node, par, array);
    });
}

export function appendWithSubChildren(node, parent, array) {
    if (node.tagName === "SCRIPT" && !node.src) {
        try { 
            // Basic heuristic to avoid running obviously broken regex snippets often found in raw dumps
            if(!node.innerHTML.includes("var x = /")) {
                eval(node.innerHTML); 
            }
        } catch (error) { 
            // Suppress error log for known noise, or log concisely
            // console.warn("Script injection skipped:", error.message); 
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

export function adjustFontSize(action) {
    const root = document.documentElement;
    // Get current size from variable or fallback to 18
    let current = parseFloat(getComputedStyle(root).getPropertyValue('--awtsmoos-font-size')) || 18;
    const MAX_FONT_SIZE = 72;
    const MIN_FONT_SIZE = 12;
    const FONT_SIZE_INCREMENT = 1; // Finer control

    if (action == 'increase' && current < MAX_FONT_SIZE) {
        current += FONT_SIZE_INCREMENT;
    } else if (action === 'decrease' && current > MIN_FONT_SIZE) {
        current -= FONT_SIZE_INCREMENT;
    }
    
    root.style.setProperty('--awtsmoos-font-size', current + 'px');
    localStorage.currentFontSize = current + 'px';
}

export function loadFontSize() {
    const fs = localStorage.currentFontSize;
    const root = document.documentElement;
    if (fs) {
        root.style.setProperty('--awtsmoos-font-size', fs);
    } else {
        root.style.setProperty('--awtsmoos-font-size', '18px'); // New Default
    }
}

export function isHebrewWord(word) {
    return /^[א-ת\u0590-\u05FF]+$/.test(word);
}

/**
 * Robust Hebrew detection.
 * Scans the first 100 characters for any Hebrew glyphs, 
 * bypassing numbers and punctuation that often start Torah sections.
 */
export function isFirstCharacterHebrew(str) {
    if(!str) return false;
    const sample = str.substring(0, 100);
    return /[\u0590-\u05FF]/.test(sample);
}

export function stripTags(html) {
    const div = document.createElement("div");
    div.innerHTML = html.split("</br>").join("\n");
    return div.textContent || div.innerText || "";
}

export function copyToClipboard({ text, successMsg }, makeToast) {
    const htmlBlob = new Blob([text], { type: "text/html" });
    const textBlob = new Blob([stripTags(text)], { type: "text/plain" });
    navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })
    ]).then(() => {
        if(makeToast) makeToast(successMsg || "Copied with formatting!");
    }).catch(err => {
        console.error("Clipboard error:", err);
        if(makeToast) makeToast("Failed to copy!");
    });
}

/**
 * Updates a URL query parameter without a full page reload.
 */
export function updateQueryStringParameter(key, value) {
    const url = new URL(window.location);
    if(value === null || value === undefined) {
         url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
    }
    // Update the browser's address bar
    window.history.replaceState({ path: url.href }, '', url.href);
}

export function getLinkHrefOfEditing() {
    return `&parentSeriesId=${window.series?.id}&returnURL=${location.href}`;
}

export function sanitizeContent(txt) {
    return txt.split("[cup]").join("<b>").split("[/cup]").join("</b>");
}