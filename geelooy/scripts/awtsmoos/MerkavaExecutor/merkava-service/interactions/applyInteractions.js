// B"H

async function pause(ms) {
  if (!ms) return;
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * B"H
 * Applies simple JSON interactions to a SyntheticBrowserRuntime.
 *
 * @param {object} runtime Runtime containing window.interactions.
 * @param {Array<object>} interactions Declarative interactions.
 * @returns {Promise<Array<object>>} Interaction replay log.
 */
export async function applyInteractions(runtime, interactions = []) {
  const log = [];
  const virtual = runtime?.window?.interactions;
  if (!virtual) return log;

  for (const step of interactions) {
    const op = step.op || step.action;
    if (op === "wait") { await pause(Number(step.ms || 0)); continue; }
    if (typeof virtual[op] !== "function") throw new Error("Unsupported interaction: " + op);
    const value = virtual[op](step.selector, step.text ?? step.key ?? step.expected);
    log.push({ op, selector: step.selector || null, ok: true, value });
  }
  return log;
}
