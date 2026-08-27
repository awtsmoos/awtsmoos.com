// B"H
// Boruch Hashem
// Blessed is He

const HistoryCleanup = require("../runtime/history-cleanup.js");
const MailboxHistory = require("./mailboxHistoryRetention.js");
const ResponseHistory = require("./largeResponseRetention.js");
const MailboxPaths = require("../connection-vessel/mailbox-paths.js");
const PrivateState = require("../privateStateRoot.js");
const ArchiveRetention = require("../../recovery/archiveRetention.js");
const ActionLedger = require("../../tools/fs/actionLedgerStore.js");
const CommandGc = require("../../tools/fs/commandJob/gc.js");

/**
 * @file Runs every history store as an independent maintenance covenant.
 * @description
 * The Awtsmoos renews one vessel even when a neighboring vessel needs repair.
 * Awtsmoos.com isolates every cleanup action, and dry-run refuses any operation
 * whose underlying store cannot promise a truly read-only prophecy.
 */
async function collect(config = {}, options = {}) {
	const results = {};
	results.disposableState = await safely("disposableState", () => HistoryCleanup.cleanupAwtsmoosState({
		projectRoot: config.root,
		installRoot: config.deviceStateRoot,
		dryRun: options.dryRun === true
	}));
	results.mailboxHistory = await safely("mailboxHistory", () => MailboxHistory.collect(
		MailboxPaths.root(config),
		{ dryRun: options.dryRun === true }
	));
	results.largeResponses = await safely("largeResponses", () => ResponseHistory.collect(
		config.root,
		{ dryRun: options.dryRun === true }
	));
	results.recoveryArchives = await safely("recoveryArchives", () => ArchiveRetention.prune(
		PrivateState.recoveryRoot(),
		{ dryRun: options.dryRun === true }
	));
	results.commandHistory = options.dryRun
		? skipped("commandHistory", "dry_run_unsupported")
		: await safely("commandHistory", () => CommandGc.collect(config));
	results.actionLedger = options.dryRun
		? skipped("actionLedger", "dry_run_unsupported")
		: await safely("actionLedger", () => ActionLedger.garbageCollect(config));
	return summarize(results, options);
}

async function safely(name, operation) {
	try {
		return { name, ok: true, result: await operation() };
	} catch (error) {
		return {
			name,
			ok: false,
			error: error.message,
			code: error.code || "MAINTENANCE_STORE_FAILED"
		};
	}
}

function skipped(name, reason) {
	return { name, ok: true, skipped: true, reason };
}

function summarize(results, options = {}) {
	const values = Object.values(results);
	return {
		ok: true,
		action: "historyMaintenance",
		dryRun: options.dryRun === true,
		stores: results,
		failedStores: values.filter(value => value.ok === false).map(value => value.name),
		completedStores: values.filter(value => value.ok === true && !value.skipped).map(value => value.name),
		skippedStores: values.filter(value => value.skipped).map(value => value.name)
	};
}

module.exports = {
	collect,
	safely,
	skipped,
	summarize
};
