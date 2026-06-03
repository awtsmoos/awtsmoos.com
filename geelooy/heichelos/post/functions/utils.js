//B"H
/**
 * @file utils.js
 * @description
 * The Awtsmoos breathes letters into vessels. This chamber keeps the common
 * reader tools small: DOM weaving, readable scale, text purification, clipboard
 * copying, and URL coordinate updates.
 */

const DEFAULT_FONT_SIZE = 42;
const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 120;
const FONT_STEP = 4;

function readerContext() {
    return document.querySelector(".post-reader-localized-context") || document.body;
}

function cleanSize(value, fallback = DEFAULT_FONT_SIZE) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, parsed));
}

/** Manifests raw HTML strings into a parent vessel. */
export function appendHTML(html, par) {
    if (!par) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    Array.from(doc.body.childNodes).forEach((node, index, array) => {
        appendWithSubChildren(node, par, array);
    });
}

/** Recursively weaves nodes, honoring the old toldafy transformer. */
export function appendWithSubChildren(node, parent, array) {
    if (!parent) return;
    if (node.nodeType === 1 && node.tagName === "P" && node.childNodes.length === 1 && node.firstChild?.tagName === "SUP") {
        appendWithSubChildren(node.firstChild, parent, array);
        return;
    }
    if (node.tagName === "SCRIPT" && !node.src) {
        try {
            if (!node.innerHTML.includes("var x = /")) eval(node.innerHTML);
        } catch (error) {
            console.warn("B\"H - Script ignition failed in append.", error);
        }
        return;
    }
    const result = typeof window.toldafy === "function" ? window.toldafy(node, parent, array) : null;
    if (result === "delete") return;
    const newNodes = result?.node ? [result.node] : result?.nodes ? Array.from(result.nodes) : [node.cloneNode(false)];
    newNodes.forEach(newNode => {
        if (result?.action?.appendFirst) newNode.appendChild(result.action.appendFirst);
        parent.appendChild(newNode);
        Array.from(node.childNodes || []).forEach(child => appendWithSubChildren(child, newNode, array));
    });
}

/** Applies the reader scale everywhere the live CSS may read it. */
export function applyReaderFontSize(size) {
    const px = `${cleanSize(size)}px`;
    const ctx = readerContext();
    [document.documentElement, document.body, ctx, document.getElementById("realPost")]
        .filter(Boolean)
        .forEach(el => el.style.setProperty("--post-text-size", px));
    localStorage.currentPostFontSize = px;
    window.dispatchEvent(new CustomEvent("awtsmoos:font-size", { detail: { size: px } }));
    return px;
}

/** Enlarges or reduces the holy letters. */
export function adjustFontSize(action) {
    const ctx = readerContext();
    const current = cleanSize(ctx.style.getPropertyValue("--post-text-size") || getComputedStyle(ctx).getPropertyValue("--post-text-size"));
    const next = action === "increase" ? current + FONT_STEP : action === "decrease" ? current - FONT_STEP : current;
    return applyReaderFontSize(next);
}

/** Loads the reader scale from memory. */
export function loadFontSize() {
    return applyReaderFontSize(localStorage.currentPostFontSize || DEFAULT_FONT_SIZE);
}

export function isHebrewWord(word) { return /^[א-ת\u0590-\u05FF]+$/.test(word); }
export function isFirstCharacterHebrew(str) {
    const match = String(str || "").match(/[\S]/);
    if (!match) return false;
    const code = match[0].charCodeAt(0);
    return code >= 0x0590 && code <= 0x05FF;
}
export function containsHebrew(str) { return /[\u0590-\u05FF]/.test(String(str || "")); }

export function stripTags(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = String(html).split("</br>").join("\n").replace(/<br\s*\/?>/gi, "\n");
    return div.textContent || div.innerText || "";
}

/** Copies rich and plain text when the browser permits it. */
export function copyToClipboard({ text, successMsg }, makeToast) {
    const htmlBlob = new Blob([text], { type: "text/html" });
    const textBlob = new Blob([stripTags(text)], { type: "text/plain" });
    navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })])
        .then(() => makeToast?.(successMsg || "Copied with formatting!"))
        .catch(error => {
            console.error("B\"H - Clipboard error:", error);
            makeToast?.("Failed to copy!");
        });
}

export function updateQueryStringParameter(key, value) {
    const url = new URL(window.location);
    if (value === null || value === undefined) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
    window.history.replaceState({ path: url.href }, "", url.href);
}

export function getLinkHrefOfEditing() {
    return `&parentSeriesId=${window.series?.id}&returnURL=${encodeURIComponent(location.href)}`;
}

export function sanitizeContent(txt) {
    return typeof txt === "string" ? txt.split("[cup]").join("<b>").split("[/cup]").join("</b>") : "";
}
