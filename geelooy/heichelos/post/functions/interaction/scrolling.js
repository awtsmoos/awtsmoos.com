// B"H
/**
 * @file scrolling.js
 * @description
 * The coordinate navigator no longer relaxes the whole page. It awakens only
 * the exact verse chunk requested by the URL, then asks the subsection oracle
 * to reveal the exact baby chamber inside that verse. No neighbor chunks are
 * forced merely because a jump happened.
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
    if (sub !== null) return window.__awtsmoosRevealSubsection?.(idx, sub) || section.querySelector(subsectionSelector(sub)) || section;
    return section;
}

async function awakenTargetChunk(idx) {
    const numericIdx = Number.parseInt(idx, 10);
    if (!Number.isFinite(numericIdx)) return;
    try {
        const [{ ScribeScaffold }, scribe] = await Promise.all([
            import("../../logic/scribe/Scaffold.js"),
            import("../../logic/scribe.js")
        ]);
        if (typeof scribe.renderChunk === "function") {
            await scribe.renderChunk(ScribeScaffold.findChunkByItemIndex(numericIdx));
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
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    const top = Math.max(0, y);
    root.scrollTo?.({ top, behavior });
    if (!root.scrollTo) window.scrollTo({ top, behavior });
    if (block === "center") target.scrollIntoView({ behavior, block: "center", inline: "nearest" });
}

function afterLayout(callback) {
    requestAnimationFrame(() => requestAnimationFrame(callback));
}

export async function scrollToActiveEl(options = {}) {
    const { idx, sub } = parseTarget();
    if (idx === null) return null;
    const behavior = options.behavior || "auto";
    const block = options.block || "start";
    const maxRetries = Number.isFinite(options.retries) ? options.retries : 28;

    console.log(`B"H - [Interaction] Targeting coordinates: Verse ${idx}, Sub ${sub}`);
    await awakenTargetChunk(idx);

    return new Promise(resolve => {
        const tryScroll = attempts => {
            const target = findTarget(idx, sub);
            if (target) {
                markTarget(target, sub);
                afterLayout(() => performScroll(target, behavior, block));
                resolve(target);
                return;
            }
            if (attempts >= maxRetries) {
                console.warn("B\"H - Target coordinate was not found after waiting.", { idx, sub });
                resolve(null);
                return;
            }
            setTimeout(() => tryScroll(attempts + 1), 80);
        };
        tryScroll(0);
    });
}
