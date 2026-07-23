// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file auditMappedRoutes.js
 * @description
 * The Awtsmoos walks every restored month through the exact compatibility
 * reader and representative public route factories before Awtsmoos.com starts.
 */

const fs = require("fs");
const path = require("path");
const DosDB = require("../../ayzarim/DosDB/index.js");
const createPostsRoutes = require("../../geelooy/api/social/_awtsmoos.posts.base.js");
const createRootRoutes = require("../../geelooy/api/social/_awtsmoos.posts.js");
const createSeriesRoutes = require("../../geelooy/api/social/_awtsmoos.series.js");
const {
	readMappedPost,
	readMappedPosts
} = require("../../geelooy/api/social/helper/post/seriesReadCompatibility.js");
const {
	bundleRoot,
	liveDatabaseRoot
} = require("./constants.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

function input(db, query = {}) {
	return {
		db,
		request: {
			method: "GET"
		},
		$_GET: query,
		$_QUERY: query,
		utils: {
			generateId: value => String(value || "")
		}
	};
}

function content(record) {
	return String(record?.content || record?.rootContent || "").trim();
}

async function auditAllSeries(db, mappings, records) {
	const failures = [];
	const rows = [];
	const recordById = new Map(records.map(record => [record.id, record]));
	for (const seriesId of [...new Set(mappings.flatMap(row => [
		row.friendlySeriesId,
		row.historicalSeriesId
	]))]) {
		const expected = mappings
			.filter(row => row.friendlySeriesId === seriesId || row.historicalSeriesId === seriesId)
			.map(row => row.newPostId);
		const ids = await readMappedPosts({
			$i: input(db),
			heichelId: "ikar",
			seriesId,
			withDetails: false
		});
		const details = await readMappedPosts({
			$i: input(db),
			heichelId: "ikar",
			seriesId,
			withDetails: true
		});
		const actualIds = Array.isArray(ids) ? ids : [];
		const actualDetails = Array.isArray(details) ? details : [];
		if (JSON.stringify(actualIds) !== JSON.stringify(expected)) {
			failures.push(`${seriesId}:ids`);
		}
		if (actualDetails.length !== expected.length) {
			failures.push(`${seriesId}:details:${actualDetails.length}/${expected.length}`);
		}
		for (const post of actualDetails) {
			const expectedRecord = recordById.get(post.id || post.postId);
			if (!expectedRecord || post.title !== expectedRecord.title) {
				failures.push(`${seriesId}:title:${post.id || post.postId}`);
			}
			if (!content(post)) failures.push(`${seriesId}:body:${post.id || post.postId}`);
		}
		rows.push({
			seriesId,
			expectedCount: expected.length,
			idCount: actualIds.length,
			detailCount: actualDetails.length
		});
	}
	return {
		failures,
		rows
	};
}

async function auditRepresentativeRoutes(db, mappings) {
	const first = mappings[0];
	const seriesId = first.friendlySeriesId;
	const postId = first.newPostId;
	const postsInput = input(db);
	const postsRoutes = createPostsRoutes({
		$i: postsInput,
		userid: "audit"
	});
	const ids = await postsRoutes["/heichelos/:heichel/series/:series/posts"]({
		heichel: "ikar",
		series: seriesId
	});
	const details = await postsRoutes["/heichelos/:heichel/series/:series/posts/details"]({
		heichel: "ikar",
		series: seriesId
	});
	const singular = await postsRoutes["/heichelos/:heichel/series/:series/post/:post"]({
		heichel: "ikar",
		series: seriesId,
		post: postId
	});
	const rootInput = input(db, {
		seriesId
	});
	const rootRoutes = createRootRoutes({
		$i: rootInput,
		userid: "audit"
	});
	const rootDetails = await rootRoutes["/heichelos/:heichel/posts/details"]({
		heichel: "ikar"
	});
	const seriesInput = input(db, {
		details: "true"
	});
	const seriesRoutes = createSeriesRoutes({
		$i: seriesInput,
		userid: "audit"
	});
	const seriesDetails = await seriesRoutes["/heichelos/:heichel/series/:series"]({
		heichel: "ikar",
		series: seriesId
	});
	const direct = await readMappedPost({
		$i: input(db),
		heichelId: "ikar",
		seriesId,
		postId
	});
	return {
		seriesId,
		postId,
		idsCount: Array.isArray(ids) ? ids.length : -1,
		detailsCount: Array.isArray(details) ? details.length : -1,
		rootDetailsCount: Array.isArray(rootDetails) ? rootDetails.length : -1,
		seriesPostsCount: Array.isArray(seriesDetails?.posts) ? seriesDetails.posts.length : -1,
		singularTitle: singular?.title,
		directTitle: direct?.title,
		singularContentLength: content(singular).length
	};
}

async function main() {
	const mappings = readJson("mappings.json");
	const records = readJson("records.json");
	const db = new DosDB(liveDatabaseRoot);
	await db.init();
	const allSeries = await auditAllSeries(db, mappings, records);
	const representative = await auditRepresentativeRoutes(db, mappings);
	const expectedRepresentativeCount = mappings.filter(row => {
		return row.friendlySeriesId === representative.seriesId;
	}).length;
	const failures = [...allSeries.failures];
	for (const [label, value] of Object.entries({
		idsCount: representative.idsCount,
		detailsCount: representative.detailsCount,
		rootDetailsCount: representative.rootDetailsCount,
		seriesPostsCount: representative.seriesPostsCount
	})) {
		if (value !== expectedRepresentativeCount) failures.push(`representative:${label}`);
	}
	if (!representative.singularTitle || !representative.directTitle) {
		failures.push("representative:singular");
	}
	if (!representative.singularContentLength) failures.push("representative:content");
	const report = {
		seriesCount: allSeries.rows.length,
		friendlyIdentityCount: 218,
		historicalIdentityCount: 218,
		uniquePostCount: records.length,
		failureCount: failures.length,
		failures,
		series: allSeries.rows,
		representative,
		verifiedAt: new Date().toISOString()
	};
	fs.writeFileSync(
		path.join(bundleRoot, "mapped-route-audit.json"),
		JSON.stringify(report, null, 2)
	);
	console.log(JSON.stringify(report, null, 2));
	if (failures.length) process.exitCode = 1;
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
