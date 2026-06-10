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

export function clean(value) {
    return String(value ?? "").replace(/[<>]/g, "").trim();
}

export function emptyCard(text) {
    return el("article", { className: "profile-empty-card", text });
}
