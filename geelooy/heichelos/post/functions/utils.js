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
            if(!node.innerHTML.includes("var x = /")) {
                eval(node.innerHTML); 
            }
        } catch (error) { 
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
 * @description B"H - THE GALACTIC FONT ENGINE. 
 * Increments set to 50px for immediate transition to the Throne Room scale of Atzilus.
 */
window.adjustFontSize = function(action) {
    const contentArea = document.getElementById('realPost');
    if (!contentArea) return;

    let currentStr = contentArea.style.getPropertyValue('--post-text-size') || 
                     window.getComputedStyle(contentArea).getPropertyValue('--post-text-size') || 
                     '150px';
                     
    let current = parseFloat(currentStr);
    
    const MAX_FONT_SIZE = 2500; // Galactic scale.
    const MIN_FONT_SIZE = 60;
    const FONT_SIZE_INCREMENT = 50; // Galactic leaps

    if (action == 'increase' && current < MAX_FONT_SIZE) {
        current += FONT_SIZE_INCREMENT;
    } else if (action === 'decrease' && current > MIN_FONT_SIZE) {
        current -= FONT_SIZE_INCREMENT;
    }
    
    contentArea.style.setProperty('--post-text-size', current + 'px');
    localStorage.currentPostFontSize = current + 'px';
    
    // Total physical feedback - The Shudder of Reality
    if(navigator.vibrate) navigator.vibrate([50, 20, 50, 20, 100, 50, 200]);
}

export function loadFontSize() {
    const fs = localStorage.currentPostFontSize;
    const contentArea = document.getElementById('realPost');
    if (!contentArea) return;

    if (fs) {
        contentArea.style.setProperty('--post-text-size', fs);
    } else {
        contentArea.style.setProperty('--post-text-size', '150px'); 
    }
}

export function isHebrewWord(word) {
    return /^[א-ת\u0590-\u05FF]+$/.test(word);
}

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
    return `&parentSeriesId=${window.series?.id}&returnURL=${location.href}`;
}

export function sanitizeContent(txt) {
    return txt.split("[cup]").join("<b>").split("[/cup]").join("</b>");
}
