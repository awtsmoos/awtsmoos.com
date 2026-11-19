// B"H
/**
 * @module ProfileDom
 * @description
 * Chapter 62: The Awtsmoos turns JSON blueprints into mobile profile vessels,
 * so UI stays data-shaped instead of scattered across imperative storms.
 */

export function el(tag, options = {}, children = []) {
    const node = document.createElement(tag);
    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = options.text;
    if (options.html !== undefined) node.innerHTML = options.html;
    Object.entries(options.attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    Object.entries(options.on || {}).forEach(([event, handler]) => node.addEventListener(event, handler));
    children.filter(Boolean).forEach(child => node.append(child.nodeType ? child : document.createTextNode(String(child))));
    return node;
}

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'" };

function decodeEntitiesOnce(text) {
    return text.replace(/&(amp|lt|gt|quot|apos);|&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, named, dec, hex) => {
        if (named) return NAMED_ENTITIES[named];
        const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : match;
    });
}

/**
 * B"H 2026-11-19 (social polish): same law as the server cleanText —
 * decode entities once, strip whole tags, keep the plain text. The old
 * version deleted only "<" and ">", so alias descriptions rendered with
 * tag names and hrefs showing ("a href=…Awtsmoos/a").
 */
export function clean(value) {
    return decodeEntitiesOnce(String(value ?? ""))
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<\/?[a-zA-Z][^>]*>/g, "")
        .trim();
}

export function emptyCard(text) {
    return el("article", { className: "profile-empty-card", text });
}
