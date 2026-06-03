//B"H
/**
 * @file utils.js
 * @description
 * Chapter 170: Utility scale mirrors the live Dimensionality gate.
 * Any caller using this utility path receives the same proportional variables:
 * main text is large, inline comment body is near-large, headers and metadata
 * stay small with minimum sizes and gentle growth.
 */

const DEFAULT_FONT_SIZE = 42;
const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 120;
const FONT_STEP = 4;

function readerContext() { return document.querySelector(".post-reader-localized-context") || document.body; }
function cleanSize(value, fallback = DEFAULT_FONT_SIZE) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, parsed));
}
function px(value) { return `${Math.round(value * 100) / 100}px`; }
function bounded(main, ratio, min, max) { return px(Math.min(max, Math.max(min, main * ratio))); }
function scaleVars(size) {
    const main = cleanSize(size);
    return {
        "--post-text-size": px(main),
        "--post-inline-body-size": bounded(main, 0.86, 30, 82),
        "--post-sidebar-comment-size": bounded(main, 0.62, 22, 56),
        "--post-inline-summary-size": bounded(main, 0.18, 13, 23),
        "--post-inline-label-size": bounded(main, 0.16, 13, 22),
        "--post-inline-meta-size": bounded(main, 0.145, 12, 18),
        "--post-ui-chip-size": bounded(main, 0.17, 14, 24)
    };
}
function scaleTargets() { return [document.documentElement, document.body, readerContext(), document.getElementById("realPost")].filter(Boolean); }

export function appendHTML(html, par) {
    if (!par) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    Array.from(doc.body.childNodes).forEach((node, index, array) => appendWithSubChildren(node, par, array));
}

export function appendWithSubChildren(node, parent, array) {
    if (!parent) return;
    if (node.nodeType === 1 && node.tagName === "P" && node.childNodes.length === 1 && node.firstChild?.tagName === "SUP") {
        appendWithSubChildren(node.firstChild, parent, array);
        return;
    }
    if (node.tagName === "SCRIPT" && !node.src) {
        try { if (!node.innerHTML.includes("var x = /")) eval(node.innerHTML); }
        catch (error) { console.warn("B\"H - Script ignition failed in append.", error); }
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

export function applyReaderFontSize(size) {
    const vars = scaleVars(size);
    scaleTargets().forEach(el => Object.entries(vars).forEach(([name, value]) => el.style.setProperty(name, value)));
    localStorage.currentPostFontSize = vars["--post-text-size"];
    window.dispatchEvent(new CustomEvent("awtsmoos:font-size", { detail: { size: vars["--post-text-size"], vars } }));
    return vars["--post-text-size"];
}

export function adjustFontSize(action) {
    const ctx = readerContext();
    const current = cleanSize(ctx.style.getPropertyValue("--post-text-size") || getComputedStyle(ctx).getPropertyValue("--post-text-size"));
    const next = action === "increase" ? current + FONT_STEP : action === "decrease" ? current - FONT_STEP : current;
    return applyReaderFontSize(next);
}

export function loadFontSize() { return applyReaderFontSize(localStorage.currentPostFontSize || DEFAULT_FONT_SIZE); }
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
export function copyToClipboard({ text, successMsg }, makeToast) {
    const htmlBlob = new Blob([text], { type: "text/html" });
    const textBlob = new Blob([stripTags(text)], { type: "text/plain" });
    navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })])
        .then(() => makeToast?.(successMsg || "Copied with formatting!"))
        .catch(error => { console.error("B\"H - Clipboard error:", error); makeToast?.("Failed to copy!"); });
}
export function updateQueryStringParameter(key, value) {
    const url = new URL(window.location);
    if (value === null || value === undefined) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
    window.history.replaceState({ path: url.href }, "", url.href);
}
export function getLinkHrefOfEditing() { return `&parentSeriesId=${window.series?.id}&returnURL=${encodeURIComponent(location.href)}`; }
export function sanitizeContent(txt) { return typeof txt === "string" ? txt.split("[cup]").join("<b>").split("[/cup]").join("</b>") : ""; }
