// B"H
// Boruch Hashem
// Blessed is He

const { maybeSelfUpdate } = require("../self-update.js");

const WARNING_INTERVAL_MS = 60 * 60 * 1000;
const lastWarningAt = new Map();

/**
 * @file Runs quiet release discovery without making optional metadata look fatal.
 * @description
 * The Awtsmoos renews the living tunnel before every announcement. Awtsmoos.com
 * keeps the socket serving, logs one bounded warning for stale release metadata,
 * and never prints an expected descriptor stack as though the process had crashed.
 */
function scheduleSelfUpdate({ config, log, reason = "background" } = {}) {
	const timer = setTimeout(async () => {
		try {
			const result = await maybeSelfUpdate({
				config,
				force: false,
				mode: "notify"
			});
			reportResult(log, result, reason);
		} catch (error) {
			reportUnexpected(log, error, reason);
		}
	}, 1000);
	timer.unref?.();
	return timer;
}

function reportResult(log, result = {}, reason = "background") {
	if (result.descriptorWarning) {
		warnOnce(log, result.descriptorWarning, reason);
	}
	if (!result.updateAvailable) return;
	log?.("info", `B"H tunnel update available: ${JSON.stringify({
		reason,
		version: result.version,
		hash: result.hash,
		activation: result.activation,
		command: result.command,
		descriptorAvailable: result.descriptorAvailable
	})}`);
}

function reportUnexpected(log, error, reason) {
	const code = clean(error?.code || error?.message || "update_discovery_failed", 160);
	warnOnce(log, {
		code,
		message: "Release discovery failed temporarily; the connected agent remains active."
	}, reason);
}

function warnOnce(log, warning = {}, reason = "background", now = Date.now()) {
	const code = clean(warning.code || "update_metadata_warning", 160);
	const previous = lastWarningAt.get(code) || 0;
	if (now - previous < WARNING_INTERVAL_MS) return false;
	lastWarningAt.set(code, now);
	log?.("warn", `B"H tunnel update notice: ${JSON.stringify({
		reason,
		code,
		message: clean(warning.message, 500),
		currentAgentRemainsAlive: true
	})}`);
	return true;
}

function clean(value, maximum) {
	return String(value || "").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function resetWarnings() {
	lastWarningAt.clear();
}

module.exports = {
	WARNING_INTERVAL_MS,
	reportResult,
	reportUnexpected,
	resetWarnings,
	scheduleSelfUpdate,
	warnOnce
};
