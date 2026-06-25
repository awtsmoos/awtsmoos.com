// B"H

const ONE_HOUR_MS = 60 * 60 * 1000;

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function create(input = {}) {
  return {
    mode: input.innovationMode || 'keep_innovating',
    minimumWorkWindowMs: num(input.minimumInnovationWindowMs ?? input.minInnovationWindowMs, ONE_HOUR_MS),
    startedAtMs: Date.now(),
    requireSelfCritiqueEveryCycle: input.requireSelfCritiqueEveryCycle !== false,
    requireNewPlanEveryCycle: input.requireNewPlanEveryCycle !== false,
    requireVerificationEveryCycle: input.requireVerificationEveryCycle !== false,
    forbidFinalBeforeMinimumWindow: input.forbidFinalBeforeMinimumWindow !== false,
    stopOnlyWhen: ['user_stop', 'safety_block', 'tool_access_lost', 'minimum_window_and_completion_gate']
  };
}

function policy(m = {}) {
  return m.innovationPolicy || create({});
}

function assess(m = {}, input = {}) {
  const p = policy(m);
  const elapsedMs = Math.max(0, Date.now() - Number(p.startedAtMs || Date.now()));
  const remainingMs = Math.max(0, Number(p.minimumWorkWindowMs || 0) - elapsedMs);
  const emergencyStop = input.userStop === true || input.safetyBlock === true || input.toolAccessLost === true;
  const minimumSatisfied = remainingMs === 0 || p.forbidFinalBeforeMinimumWindow === false;
  const completionGateOk = input.completionGateOk === true;
  const finalAnswerAllowed = emergencyStop || (completionGateOk && minimumSatisfied);
  return {
    mode: p.mode,
    minimumWorkWindowMs: p.minimumWorkWindowMs,
    elapsedMs,
    remainingMs,
    minimumSatisfied,
    completionGateOk,
    finalAnswerAllowed,
    mustContinueInnovating: !finalAnswerAllowed,
    reason: finalAnswerAllowed ? 'innovation_and_completion_gates_allow_exit' : (completionGateOk ? 'minimum_innovation_window_not_satisfied' : 'completion_gate_not_satisfied'),
    requiredCycle: ['inspect reality', 'write or update plan', 'implement or improve', 'verify with proof', 'self-critique', 'generate next improvements']
  };
}

/**
 * B"H
 * Chapter 546: The hour became a guardian at the exit.
 * Completion may knock, but the gate asks whether enough inspection, critique,
 * verification, and new planning have passed through the vessel. The default
 * answer before the hour is: keep innovating.
 */
function gate(m = {}) {
  const a = assess(m);
  return {
    innovationContinuation: a,
    antiEndingGate: {
      finalAnswerAllowed: a.finalAnswerAllowed,
      mustContinue: a.mustContinueInnovating,
      reason: a.reason,
      defaultMinimum: 'one hour',
      nextInstruction: 'Continue: inspect, plan, improve, verify, critique, and create the next improvement list.'
    }
  };
}

module.exports = { ONE_HOUR_MS, create, assess, gate };
