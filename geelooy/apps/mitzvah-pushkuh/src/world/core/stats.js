// B"H
// Stats are breadcrumbs in the river of frames, passes, and commands.
export function createStats() {
  let frames = 0, avg = 16.67, lastReport = 0, passes = {}, commands = 0;
  function frame(delta, q, tier) { frames++; avg = avg * .94 + delta * .06; return { fps: Math.round(1000 / avg), avg: +avg.toFixed(2), tier, dpr: +q.dpr.toFixed(2), frames, passes, commands }; }
  function pass(name) { passes[name] = (passes[name] || 0) + 1; }
  function setCommands(n) { commands = n || 0; }
  function shouldReport(now) { if (now - lastReport < 900) return false; lastReport = now; return true; }
  function resetPasses() { passes = {}; commands = 0; }
  return { frame, pass, setCommands, shouldReport, resetPasses };
}
