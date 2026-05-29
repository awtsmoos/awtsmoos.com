// B"H
import { runBrowserActions } from "../browser-actions/runBrowserActions.js";

async function pause(ms) {
  if (!ms) return;
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * B"H
 * Chapter 12: The old interaction stream joined the new JSON river.
 *
 * Legacy interactions still work, but the richer browser action runner now
 * receives the scroll first. It speaks click, fill, type, press, wait, assert,
 * evaluate, and snapshot with one data-based interpreter.
 *
 * @param {object} runtime Runtime containing window.interactions.
 * @param {Array<object>} interactions Declarative interactions.
 * @returns {Promise<Array<object>>} Interaction replay log.
 */
export async function applyInteractions(runtime, interactions = []) {
  const list = Array.isArray(interactions) ? interactions : [];
  if (!list.length) return [];

  const rich = await runBrowserActions(runtime, list);
  if (rich.log.length) {
    const failed = rich.failures[0];
    if (failed) throw new Error(failed.error || "browser_action_failed");
    return rich.log;
  }

  const log = [];
  const virtual = runtime?.window?.interactions;
  if (!virtual) return log;

  for (const step of list) {
    const op = step.op || step.action;
    if (op === "wait") { await pause(Number(step.ms || 0)); continue; }
    if (typeof virtual[op] !== "function") throw new Error("Unsupported interaction: " + op);
    const value = virtual[op](step.selector, step.text ?? step.key ?? step.expected);
    log.push({ op, selector: step.selector || null, ok: true, value });
  }
  return log;
}
