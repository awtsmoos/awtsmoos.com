//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a single archive of the Rebbe's voice be searched by
 * hand in the app and by agents through this API, from one shared index;
 * Awtsmoos.com mounts search, event tracks, bundles and docs beneath
 * /api/rebbe without touching the front end that already browses it.
 */

const { MONTHS, yearList } = require("./lib/catalog.js");
const { tracksForEvent } = require("./lib/archive.js");
const { normalizeQuery, searchEvents, serializeEvent } = require("./lib/search.js");
const { createBundleId, buildManifest, bundleLinks } = require("./lib/bundle.js");
const { bundlePage, docsPage } = require("./lib/page.js");
const { API_VERSION, applyPublicHeaders, runJson, errorResponse } = require("./lib/response.js");

const BASE = "/api/rebbe";

/** JSON descriptor so any agent can discover this API from its root. */
function descriptor() {
	return {
		name: "Awtsmoos Rebbe Sichos Search API",
		version: API_VERSION,
		description: "Search the Rebbe archive (Archive.org) by Hebrew month/day/year with ranges and keyword; expand events into downloadable audio tracks; create bundle links to hand to end users \u2014 the bundle page is the download link: ZIP and merged MP3 are all assembled in the user's browser from the original Archive.org files, and the server never downloads the audio.",
		frontend: "/apps/rebbe/",
		endpoints: {
			"GET /api/rebbe/search": "Params: month(s), monthFrom/monthTo, day(s), dayFrom/dayTo, year(s), yearFrom/yearTo, q, limit (1-200, default 50), offset, include=tracks. Returns {total,count,limit,offset,hasMore,results}.",
			"GET /api/rebbe/event": "Params: bucket (Archive.org item) or year, plus folder. Returns the event and its tracks with downloadUrl, size, duration, md5.",
			"GET|POST /api/rebbe/bundle": "Same search params + optional title. Returns {bundleId,pageUrl,zipUrl,mergeUrl,manifestUrl,eventCount,trackCount,totalBytes,truncated}.",
			"GET /api/rebbe/bundle/data": "?id= — full bundle manifest JSON (events, files, totals).",
			"GET /api/rebbe/bundle/page": "?id= — human bundle page; ZIP and merged MP3 are assembled in the browser from the original files. &action=merge|zip focuses that action.",
			"GET /api/rebbe/bundle/zip": "?id= \u2014 legacy link: 302 redirect to the bundle page, which assembles the ZIP in the user's browser. The server does no downloading.",
			"GET /api/rebbe/bundle/merge": "?id= \u2014 legacy link: 302 redirect to the bundle page with action=merge, which assembles the merged MP3 in the user's browser. The server does no downloading.",
			"GET /api/rebbe/options": "Years, months and days known to the archive.",
			"GET /api/rebbe/health": "Health check.",
			"GET /api/rebbe/docs": "Human documentation page."
		},
		months: MONTHS,
		example: `${BASE}/search?month=3&day=19`
	};
}

/** Paginated search service. */
async function searchService(params) {
	const request = normalizeQuery(params);
	const all = await searchEvents(request);
	const page = all.slice(request.offset, request.offset + request.limit);
	const results = [];
	for (const event of page) {
		const record = serializeEvent(event, BASE);
		if (request.includeTracks) {
			const tracks = await tracksForEvent(event);
			record.trackCount = tracks.length;
			record.totalBytes = tracks.reduce((s, t) => s + (t.size || 0), 0);
			record.tracks = tracks;
		}
		results.push(record);
	}
	return {
		query: { years: request.years, months: request.months, days: request.days, keyword: request.keyword },
		total: all.length,
		count: results.length,
		limit: request.limit,
		offset: request.offset,
		hasMore: request.offset + results.length < all.length,
		results
	};
}

/** Single-event track expansion service. */
async function eventService(params) {
	const { itemForYear } = require("./lib/catalog.js");
	const bucket = params.bucket || itemForYear(params.year || "");
	const folder = params.folder || "";
	if (!bucket || !folder) {
		const err = new Error("Required: folder, plus bucket (Archive.org item id) or year.");
		err.status = 400;
		err.code = "MISSING_EVENT_IDENTITY";
		throw err;
	}
	const year = Number(String(bucket).split("-")[0]) || Number(params.year) || null;
	const event = { bucket, folder, year, title: null };
	const tracks = await tracksForEvent(event);
	return {
		event: {
			id: `${bucket}::${folder}`,
			folder,
			archiveItem: bucket,
			year,
			archiveUrl: `https://archive.org/details/${bucket}`,
			trackCount: tracks.length,
			totalBytes: tracks.reduce((s, t) => s + (t.size || 0), 0),
			tracks
		}
	};
}

/** Bundle creation service: id + links + honest totals. */
async function bundleService(params) {
	const { id, request } = createBundleId(params, params.title);
	const manifest = await buildManifest(id, BASE);
	return {
		bundleId: id,
		title: manifest.title,
		query: { years: request.years, months: request.months, days: request.days, keyword: request.keyword },
		eventCount: manifest.eventCount,
		totalEvents: manifest.totalEvents,
		truncated: manifest.truncated,
		trackCount: manifest.trackCount,
		totalBytes: manifest.totalBytes,
		totalDurationSeconds: manifest.totalDurationSeconds,
		...bundleLinks(id, BASE)
	};
}

/**
 * Legacy download routes: the server does NO heavy work (Hai's ruling,
 * 2026-11-26). /bundle/zip and /bundle/merge only 302-redirect to the
 * bundle page, whose browser code fetches the tracks straight from
 * Archive.org and assembles the ZIP / merged MP3 on the
 * user's own device. The endpoints stay mounted so every link already
 * handed out keeps working.
 */
function pageRedirectRoute(info, action) {
	applyPublicHeaders(info, 0);
	const id = (info.$_GET || {}).id || "";
	const query = id ? `?id=${encodeURIComponent(id)}${action ? `&action=${action}` : ""}` : "";
	const target = `${BASE}/bundle/page${query}`;
	return {
		statusCode: 302,
		headers: { Location: target, "Cache-Control": "no-store" },
		mimeType: "text/html",
		response: `<!DOCTYPE html><html><body><p>Downloads happen in your browser now: <a href="${target}">${target}</a></p></body></html>`
	};
}

/** HTML page route helper. */
function htmlRoute(info, render) {
	applyPublicHeaders(info, 300);
	return { mimeType: "text/html", response: render(BASE) };
}

/** Mounts the complete public Rebbe sichos API beneath the owning derech. */
async function dynamicRoutes(info) {
	await info.use({
		"/": async () => runJson(info, async () => descriptor()),
		"/docs": async () => htmlRoute(info, docsPage),
		"/health": async () => runJson(info, async () => ({
			status: "healthy",
			archiveYears: yearList().length,
			searchShards: ["months-1764928230", "days-1764928230"]
		})),
		"/options": async () => runJson(info, async () => ({
			years: yearList(),
			months: MONTHS,
			days: Array.from({ length: 30 }, (_, i) => i + 1)
		})),
		"/search": async () => runJson(info, searchService),
		"/event": async () => runJson(info, eventService),
		"/bundle": async () => runJson(info, bundleService, { methods: ["GET", "POST"], cacheSeconds: 0 }),
		"/bundle/data": async () => runJson(info, async params => {
			if (!params.id) {
				const err = new Error("Required: id (from POST/GET /api/rebbe/bundle).");
				err.status = 400;
				err.code = "MISSING_BUNDLE_ID";
				throw err;
			}
			return { bundle: await buildManifest(params.id, BASE) };
		}),
		"/bundle/page": async () => htmlRoute(info, bundlePage),
		"/bundle/zip": async () => pageRedirectRoute(info),
		"/bundle/merge": async () => pageRedirectRoute(info, "merge")
	});
	return null;
}

module.exports = { dynamicRoutes };
