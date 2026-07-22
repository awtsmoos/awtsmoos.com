// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMeluketRepairBackup.js
 * @description
 * Before one letter enters the live store, this court records every alias,
 * source membership, and pre-existing canonical post. Packed and live identity
 * sets must match exactly before a rollback receipt can be sealed.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const BaseDosDB = require("../../ayzarim/DosDB/index.js");
const {
	createGuardedDosDB
} = require("../../ayzarim/DosDB/runtimeReadGuard.js");
const {
	DATABASE_ROOT,
	FULL_POSTS_ROOT,
	SERIES_ROOT
} = require("./meluketRepairConstants.js");
const {
	readPackedMonths
} = require("./meluketPackedReader.js");

const DosDB = createGuardedDosDB(BaseDosDB);
const OUTPUT = path.join(
	__dirname,
	"../../ai_thoughts/20260721-corpus-integrity-talmud-tanach-chassidus-rag/",
	"meluket-repair-backup.json"
);

function hash(value) {
	return crypto.createHash("sha256")
		.update(JSON.stringify(value))
		.digest("hex");
}

function sorted(values) {
	return [...values].sort((left, right) => left.localeCompare(right));
}

async function safeGet(database, logicalPath) {
	try {
		return await database.get(logicalPath, { max: true });
	} catch {
		return null;
	}
}

async function inspectMonth(database, month) {
	const aliasBase = `${SERIES_ROOT}/${month.aliasId}`;
	const sourceBase = `${SERIES_ROOT}/${month.sourceId}`;
	const aliasPostIds = await database.getObjectKeys(`${aliasBase}/posts`)
		.catch(() => []);
	const sourcePostIds = await database.getObjectKeys(`${sourceBase}/posts`)
		.catch(() => []);
	if (JSON.stringify(sorted(sourcePostIds)) !== JSON.stringify(sorted(month.postIds))) {
		throw new Error(`Source membership mismatch: ${month.sourceId}`);
	}
	if (aliasPostIds.length) {
		throw new Error(`Alias unexpectedly owns posts: ${month.aliasId}`);
	}
	const existingPairs = await Promise.all(month.postIds.map(async postId => {
		const post = await safeGet(database, `${FULL_POSTS_ROOT}/${postId}`);
		return post ? [postId, post] : null;
	}));
	return {
		aliasId: month.aliasId,
		sourceId: month.sourceId,
		aliasPrateem: await safeGet(database, `${aliasBase}/prateem`),
		aliasPostIds,
		sourcePrateem: await safeGet(database, `${sourceBase}/prateem`),
		sourcePostIds,
		sourceHash: hash(month.posts),
		existingFullPosts: Object.fromEntries(existingPairs.filter(Boolean))
	};
}

async function main() {
	const packedMonths = readPackedMonths();
	const database = new DosDB(DATABASE_ROOT);
	await database.init();
	const months = [];
	for (const month of packedMonths) {
		months.push(await inspectMonth(database, month));
	}
	const sourcePostIds = [...new Set(packedMonths.flatMap(month => month.postIds))];
	const existingFullPosts = months.reduce(
		(total, month) => total + Object.keys(month.existingFullPosts).length,
		0
	);
	const payload = {
		BH: "B\"H",
		createdAt: new Date().toISOString(),
		databaseRoot: DATABASE_ROOT,
		summary: {
			months: months.length,
			sourcePosts: sourcePostIds.length,
			existingFullPosts
		},
		months
	};
	payload.backupHash = hash(payload);
	fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
	process.stdout.write(`${JSON.stringify(payload.summary)}\n`);
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
