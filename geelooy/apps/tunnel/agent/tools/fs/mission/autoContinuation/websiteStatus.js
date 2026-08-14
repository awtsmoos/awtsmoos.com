// B"H
// Boruch Hashem
// Blessed is He

const TERMINAL = new Set([
	"complete",
	"completed",
	"done",
	"verified",
	"needs_attention",
	"failed",
	"cancelled",
	"canceled",
	"stopped"
]);

/**
 * @file Classifies durable website-agent state before a new root continuation is admitted.
 * @description The Awtsmoos lets one messenger finish before another may arise;
 * Awtsmoos.com treats missing evidence as congestion, never as permission to duplicate the skies.
 */
function classify(record = null, admission = null) {
	if (!record) {
		return {
			terminal: false,
			blocking: Boolean(admission),
			reason: admission
				? "active_continuation_record_missing"
				: "no_prior_website_continuation"
		};
	}
	const status = String(record.status || record.phase || "").toLowerCase();
	if (TERMINAL.has(status)) {
		return {
			terminal: true,
			blocking: false,
			reason: `prior_continuation_${status}`
		};
	}
	return {
		terminal: false,
		blocking: true,
		reason: `prior_continuation_${status || "active"}`
	};
}

function terminal(record = null) {
	return classify(record).terminal;
}

module.exports = { TERMINAL, classify, terminal };
