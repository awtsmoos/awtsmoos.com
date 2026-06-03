// /BH/awtsmoos.com/geelooy/heichelos/post/functions/interaction/scrolling.js
//B"H
/**
 * @file scrolling.js
 * @description
 * The Navigator of Coordinates. On refresh it awakens the needed virtual chunk,
 * finds the exact verse/subsection through every known URL dialect, and settles
 * it beneath the fixed header after layout has finished breathing.
 */

function firstParam(params, names) {
    for (const name of names) {
        const value = params.get(name);
        if (value !== null && value !== undefined && value !== "") return value;
    }
    return null;
}

function normalizedSub(value) {
    if (value === null || value === undefined || value === "" || value === "null" || value === "root") return null;
    return value;
}

function parseTarget() {
    const params = new URLSearchParams(location.search);
    return {
        idx: firstParam(params, ["idx", "verse", "verseIndex", "section", "sectionIndex"]),
        sub: normalizedSub(firstParam(params, ["sub", "subsection", "subSection", "subIdx", "paragraph", "para"]))
    };
}

function escapeValue(value) {
    return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/"/g, "\\\"");
}

function sectionSelector(idx) {
    const safe = escapeValue(idx);
    return [
        `.section[data-awtsmoos-idx="${safe}"]`,
        `.section[data-idx="${safe}"]`,
        `[data-awtsmoos-idx="${safe}"].section`,
        `[data-idx="${safe}"].section`
    ].join(",");
}

function subsectionSelector(sub) {
    const safe = escapeValue(sub);
    return [
        `.sub-awtsmoos[data-awtsmoos-sub="${safe}"]`,
        `.sub-awtsmoos[data-sub-section="${safe}"]`,
        `.sub-awtsmoos[data-sub="${safe}"]`,
        `.sub-awtsmoos[data-idx="${safe}"]`
    ].join(",");
}

function findTarget(idx, sub) {
    const section = document.querySelector(sectionSelector(idx));
    if (!section) return null;
    if (sub !== null) return section.querySelector(subsectionSelector(sub)) || section;
    return section;
}

async function awakenTargetChunk(idx) {
    const numericIdx = Number.parseInt(idx, 10);
    if (!Number.isFinite(numericIdx)) return;
    try {
        const scribe = await import("../../logic/scribe.js");
        if (typeof scribe.renderChunk === "function") {
            const chunkId = Math.floor(numericIdx / 12);
            await scribe.renderChunk(chunkId);
            await scribe.renderChunk(chunkId + 1);
            if (chunkId > 0) await scribe.renderChunk(chunkId - 1);
        }
    } catch (error) {
        console.warn("B\"H - Target chunk awakening deferred.", error);
    }
}

function markTarget(target, sub) {
    document.querySelectorAll(".active-reading-section, .active-reading-sub, .awtsmoos-refresh-target").forEach(el => {
        el.classList.remove("active-reading-section", "active-reading-sub", "awtsmoos-refresh-target");
    });
    const isSub = sub !== null && target.classList.contains("sub-awtsmoos");
    target.classList.add(isSub ? "active-reading-sub" : "active-reading-section");
    target.classList.add("awtsmoos-refresh-target");
    target.closest(".section")?.classList.add("active-reading-section");
    setTimeout(() => target.classList.remove("awtsmoos-refresh-target"), 2200);
}

function scrollRoot() {
    return document.scrollingElement || document.documentElement || document.body;
}

function headerOffset() {
    const fixedHeader = document.querySelector(".awtsmoos-integrated-header")?.getBoundingClientRect().height || 0;
    const topChrome = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--awt-header-space")) || 0;
    return Math.max(18, fixedHeader, topChrome) + 18;
}

function performScroll(target, behavior = "auto", block = "start") {
    const root = scrollRoot();
    const rect = target.getBoundingClientRect();
    const y = rect.top + window.pageYOffset - headerOffset();
    root.scrollTo?.({ top: Math.max(0, y), behavior });
    if (!root.scrollTo) window.scrollTo({ top: Math.max(0, y), behavior });
    if (block === "center") target.scrollIntoView({ behavior, block: "center", inline: "nearest" });
}

function afterLayout(callback) {
    requestAnimationFrame(() => requestAnimationFrame(callback));
}

/**
 * Scrolls to the URL coordinate.
 * @param {{behavior?:ScrollBehavior,block?:ScrollLogicalPosition,retries?:number,settle?:boolean}} options Scroll options.
 * @returns {Promise<Element|null>} The target element, if found.
 */
export async function scrollToActiveEl(options = {}) {
    const { idx, sub } = parseTarget();
    if (idx === null) return null;
    const behavior = options.behavior || "auto";
    const block = options.block || "start";
    const maxRetries = Number.isFinite(options.retries) ? options.retries : 48;

    console.log(`B"H - [Interaction] Targeting coordinates: Verse ${idx}, Sub ${sub}`);
    await awakenTargetChunk(idx);

    return new Promise(resolve => {
        const tryScroll = attempts => {
            const target = findTarget(idx, sub);
            if (target) {
                markTarget(target, sub);
                afterLayout(() => {
                    performScroll(target, behavior, block);
                    if (options.settle !== false) {
                        setTimeout(() => performScroll(target, "auto", block), 220);
                        setTimeout(() => performScroll(target, "auto", block), 850);
                    }
                });
                resolve(target);
                return;
            }
            if (attempts >= maxRetries) {
                console.warn("B\"H - Target coordinate was not found after waiting.", { idx, sub });
                resolve(null);
                return;
            }
            setTimeout(() => tryScroll(attempts + 1), 100);
        };
        tryScroll(0);
    });
}
