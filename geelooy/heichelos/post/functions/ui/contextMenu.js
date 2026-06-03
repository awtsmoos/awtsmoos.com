// B"H
/**
 * @file contextMenu.js
 * @description
 * Chapter 167: The right-click beast becomes a contained mobile sheet.
 * The old menu used page coordinates and could be clipped by scroll geometry.
 * This version lives in the viewport, clamps itself, and disappears on any
 * outside tap, scroll, resize, escape, or new context-menu invocation.
 */

import { copyToClipboard, updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { makeToast } from "/heichelos/post/functions/ui.js";

const MENU_ID = "custom-context-menu";

function removeExistingMenu() {
    document.getElementById(MENU_ID)?.remove();
}

function compilePostText() {
    if (!window.sectionDayuh || !Array.isArray(window.sectionDayuh)) {
        const postElement = document.getElementById("realPost");
        return postElement ? postElement.innerText : "";
    }
    const postTitle = window.post?.title || "";
    const seriesName = window.series?.prateem?.name || "";
    const header = [seriesName, postTitle].filter(Boolean).join("\n");
    const compiledText = window.sectionDayuh.map(section => {
        if (Array.isArray(section)) return section.flat(Infinity).join("\n");
        return section || "";
    }).join("\n\n");
    return `${header ? `${header}\n\n---\n\n` : ""}${compiledText}`;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function viewportPoint(x, y) {
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    return { x: x > window.innerWidth ? x - scrollX : x, y: y > window.innerHeight ? y - scrollY : y };
}

function closeOnOutside(menu) {
    const close = event => {
        if (event && menu.contains(event.target)) return;
        cleanup();
    };
    const escape = event => {
        if (event.key === "Escape") cleanup();
    };
    const cleanup = () => {
        menu.remove();
        document.removeEventListener("pointerdown", close, true);
        document.removeEventListener("touchstart", close, true);
        document.removeEventListener("keydown", escape, true);
        window.removeEventListener("scroll", cleanup, true);
        window.removeEventListener("resize", cleanup, true);
        window.removeEventListener("orientationchange", cleanup, true);
    };
    setTimeout(() => {
        document.addEventListener("pointerdown", close, true);
        document.addEventListener("touchstart", close, true);
        document.addEventListener("keydown", escape, true);
        window.addEventListener("scroll", cleanup, { passive: true, capture: true });
        window.addEventListener("resize", cleanup, { passive: true, capture: true });
        window.addEventListener("orientationchange", cleanup, { passive: true, capture: true });
    }, 0);
}

function sectionPayload(event) {
    const subSection = event.target.closest(".sub-awtsmoos");
    const mainSection = event.target.closest(".section");
    const idx = mainSection ? mainSection.dataset.awtsmoosIdx : null;
    const sub = subSection ? subSection.dataset.awtsmoosSub : null;
    return { idx, sub, subSection, mainSection };
}

function buildActions(event) {
    const getSelectedText = () => window.getSelection().toString();
    const { idx, sub, subSection, mainSection } = sectionPayload(event);
    const actions = {
        "Fullscreen": () => toggleFullscreen(),
        "Copy Selected": () => copyToClipboard({ text: getSelectedText() }, makeToast),
        "Copy Entire Post": () => copyToClipboard({ text: compilePostText(), successMsg: "Entire Revelation Copied!" }, makeToast)
    };

    if (idx !== null) {
        const sectionType = sub !== null ? "Paragraph" : "Verse";
        actions[`Comment on ${sectionType}`] = async () => {
            updateQueryStringParameter("idx", idx);
            updateQueryStringParameter("sub", sub !== null ? sub : null);
            if (window.openPanelToComments) {
                await window.openPanelToComments();
                if (window.commentLogic?.reloadRoot) await window.commentLogic.reloadRoot();
            }
        };
        actions["View Commentary"] = async () => {
            const inlineModule = await import("/heichelos/post/comments/inline.js");
            await inlineModule.showSectionCommentaryInline(idx, sub, subSection || mainSection);
        };
        actions[`Copy ${sectionType} Content`] = () => {
            const sec = window.sectionDayuh?.[idx];
            let text = Array.isArray(sec) ? sec.join(" ") : sec;
            if (sub !== null && Array.isArray(sec)) text = sec[sub] || text;
            copyToClipboard({ text, successMsg: `Copied ${sectionType}!` }, makeToast);
        };
    }

    if (event.target.tagName === "A") actions["Open Link in New Tab"] = () => open(event.target.href, "_blank")?.focus?.();
    return actions;
}

function placeMenu(menu, x, y) {
    const point = viewportPoint(x, y);
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    const margin = 10;
    const left = clamp(point.x + 8, margin, Math.max(margin, window.innerWidth - rect.width - margin));
    const top = clamp(point.y + 8, margin, Math.max(margin, window.innerHeight - rect.height - margin));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

function renderMenu(x, y, actions) {
    removeExistingMenu();
    const menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Reader actions");

    Object.entries(actions).forEach(([label, action]) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "awtsmoos-context-menu-item";
        item.textContent = label;
        item.addEventListener("click", async event => {
            event.preventDefault();
            event.stopPropagation();
            removeExistingMenu();
            await action();
        });
        menu.appendChild(item);
    });

    placeMenu(menu, x, y);
    closeOnOutside(menu);
}

export async function showCustomContextMenu(x, y, event) {
    removeExistingMenu();
    renderMenu(x, y, buildActions(event));
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
}
