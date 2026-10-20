//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedDeployRoutes status and service restart endpoints (split from deployRoutes.js).
 */

const { execFileSync } = require('child_process');
const { requireMethod, requestValue } = require('./requestValues.js');
const { DEPLOY_SIGN_PUBLIC_KEYS } = require('./deploySign.js');
const { MAX_FILE_BYTES, MAX_FILES_PER_PUSH, appendDeployLog, repoRoot } = require('./deployRoutesConfig.js');

module.exports = {
	async status() {
		return {
			success: true,
			configured: DEPLOY_SIGN_PUBLIC_KEYS.length > 0,
			auth: { signature: DEPLOY_SIGN_PUBLIC_KEYS.length > 0, sharedSecret: false },
			repo: repoRoot(),
			maxFileBytes: MAX_FILE_BYTES,
			maxFiles: MAX_FILES_PER_PUSH,
		};
	},

	// MAC-SEVERANCE: restart the production service via HTTPS.
	// This eliminates the last SSH dependency — the VM can deploy files
	// AND restart the service entirely over HTTPS, never needing the Mac.
	async restart() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// B"H 2026-10-13: no import lock — import jobs never block restarts.
		// A restart mid-import just marks the job 'interrupted'; the client
		// resumes it and idempotent writes make the resume safe.

		try {
			// Try systemd first (production), fall back gracefully
			execFileSync('systemctl', ['--user', 'restart', 'awtsmoos'], { timeout: 30000 });
			appendDeployLog({
				at: new Date().toISOString(),
				message: 'Service restart via deploy API',
				restart: true,
			});
			return {
				success: true,
				message: 'B"H service restart initiated via HTTPS. No Mac involved.',
			};
		} catch (e) {
			// If systemctl --user fails, try system-level (may need sudoers)
			try {
				execFileSync('sudo', ['systemctl', 'restart', 'awtsmoos'], { timeout: 30000 });
				appendDeployLog({
					at: new Date().toISOString(),
					message: 'Service restart via deploy API (sudo)',
					restart: true,
				});
				return {
					success: true,
					message: 'B"H service restart initiated via HTTPS (sudo). No Mac involved.',
				};
			} catch (e2) {
				return {
					success: false,
					error: 'RESTART_FAILED',
					message: `Restart failed: ${e2.message}`,
				};
			}
		}
	}
};
