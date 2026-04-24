
/**
 * B"H
 * @module Coordinates
 * @description 
 * Defines the seeker's location in the spiritual mapping of the Heichel.
 */
import { 
    constructSeriesDetailsUrl, 
    constructPostUrl, 
    constructBreadcrumbUrl 
} from "./constants.js";

export async function loadInitial() {
    console.log("B\"H - [Coordinates] Initiating spatial awareness.");
    const segments = location.pathname.split("/").filter(Boolean);
    
    let hId = null, sId = "root", pId = null, pIdx = 0, rawPostSegment = null; 

    // Extracting coordinates from the URL path
    for(let i=0; i<segments.length; i++) {
        const seg = segments[i];
        if (seg === "heichelos" && segments[i+1]) hId = decodeURIComponent(segments[i+1]);
        if (seg === "series" && segments[i+1]) {
            sId = decodeURIComponent(segments[i+1]);
            if (segments[i+2]) {
                rawPostSegment = decodeURIComponent(segments[i+2]);
                if (!isNaN(parseInt(rawPostSegment))) pIdx = parseInt(rawPostSegment);
            }
        }
        if (seg === "post" && segments[i+1]) pId = decodeURIComponent(segments[i+1]);
    }

    if (!hId) throw new Error("Coordinate Rupture: Heichel ID missing.");

    let series = null;
    if (sId !== "root" && pId === null) {
        const sUrl = constructSeriesDetailsUrl(hId, sId);
        const sRes = await fetch(sUrl);
        if(sRes.ok) {
            series = await sRes.json();
            if (series?.posts && series.posts[pIdx]) {
                pId = series.posts[pIdx];
            }
        }
    }

    if (!pId && rawPostSegment) pId = rawPostSegment;
    if (!pId) throw new Error("Post Void. The Scribe cannot find the page.");

    const postUrl = constructPostUrl(hId, sId, pId);
    const postRes = await fetch(postUrl);
    if (!postRes.ok) throw new Error(`Gateway Severed: ${postRes.status}`);
    const post = await postRes.json();
    
    // Weave the Path of Return
    let breadcrumb = [];
    try {
        const bUrl = constructBreadcrumbUrl(hId, sId);
        const breadRes = await fetch(bUrl);
        if(breadRes.ok) breadcrumb = (await breadRes.json()).reverse();
    } catch(e){}

    // Set Global State
    window.post = post;
    window.series = series;
    window.heichelId = hId;
    window.breadcrumb = breadcrumb;

    return { post, series, hId, pIdx };
}
