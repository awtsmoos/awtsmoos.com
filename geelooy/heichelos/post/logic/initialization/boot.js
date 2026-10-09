// B"H
/**
 * @module BootSequence
 * @description
 * Chapter 188: The title crown is born before the virtual river, and the footer
 * gates are appended as real DOM, not parsed string shadows. The boot now uses
 * the canonical URL constructors, so post loading keeps the series context and
 * drinks from the same AwtsmoosDB v3 routes certified by the API stress tests.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { makeNavBars, loadFontSize, scrollToActiveEl } from "../../postFunctions.js";
import { interpretPostDayuh } from "../scribe.js";
import { init as initConduit, indexSwitch } from "../conductor.js";
import { setupUIListeners, setupHighlightingLogic } from "../listeners.js";
import { loadAnnotations } from "../selection.js";
import { setupTabs } from "./tabs.js";
import { awakenInlineSparks } from "./autoInline.js";
import { constructBreadcrumbUrl, constructPostUrl, constructSeriesDetailsUrl } from "./constants.js";

async function fetchJson(url) {
    console.log(`B"H - [Initialization] Fetching: ${url}`);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: Celestial Rupture.`);
    return await response.json();
}

function resolvePathCoordinates() {
    const path = location.pathname.split("/").filter(Boolean);
    const hId = decodeURIComponent(path[1]);
    let sId = null;
    let pIdx = null;
    if (path.includes("series")) {
        const sIdx = path.indexOf("series");
        sId = decodeURIComponent(path[sIdx + 1]);
        pIdx = parseInt(path[sIdx + 2], 10);
    }
    return { hId, sId, pIdx };
}

function appendFooterNavigation(viewport, post, series, pIdx) {
    const nav = makeNavBars(post, series, pIdx);
    if (nav && nav.nodeType) viewport.appendChild(nav);
}

async function hydratePostIdentity(post, hId) {
    const hDetails = await getHeichelDetails(hId);
    post.heichel = { id: hId, ...hDetails };
    const aDetails = await getAliasName(post.author);
    window.alias = window.aliasDetails = { id: post.author, ...aDetails };
}

async function loadPostContext({ hId, sId, pIdx }) {
    const series = await fetchJson(constructSeriesDetailsUrl(hId, sId));
    const pId = Array.isArray(series?.posts) && pIdx !== null ? series.posts[pIdx] : null;
    const post = await fetchJson(constructPostUrl(hId, sId, pId));
    const bread = await fetchJson(constructBreadcrumbUrl(hId, sId));
    return { series, post, bread, pId };
}

async function checkOwnership(hId) {
    const curAlias = window.curAlias;
    if (!curAlias) return false;
    try {
        const ownCheck = await fetchJson(`/api/social/alias/${curAlias}/heichelos/${hId}/ownership`);
        return !!ownCheck.yes;
    } catch (_) {
        return false;
    }
}

/** Orchestrates the birth of the Revelation Reader. */
export async function bootApplication() {
    console.log("%c B\"H - [Core] Reader Consciousness Awakening", "color: #ccff00; font-weight: 900;");
    const viewport = document.getElementById("realPost");

    try {
        const coords = resolvePathCoordinates();
        const { hId, pIdx } = coords;
        const { series, post, bread, pId } = await loadPostContext(coords);
        post.id = post.id || pId;

        window.post = post;
        window.series = series;
        window.breadcrumb = bread;
        window.doesOwn = await checkOwnership(hId);

        if (document.querySelector("title")) {
            document.querySelector("title").innerText = `${series.prateem.name} | ${post.title}`;
        }

        await hydratePostIdentity(post, hId);
        setupTabs(post, series, hId, pIdx);

        if (post.dayuh) await interpretPostDayuh(post);
        else if (post.content) {
            const { appendHTML } = await import("../../functions/utils.js");
            appendHTML(post.content, viewport);
        }

        // B"H — Meluket sefer restructuring: bilingual warm sections for enriched posts.
        // B"H — Sources button must work on ALL posts, not just Meluket.
        try {
            const { awakenMeluketSeferReader, wireSourcesButton } = await import("../scribe/MeluketSeferReader.js");
            const seferResult = awakenMeluketSeferReader(post);
            // Wire Sources button even if Meluket reader didn't activate (non-Meluket posts)
            if (!seferResult) {
                wireSourcesButton(post, null);
            }
            console.log("B\"H meluket sefer reader result:", seferResult, "phrases:", post?.enrichment?.hebrew_phrases?.length);
            // TEMP DEBUG: show result on page
            const dbg = document.createElement('div');
            dbg.id = 'sefer-debug';
            dbg.style.cssText = 'position:fixed;top:0;left:0;background:yellow;color:black;padding:10px;z-index:99999;font-size:16px;';
            dbg.textContent = `Sefer reader result: ${seferResult}, phrases: ${post?.enrichment?.hebrew_phrases?.length}, hasRealPost: ${!!document.getElementById('realPost')}`;
            document.body.appendChild(dbg);
        } catch (seferError) {
            console.error("B\"H meluket sefer reader FAILED", seferError);
            const dbg = document.createElement('div');
            dbg.id = 'sefer-debug-error';
            dbg.style.cssText = 'position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:99999;font-size:16px;';
            dbg.textContent = `Sefer reader ERROR: ${seferError.message}`;
            document.body.appendChild(dbg);
        }

        appendFooterNavigation(viewport, post, series, pIdx);
        await initConduit({ post, mainParent: document.body, parent: window.commentTab.actual, tab: window.commentTab });

        loadFontSize();
        setupUIListeners();
        setupHighlightingLogic();
        loadAnnotations();
        await scrollToActiveEl();
        await indexSwitch();
        await awakenInlineSparks();
    } catch (error) {
        console.error("FATAL B\"H CORE ERROR:", error);
        if (viewport) viewport.innerHTML = `<div class='fatal-error awtsmoos-empty-placeholder'>SYSTEM RUPTURE: ${error.message}</div>`;
    }
}
