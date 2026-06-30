// B"H
const { maybeSelfUpdate, restartIntoUpdatedAgent } = require('../self-update.js');

/**
 * B"H
 * Chapter 1422: The update servant stopped sitting on the heartbeat throne.
 *
 * Reconnect is a fragile moment. Registration must happen first, then update
 * work may walk behind the palace wall. A changed manifest may still replace the
 * agent, but not by blocking readiness or force-checking every reconnect.
 */
function scheduleSelfUpdate({ config, log, reason = 'background' } = {}) {
  setTimeout(async () => {
    try {
      const out = await maybeSelfUpdate({ config, force: false });
      if (out?.updated) {
        log?.('Tunnel self-update installed in background:', JSON.stringify({ reason, version: out.version, hash: out.hash }));
        restartIntoUpdatedAgent();
        process.exit(0);
      }
      if (out?.wouldUpdate) log?.('Tunnel self-update dry-run:', JSON.stringify(out));
    } catch (e) {
      log?.('Tunnel background self-update failed; current agent remains alive:', e && (e.stack || e.message || String(e)));
    }
  }, 25).unref?.();
}

module.exports = { scheduleSelfUpdate };
