// /BH/awtsmoos.com/geelooy/heichelos/post/logic/initialization/coordinates.js
//B"H
import { 
    constructSeriesDetailsUrl, 
    constructPostUrl, 
    constructBreadcrumbUrl 
} from "./constants.js";

/**
 * @method loadInitial
 * @description Anchors the seeker by parsing the URL and trusting the single, sacred data stream.
 */
export async function loadInitial() {
    console.log("B\"H - [Coordinates] Re-anchoring reality to the One True Stream.");
    const segments = location.pathname.split("/").filter(Boolean);
    
    let hId = null, sId = "root", pId = null, pIdx = 0, rawPostSegment = null; 

    // 1. Decipher the coordinates from the URL path, as before.
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

    // 2. Resolve Post ID using the ONE sacred data stream from constants.js
    let series = null;
    if (sId !== "root" && pId === null) {
        try {
            // THE FIX: Use the single, correct, unchanged constant.
            const sUrl = constructSeriesDetailsUrl(hId, sId);
            console.log(`B"H - [Coordinates] Trusting the sacred path to fetch series context: ${sUrl}`);
            const sRes = await fetch(sUrl);
            
            if(sRes.ok) {
                series = await sRes.json();
                console.log("B\"H - [Coordinates] Sacred stream manifested (with posts array):", series);
                
                // If the stream provided the list of posts, resolve the ID from the index.
                if (series && Array.isArray(series.posts)) {
                    if (series.posts.length > pIdx) {
                        pId = series.posts[pIdx];
                        console.log(`B"H - [Coordinates] Index ${pIdx} resolved to TRUE Post ID: ${pId}`);
                    } else {
                        console.warn(`B"H - [Coordinates] Index ${pIdx} is out of bounds for the posts array (length ${series.posts.length}).`);
                    }
                } else {
                    // This is the warning you saw before.
                    console.warn("B\"H - [Coordinates] Series data from sacred path contains no posts array.", series);
                }
            } else {
                console.error(`B"H - [Coordinates] Sacred path fetch failed: ${sRes.status}`);
            }
        } catch(e) { 
            console.warn("B\"H - [Coordinates] A rupture occurred while gathering the sacred series stream:", e); 
        }
    }

    // 3. FALLBACK: Trust the raw segment ONLY if the sacred stream failed to resolve an ID.
    if (!pId && rawPostSegment) {
        console.log(`B"H - [Coordinates] Fallback active: Using segment as literal ID: ${rawPostSegment}`);
        pId = rawPostSegment;
    }

    if(!pId) throw new Error("Post Identifier Void. Cannot anchor Reality.");

    // 4. Manifest the Final Revelation (the Post itself)
    const postUrl = constructPostUrl(hId, sId, pId);
    console.log(`B"H - [Coordinates] Fetching Final Revelation: ${postUrl}`);
    const postRes = await fetch(postUrl);
    if (!postRes.ok) throw new Error(`Gateway Error: ${postRes.statusText} at ${postUrl}`);
    const post = await postRes.json();
    
    if(!post || post.error) throw new Error(post?.error?.message || "Content Void: No post manifest.");

    // 5. Weave the Path of Return (Breadcrumbs)
    let breadcrumb = [];
    try {
        const bUrl = constructBreadcrumbUrl(hId, sId);
        const breadRes = await fetch(bUrl);
        if(breadRes.ok) breadcrumb = (await breadRes.json()).reverse();
    } catch(e){}

    // 6. Register the Global Vessels
    window.post = post;
    window.series = series;
    window.heichelId = hId;
    window.breadcrumb = breadcrumb;
    if(!post.parentSeriesId) post.parentSeriesId = sId;

    return { post, series: window.series, hId, pIdx };
}