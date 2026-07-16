// B"H
// Boruch Hashem
// Blessed is He

const { setImmediate: yieldTick } = require("node:timers/promises");
const {
	writeText,
	normalizeWriteSpecifications,
	describeWritePayload
} = require("../readWrite.js");
const { replaceRange, applyPatch } = require("../searchEdit.js");
const { writeIfHash, bulkWriteIfHashes } = require("../hashWrite.js");
const { verifyJsFile, verifyJsRuntime } = require("../jsWriteVerifier.js");
const Batch = require("../writeBatchTransaction.js");

/**
 * @file Routes single and multi-file writes through verified replacement vessels.
 * @description
 * The Awtsmoos renews every file while preserving the batch as one covenant.
 * Awtsmoos.com preflights all destinations, writes atomically per file, verifies
 * JavaScript when requested, and rolls back every prior write on later failure.
 */
async function handleBulkWrite(config, payload, action) {
	if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
	const writes = normalizeWriteSpecifications(payload);
	const transaction = await Batch.runBatchTransaction(
		config,
		writes,
		async (target) => {
			await yieldTick();
			const wrote = await writeText(config, target.path, target.content);
			return await attachVerification(wrote, payload, { bulk: true });
		}
	);
	return {
		...transaction,
		action,
		root: config.root,
		payloadShape: describeWritePayload(payload)
	};
}

async function handleOneWrite(config, payload, action, targetPath) {
	const content = payload.content !== undefined ? payload.content : payload.text;
	const wrote = await writeText(config, targetPath, content ?? "");
	return {
		ok: true,
		action,
		root: config.root,
		...(await attachVerification(wrote, payload, { bulk: false }))
	};
}

async function attachVerification(wrote, payload, options = {}) {
	const policy = verificationPolicy(payload, options);
	const jsVerification = policy.js
		? verifyJsFile(wrote.absolutePath, payload)
		: skippedVerification("jsVerification");
	if (jsVerification?.ok === false) {
		throw verificationError("js_verification_failed", wrote, jsVerification);
	}
	const runtimeVerification = policy.runtime
		? await verifyJsRuntime(wrote.absolutePath, payload)
		: skippedVerification("runtimeVerification");
	if (runtimeVerification?.ok === false) {
		throw verificationError(
			"runtime_verification_failed",
			wrote,
			runtimeVerification
		);
	}
	return {
		...wrote,
		jsVerification,
		runtimeVerification
	};
}

function verificationError(code, wrote, verification) {
	const error = new Error(`${code}: ${wrote.path || wrote.absolutePath}`);
	error.code = code;
	error.path = wrote.path;
	error.verification = verification;
	return error;
}

function verificationPolicy(payload = {}, options = {}) {
	const wantsNone = payload.verify === false || payload.skipVerification === true;
	const wantsRuntime = payload.verifyRuntime === true ||
		payload.runtimeVerification === true;
	return {
		js: payload.verifyJs !== false && !wantsNone,
		runtime: !wantsNone && (!options.bulk || wantsRuntime)
	};
}

function skippedVerification(kind) {
	return {
		ok: true,
		skipped: true,
		kind,
		reason: "bulk_or_policy_fast_path"
	};
}

async function consolidatedWrite(config, payload, action, targetPath) {
	const mode = String(payload.mode || payload.writeMode || "file").trim();
	if (["bulk", "many", "files"].includes(mode)) {
		return await handleBulkWrite(config, payload, "bulkWrite");
	}
	if (["hash", "ifHash", "writeIfHash"].includes(mode)) {
		return await writeIfHash(config, { ...payload, action: "writeIfHash" });
	}
	if (["bulkHash", "bulkIfHash", "bulkWriteIfHashes"].includes(mode)) {
		return await bulkWriteIfHashes(config, {
			...payload,
			action: "bulkWriteIfHashes"
		});
	}
	return await handleOneWrite(config, payload, action, targetPath);
}

function buildWriteActions({ config, payload }) {
	const action = payload.action || "list";
	const targetPath = payload.path || payload.p || ".";
	return {
		write: async () => consolidatedWrite(config, payload, action, targetPath),
		bulkWrite: async () => handleBulkWrite(config, payload, action),
		writeIfHash: async () => writeIfHash(config, payload),
		bulkWriteIfHashes: async () => bulkWriteIfHashes(config, payload),
		replaceRange: async () => ({ root: config.root, ...(await replaceRange(config, payload)) }),
		applyPatch: async () => ({ root: config.root, ...(await applyPatch(config, payload)) })
	};
}

module.exports = {
	buildWriteActions,
	consolidatedWrite,
	handleBulkWrite,
	skippedVerification,
	verificationPolicy
};
