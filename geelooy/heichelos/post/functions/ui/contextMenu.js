// B"H
/**
 * @file contextMenu.js
 * @description
 * Chapter 248: The menu stops being a shattered row of teeth.
 *
 * A reader touch summons one sovereign sheet. On phones it rises from the
 * bottom like a black-gold ark; on larger screens it clamps near the finger.
 * The actions remain data-driven and the menu closes on outside intent without
 * stealing the scroll river.
 */

import { copyToClipboard, updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { makeToast } from "/heichelos/post/functions/ui.js";

const MENU_ID = "custom-context-menu";
const MOBILE_QUERY = "(max-width: 760px)";

const removeExistingMenu = () => document.getElementById(MENU_ID)?.remove();
const selectedText = () => String(window.getSelection?.().toString?.() || "");

function compilePostText() {
    const title = window.post?.title || "";
    const series = window.series?.prateem?.name || "";
    const header = [series, title].filter(Boolean).join("\n");
    const source = Array.isArray(window.sectionDayuh) ? window.sectionDayuh : [];
    const body = source.map(section => Array.isArray(section) ? section.flat(Infinity).join("\n") : section || "").join("\n\n");
    if (body.trim()) return `${header ? `${header}\n\n---\n\n` : ""}${body}`;
    return document.getElementById("realPost")?.innerText || "";
}

function sectionPayload(event) {
    const target = event?.target || document.body;
    const subSection = target.closest?.(".sub-awtsmoos") || null;
    const mainSection = target.closest?.(".section") || null;
    return {
        idx: mainSection?.dataset?.awtsmoosIdx ?? null,
        sub: subSection?.dataset?.awtsmoosSub ?? null,
        subSection,
        mainSection
    };
}

function sectionText(idx, sub) {
    const sec = window.sectionDayuh?.[idx];
    if (sub !== null && Array.isArray(sec)) return sec[sub] || sec.join("\n");
    return Array.isArray(sec) ? sec.join("\n") : sec || "";
}

async function openCommentTarget(idx, sub) {
    updateQueryStringParameter("idx", idx);
    updateQueryStringParameter("sub", sub !== null ? sub : null);
    if (window.openPanelToComments) await window.openPanelToComments();
    if (window.commentLogic?.reloadRoot) await window.commentLogic.reloadRoot();
}

async function showCommentary(idx, sub, target) {
    const inlineModule = await import("/heichelos/post/comments/inline.js");
    await inlineModule.showSectionCommentaryInline(idx, sub, target);
}

function actionBlueprints(event) {
    const { idx, sub, subSection, mainSection } = sectionPayload(event);
    const blueprints = [
        ["Fullscreen", "⛶", () => toggleFullscreen()],
        ["Copy Selected", "⧉", () => copyToClipboard({ text: selectedText() }, makeToast)],
        ["Copy Entire Post", "◎", () => copyToClipboard({ text: compilePostText(), successMsg: "Entire Revelation Copied!" }, makeToast)]
    ];
    if (idx !== null) {
        const type = sub !== null ? "Paragraph" : "Verse";
        blueprints.push(
            [`Comment on ${type}`, "✦", () => openCommentTarget(idx, sub)],
            ["View Commentary", "☷", () => showCommentary(idx, sub, subSection || mainSection)],
            [`Copy ${type} Content`, "✧", () => copyToClipboard({ text: sectionText(idx, sub), successMsg: `Copied ${type}!` }, makeToast)]
        );
    }
    if (event?.target?.tagName === "A") blueprints.push(["Open Link", "↗", () => open(event.target.href, "_blank")?.focus?.()]);
    return blueprints.map(([label, icon, action]) => ({ label, icon, action }));
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function placeDesktop(menu, x, y) {
    menu.classList.remove("awtsmoos-mobile-sheet");
    menu.style.left = "0px";
    menu.style.top = "0px";
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    const margin = 12;
    menu.style.left = `${clamp(x + 10, margin, window.innerWidth - rect.width - margin)}px`;
    menu.style.top = `${clamp(y + 10, margin, window.innerHeight - rect.height - margin)}px`;
}

function placeMenu(menu, x, y) {
    const isMobile = window.matchMedia?.(MOBILE_QUERY)?.matches;
    if (isMobile) {
        menu.classList.add("awtsmoos-mobile-sheet");
        document.body.appendChild(menu);
        return;
    }
    placeDesktop(menu, x, y);
}

function bindClose(menu) {
    const cleanup = () => {
        menu.remove();
        document.removeEventListener("pointerdown", outside, true);
        document.removeEventListener("keydown", key, true);
        window.removeEventListener("resize", cleanup, true);
        window.removeEventListener("orientationchange", cleanup, true);
    };
    const outside = event => { if (!menu.contains(event.target)) cleanup(); };
    const key = event => { if (event.key === "Escape") cleanup(); };
    setTimeout(() => {
        document.addEventListener("pointerdown", outside, true);
        document.addEventListener("keydown", key, true);
        window.addEventListener("resize", cleanup, { passive: true, capture: true });
        window.addEventListener("orientationchange", cleanup, { passive: true, capture: true });
    }, 0);
}

function renderMenu(x, y, actions) {
    removeExistingMenu();
    const menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.className = "awtsmoos-reader-action-sheet";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Reader actions");

    const crown = document.createElement("div");
    crown.className = "awtsmoos-context-crown";
    crown.textContent = "Reader Actions";
    menu.appendChild(crown);

    actions.forEach(({ label, icon, action }) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "awtsmoos-context-menu-item";
        item.innerHTML = `<span class="awtsmoos-context-icon">${icon}</span><span>${label}</span>`;
        item.addEventListener("click", async clickEvent => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            removeExistingMenu();
            await action();
        });
        menu.appendChild(item);
    });

    placeMenu(menu, x, y);
    bindClose(menu);
}

export async function showCustomContextMenu(x, y, event) {
    renderMenu(x, y, actionBlueprints(event));
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
}
