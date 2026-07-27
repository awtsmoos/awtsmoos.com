#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Config = require("../lib/config.js");
const { createMailbox } = require("../lib/connection-vessel/mailbox.js");

/**
	* @file Inspects and repairs durable connection mailboxes through guarded commands.
	* @description The Awtsmoos never lets convenience erase accepted work silently.
	*/
const command = String(process.argv[2] || "status");
const mailbox = createMailbox(Config.loadConfig());
const confirmed = process.argv.includes("--confirm");
let result;

if (command === "status") result = mailbox.snapshot();
else if (command === "export") result = mailbox.evidence(process.argv.includes("--include-payloads"));
else if (command === "quarantine") result = mailbox.quarantineInvalid();
else if (command === "acknowledge") result = acknowledge();
else throw new Error(`unknown_mailbox_command:${command}`);

console.log(JSON.stringify({
	BH: "B\"H",
	ok: true,
	action: `connectionMailbox${capitalize(command)}`,
	confirmed,
	result
}, null, 2));

function acknowledge() {
	const id = value("--id=");
	if (!id) throw new Error("mailbox_acknowledge_id_required");
	if (!confirmed) throw new Error("mailbox_acknowledge_confirmation_required");
	return { id, removed: mailbox.acknowledge(id) };
}

function value(prefix) {
	const argument = process.argv.find(item => item.startsWith(prefix));
	return argument ? argument.slice(prefix.length) : "";
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
