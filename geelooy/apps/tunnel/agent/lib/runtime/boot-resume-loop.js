// B"H
const { handleFsAction } = require('../../tools/fs/actions.js');

/**
 * B"H
 * Chapter: the tunnel stopped dreaming while others were knocking.
 * Mission resurrection is holy, but it may not sit on the main transport pulse.
 * By default the native tunnel answers first and does not run recursive mission
 * scans on startup or every thirty seconds. Operators may opt in explicitly with
 * AWTSMOOS_MISSION_BOOT_RESUME=1 after moving the work to an isolated vessel.
 */
function enabled() { return process.env.AWTSMOOS_MISSION_BOOT_RESUME === '1'; }
function autoMission() { return process.env.AWTSMOOS_AUTO_MISSION === '1'; }
function start(log) {
  if (!enabled()) { log?.('Mission boot resume disabled by default to protect tunnel responsiveness.'); return null; }
  const intervalMs = Math.max(60000, Number(process.env.AWTSMOOS_MISSION_BOOT_RESUME_MS || 300000));
  let running = false;
  async function tick(reason = 'interval') {
    if (running) return;
    running = true;
    try {
      const out = await handleFsAction({ action:'missionBootResume', tick:true, reason, autoMission:autoMission(), ignoreMissionLock:true });
      if (out?.resumed || out?.autoStart?.started) log?.('Mission boot resume:', JSON.stringify({ reason, autoStarted:!!out.autoStart?.started, mustCallNext:out.mustCallNext?.action || '', ticked:!!out.tick }));
    } catch (e) { log?.('Mission boot resume failed:', e && (e.stack || e.message || String(e))); }
    finally { running = false; }
  }
  setTimeout(() => tick('startup'), 5000).unref?.();
  const timer = setInterval(() => tick('interval'), intervalMs); timer.unref?.();
  return { tick, timer };
}
module.exports = { start, enabled, autoMission };
