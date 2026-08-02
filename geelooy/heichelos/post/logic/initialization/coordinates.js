// B"H
/**
 * @module SovereignCoordinates
 * @description
 * Resolves the explicit `/post/:postId` route and the historical shorthand
 * route without confusing `post` for an identity. The root series remains a
 * full series context, and the cache-busted route covenant prevents old mobile
 * browsers from retaining the former root-series rupture.
 */
import {
	constructSeriesDetailsUrl,
	constructPostUrl,
	constructBreadcrumbUrl,
} from "./constants.js?v=root-series-context-001";
import { unrollApiResponse } from "../../comments/logic/unroller.js";
import { purifyAwtsmoosString } from "../../functions/text/Purification.js";

/**
 * Parses a public reader pathname into contextual identities.
 *
 * @param {string} pathname - The pathname to parse.
 * @returns {{hId: string, sId: string, pCoord: string, explicitPostMarker: boolean}}
 */
export function parseReaderPath(pathname = location.pathname) {
	const segments = String(pathname).split("/").filter(Boolean);
	const heichelMarker = segments.indexOf("heichelos");
	const seriesMarker = segments.indexOf("series");
	const hId = heichelMarker >= 0
		? decodeURIComponent(segments[heichelMarker + 1] || "")
		: "";
	const sId = seriesMarker >= 0
		? decodeURIComponent(segments[seriesMarker + 1] || "root")
		: "root";
	const explicitPostMarker = segments[seriesMarker + 2] === "post";
	const candidate = explicitPostMarker
		? segments[seriesMarker + 3]
		: segments[seriesMarker + 2];
	return {
		hId,
		sId,
		pCoord: decodeURIComponent(candidate || "0"),
		explicitPostMarker,
	};
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

function canonicalPath({ hId, sId, pId }) {
	return `/heichelos/${encodeURIComponent(hId)}/series/${encodeURIComponent(sId)}/post/${encodeURIComponent(pId)}${location.search}${location.hash}`;
}

/** Loads and publishes the complete reader context. */
export async function loadInitial() {
	const { hId, sId, pCoord, explicitPostMarker } = parseReaderPath();
	if (!hId) throw new Error("Manifestation Void: Heichel identity is hidden.");
	const seriesResponse = await fetch(constructSeriesDetailsUrl(hId, sId));
	if (!seriesResponse.ok) throw new Error(`Series Gateway Error: ${seriesResponse.status}`);
	const rawSeries = await seriesResponse.json();
	const unrolled = unrollApiResponse(rawSeries);
	const series = Array.isArray(unrolled) ? unrolled[0] : (rawSeries.success || rawSeries);
	const { pId, pIdx } = resolvePost(series, pCoord);
	if (!pId) throw new Error(`Void Rupture: Could not identify Chapter ${pCoord}.`);
	if (!explicitPostMarker || pCoord !== pId) {
		const cleanPath = canonicalPath({ hId, sId, pId });
		history.replaceState({ path: cleanPath }, "", cleanPath);
	}
	if (series?.prateem) {
		series.prateem.name = purifyAwtsmoosString(series.prateem.name);
		series.prateem.description = purifyAwtsmoosString(series.prateem.description);
	}
	const postResponse = await fetch(constructPostUrl(hId, sId, pId));
	if (!postResponse.ok) throw new Error(`Post Gateway Error: ${postResponse.status}`);
	const postData = await postResponse.json();
	const post = postData?.success || postData;
	post.id = pId;
	post.title = purifyAwtsmoosString(post.title);
	let breadcrumb = [];
	try {
		const breadcrumbResponse = await fetch(constructBreadcrumbUrl(hId, sId));
		if (breadcrumbResponse.ok) {
			breadcrumb = unrollApiResponse(await breadcrumbResponse.json()).reverse();
		}
	} catch (_) {}
	window.post = post;
	window.series = series;
	window.heichelId = hId;
	window.breadcrumb = breadcrumb;
	window.currentIndexInSeries = pIdx;
	return { post, series, hId, pIdx };
}
