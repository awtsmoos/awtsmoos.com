// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyLive.js
 * @description
 * The Awtsmoos crosses the final public threshold, requiring every friendly and
 * historical month route to expose the exact restored identities and bodies.
 */

const fs = require("fs");
const path = require("path");
const { bundleRoot } = require("./constants.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

function extractPosts(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.posts)) return payload.posts;
	if (payload && typeof payload === "object") {
		const values = Object.values(payload);
		if (values.every(value => value && typeof value === "object")) return values;
	}
	return [];
}

async function fetchSeries(seriesId) {
	const encoded = encodeURIComponent(seriesId);
	const url = `http://127.0.0.1:8080/api/social/heichelos/ikar/series/${encoded}/posts/details`;
	const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
	const text = await response.text();
	if (!response.ok) throw new Error(`${seriesId}: HTTP ${response.status}: ${text.slice(0, 300)}`);
	return { url, posts: extractPosts(JSON.parse(text)) };
}

async function main() {
	const mappings = readJson("mappings.json");
	const records = readJson("records.json");
	const titleById = new Map(records.map(record => [record.id, record.title]));
	const failures = [];
	const routes = [];
	for (const month of new Set(mappings.map(row => row.month))) {
		const rows = mappings.filter(row => row.month === month);
		const expectedIds = new Set(rows.map(row => row.newPostId));
		for (const key of ["friendlySeriesId", "historicalSeriesId"]) {
			const seriesId = rows[0][key];
			const result = await fetchSeries(seriesId);
			const ids = new Set(result.posts.map(post => post.id || post.postId));
			const missing = [...expectedIds].filter(id => !ids.has(id));
			const wrongTitles = result.posts.filter(post => {
				const id = post.id || post.postId;
				return expectedIds.has(id) && post.title !== titleById.get(id);
			});
			const emptyBodies = result.posts.filter(post => {
				const id = post.id || post.postId;
				const content = post.content || post.rootContent || "";
				return expectedIds.has(id) && !String(content).trim();
			});
			if (result.posts.length !== rows.length) failures.push(`${seriesId}:count`);
			if (missing.length) failures.push(`${seriesId}:missing:${missing.length}`);
			if (wrongTitles.length) failures.push(`${seriesId}:titles:${wrongTitles.length}`);
			if (emptyBodies.length) failures.push(`${seriesId}:bodies:${emptyBodies.length}`);
			routes.push({
				month,
				seriesId,
				url: result.url,
				postCount: result.posts.length,
				missingCount: missing.length,
				wrongTitleCount: wrongTitles.length,
				emptyBodyCount: emptyBodies.length
			});
		}
	}
	const report = {
		routeCount: routes.length,
		failureCount: failures.length,
		failures,
		routes,
		verifiedAt: new Date().toISOString()
	};
	const reportPath = path.join(bundleRoot, "live-verify-report.json");
	fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
	if (failures.length) process.exitCode = 1;
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
