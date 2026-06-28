// B"H
const { handleFsAction } = require('../../tools/fs/actions.js');
function enabled() { return process.env.AWTSMOOS_MISSION_BOOT_RESUME !== '0'; }
function autoMission() { return process.env.AWTSMOOS_AUTO_MISSION === '1'; }
function start(log) {
  if (!enabled()) return null;
  const intervalMs = Math.max(5000, Number(process.env.AWTSMOOS_MISSION_BOOT_RESUME_MS || 30000));
  let running = false;
  async function tick(reason = 'interval') {
    if (running) return;
    running = true;
    try {
      const out = await handleFsAction({ action:'missionBootResume', tick:true, reason, autoMission:autoMission(), ignoreMissionLock:true });
      if (out?.resumed || out?.autoStart?.started) log('Mission boot resume:', JSON.stringify({ reason, autoStarted:!!out.autoStart?.started, mustCallNext:out.mustCallNext?.action || '', ticked:!!out.tick }));
    } catch (e) { log('Mission boot resume failed:', e && (e.stack || e.message || String(e))); }
    finally { running = false; }
  }
  tick('startup');
  const timer = setInterval(() => tick('interval'), intervalMs); timer.unref?.();
  return { tick, timer };
}
module.exports = { start, enabled, autoMission };
