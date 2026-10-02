// B"H
// Boruch Hashem
// Blessed is He

const Payload = require("./writePayload.js");
const Batch = require("./writeBatchTransaction.js");
const Results = require("./writeBatchResults.js");

/**
 * @file Preflights every expected hash without reloading snapshot bytes into memory.
 * @description
 * The Awtsmoos lets Awtsmoos.com compare the streamed witness already revealed while
 * the rollback snapshot was born. No second whole-file Buffer is needed to know the former world.
 */
async function bulkWriteIfHashes(config, payload, writeIfHash) {
	const specifications = Payload.normalizeWriteSpecifications(payload);
	let prepared;
	try {
		prepared = await Batch.prepareBatch(config, specifications);
	} catch (error) {
		return batchFailure(error, specifications.length, {});
	}
	const preflight = verifyExpectedHashes(prepared);
	if (!preflight.ok) return preflight;
	const committed = await Batch.commitPrepared(prepared, async target => {
		return await writeIfHash(config, {
			path: target.path,
			expectedSha256: target.expectedSha256,
			content: target.content,
			atomicOptions: target.atomicOptions || {}
		});
	});
	return {
		...committed,
		action: "bulkWriteIfHashes",
		preflight: true
	};
}

function verifyExpectedHashes(prepared) {
	const results = {};
	for (const target of prepared) {
		const expected = String(
			target.expectedSha256 || target.sha256 || ""
		).toLowerCase();
		if (!expected) {
			return preflightFailure(target, "missing_expectedSha256", results);
		}
		if (!target.existed) {
			return preflightFailure(target, "hash_target_missing", results);
		}
		const actual = String(target.beforeSha256 || "").toLowerCase();
		results[target.path] = {
			ok: actual === expected,
			path: target.path,
			expectedSha256: expected,
			actualSha256: actual,
			preflight: true
		};
		if (actual !== expected) {
			return preflightFailure(target, "hash_mismatch", results);
		}
		target.expectedSha256 = expected;
	}
	return {
		ok: true,
		results
	};
}

function preflightFailure(target, code, results) {
	const error = Results.batchError(code, target.path, target.index);
	return batchFailure(error, target.index + 1, results);
}

function batchFailure(error, count, results) {
	return {
		...Results.failure(error, count),
		action: "bulkWriteIfHashes",
		rolledBack: false,
		results
	};
}

module.exports = {
	bulkWriteIfHashes,
	verifyExpectedHashes
};
