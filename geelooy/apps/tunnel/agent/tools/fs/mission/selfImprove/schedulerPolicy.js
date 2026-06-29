// B"H
/**
 * B"H
 * Chapter 625: The hour received command gates.
 * Awtsmoos creates every command, every wait, every return; the agent now
 * records whether a job is still breathing before it keeps walking.
 */
function normalize(input = {}) {
  return {
    windowMs: cap(input.windowMs ?? input.maxRuntimeMs ?? 60 * 60 * 1000, 0, 12 * 60 * 60 * 1000),
    maxRuns: cap(input.maxRuns ?? input.runs ?? 1, 1, 500),
    maxPulsesPerRun: cap(input.maxPulsesPerRun ?? input.maxPulses ?? 3, 1, 200),
    summitEveryRuns: cap(input.summitEveryRuns ?? 0, 0, 100),
    pauseOnInterrupt: input.pauseOnInterrupt !== false,
    pauseOnCommand: input.pauseOnCommand !== false,
    stopWhenCourtPasses: input.stopWhenCourtPasses !== false,
    roomAgentId: input.agentId || input.roomAgentId || 'scheduler_agent',
    resumeToken: input.resumeToken || '',
    jobId: input.jobId || input.commandJobId || input.runningJobId || '',
    commandStatus: input.commandStatus || input.jobStatus || input.status || '',
    commandDone: input.commandDone === true || input.jobDone === true || input.commandComplete === true,
    focus: input.focus || 'hour scale self improvement scheduler'
  };
}
function cap(value, min, max) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}
module.exports = { normalize };
