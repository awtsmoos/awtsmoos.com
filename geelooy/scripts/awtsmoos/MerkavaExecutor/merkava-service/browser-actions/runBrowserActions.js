// B"H
import { VirtualPage } from "./VirtualPage.js";

/**
 * B"H
 * Chapter 11: The JSON scroll walked, and every selector answered.
 *
 * The runner returns a log instead of hiding failure. If any action fails, the
 * caller can mark the whole runtime failed while still preserving snapshots,
 * console output, and exact step diagnostics.
 *
 * @param {object} runtime Merkava runtime with a virtual window.
 * @param {object[]} actions Canonical or raw browser action JSON.
 * @returns {Promise<object>} Browser action report.
 */
export async function runBrowserActions(runtime, actions = []) {
  const page = new VirtualPage(runtime);
  const log = await page.run(actions);
  const failures = log.filter(x => x.ok === false);
  return { ok: failures.length === 0, log, failures, snapshot: page.snapshot() };
}
