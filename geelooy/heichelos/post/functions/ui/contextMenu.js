// B"H
/**
 * @file contextMenu.js
 * @description
 * Chapter 250: The full-post copy becomes one simple breath.
 *
 * No post id. No section numbers. No sub-section coordinates. Only the series
 * name, the post name, and then the complete body gathered from the live data
 * in one smooth scroll, as the Awtsmoos unifies every fragment without labels.
 */

import { copyToClipboard, stripTags, updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { makeToast } from "/heichelos/post/functions/ui.js";

const MENU_ID = "custom-context-menu";
const MOBILE_QUERY = "(max-width: 760px)";

const removeExistingMenu = () => document.getElementById(MENU_ID)?.remove();
const selectedText = () => String(window.getSelection?.().toString?.() || "");
const asText = value => stripTags(String(value ?? "")).replace(/\n{3,}/g, "\n\n").trim();

function dataSections() {
    if (Array.isArray(window.sectionDayuh)) return window.sectionDayuh;
    if (Array.isArray(window.post?.dayuh?.sections)) return window.post.dayuh.sections;
    if (Array.isArray(window.post?.sections)) return window.post.sections;
    return [];
}

function flattenSection(section) {
    if (Array.isArray(section)) return section.flat(Infinity).map(asText).filter(Boolean);
    const text = asText(section?.text ?? section?.content ?? section);
    return text ? [text] : [];
}

function compilePostText() {
    const title = asText(window.post?.title || window.post?.name || "");
    const series = asText(window.series?.prateem?.name || window.series?.name || "");
    const header = [series, title].filter(Boolean).join("\n");
    const body = dataSections().flatMap(flattenSection).filter(Boolean).join("\n\n");
    if (body.trim()) return `${header ? `${header}\n\n` : ""}${body}`;
    return [header, asText(document.getElementById("realPost")?.innerText || "")]
        .filter(Boolean)
        .join("\n\n");
}

function sectionPayload(event) {
    const target = event?.target || document.body;
    const subSection = target.closest?.(".sub-awtsmoos") || null;
    const mainSection = target.closest?.(".section") || null;
    return { idx: mainSection?.dataset?.awtsmoosIdx ?? null, sub: subSection?.dataset?.awtsmoosSub ?? null, subSection, mainSection };
}

function sectionText(idx, sub) {
    const sec = dataSections()?.[idx];
    const lines = flattenSection(sec);
    if (sub !== null && lines[sub]) return lines[sub];
    return lines.join("\n");
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

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
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

export async function showCustomContextMenu(x, y, event) { renderMenu(x, y, actionBlueprints(event)); }
function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
}
