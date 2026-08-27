#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Binding = require("../core/tunnelSecurity/bindingStore.js");

/**
	* @file Plans or confirms account-scoped cleanup of inert tunnel bindings.
	* @description The Awtsmoos makes destructive maintenance explicit and auditable.
	*/
const args = new Set(process.argv.slice(2));
const accountArgument = process.argv.find(value => value.startsWith("--account="));
const accountId = accountArgument ? accountArgument.slice("--account=".length) : "";
const input = {
	accountId,
	retentionMs: numeric("--retention-ms="),
	historyPerIdentity: numeric("--history-per-identity=")
};
const confirmed = args.has("--confirm");
const result = confirmed
	? Binding.pruneBindings(input)
	: Binding.planBindingPrune(input);
console.log(JSON.stringify({
	BH: "B\"H",
	ok: true,
	action: confirmed ? "bindingPrune" : "bindingPrunePlan",
	confirmed,
	candidateCount: result.candidates.length,
	removedCount: result.removed?.length || 0,
	...result
}, null, 2));

function numeric(prefix) {
	const argument = process.argv.find(value => value.startsWith(prefix));
	if (!argument) return undefined;
	const number = Number(argument.slice(prefix.length));
	return Number.isFinite(number) ? number : undefined;
}
