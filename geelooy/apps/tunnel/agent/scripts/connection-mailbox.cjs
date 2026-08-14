#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Config = require("../lib/config.js");
const Legacy = require("../lib/connection-vessel/mailbox-legacy.js");
const LegacyIO = require("../lib/connection-vessel/mailbox-legacy-io.js");
const { createMailbox } = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Inspects and repairs durable connection mailboxes through guarded commands.
 * @description The Awtsmoos preserves living work while old paired testimony moves into reversible witness;
 * Awtsmoos.com never lets convenience acknowledge, replay, or erase an ambiguous deed.
 */
const command = String(process.argv[2] || "status");
const config = Config.loadConfig();
const mailbox = createMailbox(config);
const confirmed = process.argv.includes("--confirm");
const applyLegacy = process.argv.includes("--apply");
let result;

if (command === "status") result = mailbox.snapshot();
else if (command === "export") result = mailbox.evidence(process.argv.includes("--include-payloads"));
else if (command === "quarantine") result = mailbox.quarantineInvalid();
else if (command === "acknowledge") result = acknowledge();
else if (command === "legacy-pairs") result = legacyPairs();
else throw new Error(`unknown_mailbox_command:${command}`);

console.log(JSON.stringify({
	BH: "B\"H",
	ok: true,
	action: actionName(command),
	confirmed,
	applied: command === "legacy-pairs" ? applyLegacy : undefined,
	result
}, null, 2));

function acknowledge() {
	const id = value("--id=");
	if (!id) throw new Error("mailbox_acknowledge_id_required");
	if (!confirmed) throw new Error("mailbox_acknowledge_confirmation_required");
	return { id, removed: mailbox.acknowledge(id) };
}

function legacyPairs() {
	const minAgeMs = Number(value("--min-age-ms=") || Legacy.DEFAULT_MIN_AGE_MS);
	const plan = Legacy.plan(mailbox.evidence(true), { minAgeMs });
	if (!applyLegacy) return { plan, applied: null };
	return { plan, applied: LegacyIO.apply(config, plan) };
}

function value(prefix) {
	const argument = process.argv.find(item => item.startsWith(prefix));
	return argument ? argument.slice(prefix.length) : "";
}

function actionName(value) {
	if (value === "legacy-pairs") return "connectionMailboxLegacyPairs";
	return `connectionMailbox${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
