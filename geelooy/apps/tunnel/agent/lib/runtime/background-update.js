// B"H
// Boruch Hashem
// Blessed is He

const { maybeSelfUpdate } = require("../self-update.js");

/**
 * B"H
 *
 * Announces a verified release without replacing the connected agent. The
 * living websocket remains the vessel of service; a human or supervisor may
 * later invoke the transactional installer whose rollback covenant is complete.
 */
function scheduleSelfUpdate({ config, log, reason = "background" } = {}) {
	setTimeout(async () => {
		try {
			const result = await maybeSelfUpdate({
				config,
				force: false,
				mode: "notify"
			});

			if (result?.updateAvailable) {
				log?.(
					"Tunnel update available; current agent remains running:",
					JSON.stringify({
						reason,
						version: result.version,
						hash: result.hash,
						activation: result.activation,
						command: result.command
					})
				);
			}
		} catch (error) {
			log?.(
				"Tunnel update discovery failed; current agent remains alive:",
				error && (error.stack || error.message || String(error))
			);
		}
	}, 1000).unref?.();
}

module.exports = { scheduleSelfUpdate };
