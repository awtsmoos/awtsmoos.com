
/**
 * B"H
 * @module BootSequence
 * @chapter The Point of Origin
 * @description
 * This is the Malkhus of the loading process. It brings the potentiality 
 * of the celestial endpoints (API) into the actuality of the DOM. 
 * I am an empty vessel for the Awtsmoos, allowing this function to weave 
 * the text of the post and finally, at the moment of completion, awaken 
 * the inline marginalia.
 * 
 * If the original Hebrew letters of speech were removed from this manifestation, 
 * all existence would revert to the absolute void. Thus, we secure the DOM 
 * before we call upon the marginal Guardians.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { makeNavBars, loadFontSize, scrollToActiveEl } from "../../postFunctions.js";
import { interpretPostDayuh } from "../scribe.js";
import { init as initConduit, indexSwitch } from "../conductor.js";
import { setupUIListeners, setupHighlightingLogic } from "../listeners.js";
import { loadAnnotations } from "../selection.js";
import { setupTabs } from "./tabs.js";
import { awakenInlineSparks } from "./autoInline.js";

/**
 * @method fetchJson
 * @description Safely retrieves Divine Data from the celestial ether.
 * @param {string} url - The endpoint path.
 * @returns {Promise<Object>} - The JSON essence.
 */
async function fetchJson(url) {
    console.log(`B"H - [Initialization] Fetching: ${url}`);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}: Celestial Rupture.`);
    return await r.json();
}

/**
 * @method bootApplication
 * @description 
 * Orchestrates the birth of the Revelation Reader.
 * It fetches the text, weaves the UI, and finally awakens any 
 * inline commentary commanded by the URL Oracle.
 */
export async function bootApplication() {
    console.log("%c B\"H - [Core] Reader Consciousness Awakening", "color: #ccff00; font-weight: 900;");
    const viewport = document.getElementById("realPost");

    try {
        // 1. Gather Initial Coordinates
        const path = location.pathname.split("/").filter(Boolean);
        const hId = decodeURIComponent(path[1]);
        let sId = null, pIdx = null, pId = null;

        if (path.includes("series")) {
            const sIdx = path.indexOf("series");
            sId = decodeURIComponent(path[sIdx + 1]);
            pIdx = parseInt(path[sIdx + 2]);
        }

        // 2. Fetch Divine Context
        const series = await fetchJson(`/api/social/heichelos/${hId}/series/${sId}/details`);
        if (series && Array.isArray(series.posts) && pIdx !== null) {
            pId = series.posts[pIdx];
        }
        
        const post = await fetchJson(`/api/social/heichelos/${hId}/post/${pId}`);
        const bread = await fetchJson(`/api/social/heichelos/${hId}/series/${sId}/breadcrumb`);
        
        // Populate global state vessels
        window.post = post;
        window.series = series;
        window.breadcrumb = bread;

        if (document.querySelector("title")) {
            document.querySelector("title").innerText = `${series.prateem.name} | ${post.title}`;
        }

        // 3. Ownership Verification
        const curAlias = window.curAlias;
        const ownCheck = await fetchJson(`/api/social/alias/${curAlias}/heichelos/${hId}/ownership`);
        window.doesOwn = !!ownCheck.yes;

        if (post) {
            // Enrich post with meta-data
            const hDetails = await getHeichelDetails(hId);
            post.heichel = { id: hId, ...hDetails };
            
            const aDetails = await getAliasName(post.author);
            window.alias = window.aliasDetails = { id: post.author, ...aDetails };

            // 4. Setup Sidebar Gates
            setupTabs(post, series, hId, pIdx);

            // 5. Manifest Content
            if (post.content) {
                const { appendHTML } = await import("../../functions/utils.js");
                appendHTML(post.content, viewport);
            }
            if (post.dayuh) {
                await interpretPostDayuh(post);
            }
            
            // Footer Navigation
            const navHtml = makeNavBars(post, series, pIdx);
            const { appendHTML: append } = await import("../../functions/utils.js");
            append(navHtml, viewport);
            
            // Link conductor logic
            await initConduit({ post, mainParent: document.body, parent: window.commentTab.actual, tab: window.commentTab });
            
            // 6. Interaction Layers
            loadFontSize();
            setupUIListeners();
            setupHighlightingLogic();
            loadAnnotations();
            
            scrollToActiveEl();
            
            // Finalize the DOM structure indices (crucial for inline coordinate mapping)
            await indexSwitch();

            // 7. B"H - THE FIX: Awaken the Guardians of the Margin
            // Now that the 'realPost' is fully populated and indexed, we can safely 
            // draw down the marginalia commanded by the URL.
            await awakenInlineSparks();
        }
    } catch (e) {
        console.error("FATAL B\"H CORE ERROR:", e);
        if (viewport) viewport.innerHTML = `<div class='fatal-error'>SYSTEM RUPTURE: ${e.message}</div>`;
    }
}
