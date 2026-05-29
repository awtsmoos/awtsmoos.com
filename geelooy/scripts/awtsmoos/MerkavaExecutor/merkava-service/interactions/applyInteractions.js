// B"H
import { runBrowserActions } from '../browser-actions/runBrowserActions.js';

async function pause(ms) { if (ms) await new Promise(resolve => setTimeout(resolve, ms)); }

/**
 * B"H
 * Browser actions now preserve exact failure records. A step may set
 * continueOnError:true to keep the runtime alive while still returning the
 * error message, stack, action id, and duration in interactionLog.
 */
export async function applyInteractions(runtime, interactions = []) {
  const list = Array.isArray(interactions) ? interactions : [];
  if (!list.length) return [];

  const rich = await runBrowserActions(runtime, list);
  if (rich.log.length) {
    const fatal = rich.failures.find(item => item.continueOnError !== true);
    if (fatal) {
      const error = new Error(fatal.error || 'browser_action_failed');
      error.browserAction = fatal;
      error.browserActionLog = rich.log;
      throw error;
    }
    return rich.log;
  }

  const log = [];
  const virtual = runtime?.window?.interactions;
  if (!virtual) return log;
  for (const step of list) {
    const op = step.op || step.action;
    try {
      if (op === 'wait') { await pause(Number(step.ms || 0)); log.push({ op, ok: true }); continue; }
      if (typeof virtual[op] !== 'function') throw new Error('Unsupported interaction: ' + op);
      log.push({ op, selector: step.selector || null, ok: true, value: virtual[op](step.selector, step.text ?? step.key ?? step.expected) });
    } catch (error) {
      const row = { op, selector: step.selector || null, ok: false, error: error.message, stack: error.stack || '', continueOnError: step.continueOnError === true };
      log.push(row);
      if (!row.continueOnError) throw error;
    }
  }
  return log;
}
