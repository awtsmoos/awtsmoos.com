
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
 * deep into the API using the true ID.
 */

import { 
    constructSeriesDetailsUrl, 
    constructPostUrl, 
    constructBreadcrumbUrl 
} from "./constants.js";
import { unrollApiResponse } from "../../comments/logic/unroller.js";

/**
 * @function loadInitial
 * @description 
 * Anchors the initial spatial reality. 
 * If it finds an "Ugly ID" in the path, it identifies the correct 
 * index and cleans the address bar.
 */
export async function loadInitial() {
    console.log("B\"H - [Coordinates] Initiating Divine Path Resolution.");
    const segments = location.pathname.split("/").filter(Boolean);
    
    let hId = null, sId = "root", pCoord = "0", pIdx = 0, pId = null; 

    // 1. Deciphering the Holy Path
    // Looking for: /heichelos/:heichel/series/:series/:index_or_id
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

    // 2. Reaching into the Archive of the Series
    // We must find the Series Details to translate Chapter -> ID or ID -> Chapter
    let series = null;
    try {
        const sUrl = constructSeriesDetailsUrl(hId, sId);
        const sRes = await fetch(sUrl);
        if (sRes.ok) {
            const rawJson = await sRes.json();
            const unrolled = unrollApiResponse(rawJson);
            series = Array.isArray(unrolled) ? unrolled[0] : (rawJson.success || rawJson);
            
            if (series && Array.isArray(series.posts)) {
                // Determine if the coordinate is an Index or an ID
                if (!isNaN(parseInt(pCoord)) && pCoord.length < 5) {
                    // It is a Chapter Index!
                    pIdx = parseInt(pCoord);
                    pId = series.posts[pIdx];
                } else {
                    // It is a specific Post ID! We find its Chapter Index.
                    pId = pCoord;
                    pIdx = series.posts.indexOf(pId);
                    if (pIdx === -1) pIdx = 0; 

                    // B"H - PURIFICATION RITUAL
                    // The address bar had a messy ID. We switch it back to a holy Index.
                    const cleanPath = `/heichelos/${hId}/series/${sId}/${pIdx}${location.search}`;
                    window.history.replaceState({ path: cleanPath }, '', cleanPath);
                }
            }
        }
    } catch (e) {
        console.error("B\"H - Spatial Discovery Failure:", e);
    }

    if (!pId) throw new Error(`Void Rupture: Could not identify Chapter ${pCoord}.`);

    // 3. Bringing the Revelation (The Post Content) into Physicality
    const postRes = await fetch(constructPostUrl(hId, sId, pId));
    if (!postRes.ok) throw new Error(`Gateway Error: ${postRes.status}`);
    
    let postData = await postRes.json();
    const post = (postData && postData.success) ? postData.success : postData;
    post.id = pId;

    // 4. Weaving the Trail of Light (Breadcrumbs)
    let breadcrumb = [];
    try {
        const bRes = await fetch(constructBreadcrumbUrl(hId, sId));
        if (bRes.ok) {
            breadcrumb = unrollApiResponse(await bRes.json()).reverse();
        }
    } catch (e) {}

    // Global Anchoring in the Application State
    window.post = post;
    window.series = series;
    window.heichelId = hId;
    window.breadcrumb = breadcrumb;
    window.currentIndexInSeries = pIdx;

    console.log(`B"H - spatial awareness established at Chapter ${pIdx}.`);
    return { post, series, hId, pIdx };
}
