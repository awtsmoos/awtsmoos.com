
/**
 * B"H
 * @module SovereignCoordinates
 * @chapter Resolving the Chapter and the Verse
 * @description
 * Every spark of creation has a Root and a Branch. 
 * The Root is the Internal ID; the Branch is the Chapter Index.
 * 
 * This module ensures the seeker's Path (URL) remains simple 
 * and chapter-based, while the Chariot's Logic (fetch) reaches 
 * deep into the API using the true ID. It also purifies the incoming names.
 */

import { 
    constructSeriesDetailsUrl, 
    constructPostUrl, 
    constructBreadcrumbUrl 
} from "./constants.js";
import { unrollApiResponse } from "../../comments/logic/unroller.js";
import { purifyAwtsmoosString } from "../../functions/text/Purification.js";

/**
 * @function loadInitial
 * @description 
 * Anchors the initial spatial reality. 
 * Identifies coordinates, purifies names, and locks the state.
 */
export async function loadInitial() {
    console.log("B\"H - [Coordinates] Initiating Divine Path Resolution.");
    const segments = location.pathname.split("/").filter(Boolean);
    
    let hId = null, sId = "root", pCoord = "0", pIdx = 0, pId = null; 

    const hMarker = segments.indexOf("heichelos");
    if (hMarker !== -1 && segments[hMarker + 1]) {
        hId = decodeURIComponent(segments[hMarker + 1]);
        const sMarker = segments.indexOf("series");
        if (sMarker !== -1 && segments[sMarker + 1]) {
            sId = decodeURIComponent(segments[sMarker + 1]);
            pCoord = segments[sMarker + 2] || "0";
        }
    }

    if (!hId) throw new Error("Manifestation Void: Heichel identity is hidden.");

    let series = null;
    try {
        const sUrl = constructSeriesDetailsUrl(hId, sId);
        const sRes = await fetch(sUrl);
        if (sRes.ok) {
            const rawJson = await sRes.json();
            const unrolled = unrollApiResponse(rawJson);
            series = Array.isArray(unrolled) ? unrolled[0] : (rawJson.success || rawJson);
            
            if (series && Array.isArray(series.posts)) {
                if (!isNaN(parseInt(pCoord)) && pCoord.length < 5) {
                    pIdx = parseInt(pCoord);
                    pId = series.posts[pIdx];
                } else {
                    pId = pCoord;
                    pIdx = series.posts.indexOf(pId);
                    if (pIdx === -1) pIdx = 0; 

                    const cleanPath = `/heichelos/${hId}/series/${sId}/${pIdx}${location.search}`;
                    window.history.replaceState({ path: cleanPath }, '', cleanPath);
                }
            }

            // B"H - Purify the Series Identity
            if (series?.prateem) {
                series.prateem.name = purifyAwtsmoosString(series.prateem.name);
                series.prateem.description = purifyAwtsmoosString(series.prateem.description);
            }
        }
    } catch (e) {
        console.error("B\"H - Spatial Discovery Failure:", e);
    }

    if (!pId) throw new Error(`Void Rupture: Could not identify Chapter ${pCoord}.`);

    const postRes = await fetch(constructPostUrl(hId, sId, pId));
    if (!postRes.ok) throw new Error(`Gateway Error: ${postRes.status}`);
    
    let postData = await postRes.json();
    const post = (postData && postData.success) ? postData.success : postData;
    post.id = pId;

    // B"H - Purify the Post Identity
    post.title = purifyAwtsmoosString(post.title);

    let breadcrumb =[];
    try {
        const bRes = await fetch(constructBreadcrumbUrl(hId, sId));
        if (bRes.ok) {
            breadcrumb = unrollApiResponse(await bRes.json()).reverse();
            // Purify breadcrumb trail names
            breadcrumb.forEach(crumb => {
                if (crumb.prateem) crumb.prateem.name = purifyAwtsmoosString(crumb.prateem.name);
                if (crumb.name) crumb.name = purifyAwtsmoosString(crumb.name);
            });
        }
    } catch (e) {}

    window.post = post;
    window.series = series;
    window.heichelId = hId;
    window.breadcrumb = breadcrumb;
    window.currentIndexInSeries = pIdx;

    console.log(`B"H - Spatial awareness established at Chapter ${pIdx}.`);
    return { post, series, hId, pIdx };
}
