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
