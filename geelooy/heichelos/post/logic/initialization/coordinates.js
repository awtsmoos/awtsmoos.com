// B"H
/**
 * @module SovereignCoordinates
 * @description Resolves both reader page routes, including the explicit
 * `/post/:postId` shape used by search deep links, without confusing `post`
 * for the post identity.
 */
import { constructSeriesDetailsUrl, constructPostUrl, constructBreadcrumbUrl } from "./constants.js";
import { unrollApiResponse } from "../../comments/logic/unroller.js";
import { purifyAwtsmoosString } from "../../functions/text/Purification.js";

export function parseReaderPath(pathname = location.pathname) {
    const segments = String(pathname).split("/").filter(Boolean);
    const hMarker = segments.indexOf("heichelos");
    const sMarker = segments.indexOf("series");
    const hId = hMarker >= 0 ? decodeURIComponent(segments[hMarker + 1] || "") : "";
    const sId = sMarker >= 0 ? decodeURIComponent(segments[sMarker + 1] || "root") : "root";
    const candidate = segments[sMarker + 2] === "post" ? segments[sMarker + 3] : segments[sMarker + 2];
    return { hId, sId, pCoord: decodeURIComponent(candidate || "0"), explicitPostMarker: segments[sMarker + 2] === "post" };
}

function resolvePost(series, pCoord) {
    if (!Array.isArray(series?.posts)) return { pId: pCoord, pIdx: 0 };
    if (/^\d+$/.test(pCoord) && pCoord.length < 5) {
        const pIdx = Number(pCoord);
        return { pId: series.posts[pIdx], pIdx };
    }
    const pIdx = Math.max(0, series.posts.indexOf(pCoord));
    return { pId: pCoord, pIdx };
}

function canonicalPath({ hId, sId, pIdx }) {
    return `/heichelos/${encodeURIComponent(hId)}/series/${encodeURIComponent(sId)}/${pIdx}${location.search}`;
}

export async function loadInitial() {
    const { hId, sId, pCoord, explicitPostMarker } = parseReaderPath();
    if (!hId) throw new Error("Manifestation Void: Heichel identity is hidden.");
    const sRes = await fetch(constructSeriesDetailsUrl(hId, sId));
    if (!sRes.ok) throw new Error(`Series Gateway Error: ${sRes.status}`);
    const rawSeries = await sRes.json();
    const unrolled = unrollApiResponse(rawSeries);
    const series = Array.isArray(unrolled) ? unrolled[0] : (rawSeries.success || rawSeries);
    const { pId, pIdx } = resolvePost(series, pCoord);
    if (!pId) throw new Error(`Void Rupture: Could not identify Chapter ${pCoord}.`);
    if (explicitPostMarker || pCoord === pId) {
        const cleanPath = canonicalPath({ hId, sId, pIdx });
        history.replaceState({ path: cleanPath }, "", cleanPath);
    }
    if (series?.prateem) {
        series.prateem.name = purifyAwtsmoosString(series.prateem.name);
        series.prateem.description = purifyAwtsmoosString(series.prateem.description);
    }
    const postRes = await fetch(constructPostUrl(hId, sId, pId));
    if (!postRes.ok) throw new Error(`Post Gateway Error: ${postRes.status}`);
    const postData = await postRes.json();
    const post = postData?.success || postData;
    post.id = pId;
    post.title = purifyAwtsmoosString(post.title);
    let breadcrumb = [];
    try {
        const bRes = await fetch(constructBreadcrumbUrl(hId, sId));
        if (bRes.ok) breadcrumb = unrollApiResponse(await bRes.json()).reverse();
    } catch (_) {}
    window.post = post;
    window.series = series;
    window.heichelId = hId;
    window.breadcrumb = breadcrumb;
    window.currentIndexInSeries = pIdx;
    return { post, series, hId, pIdx };
}
