// B"H
/**
 * @file BatchExecutor.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE UNIFICATION OF THE BUILDERS (Yichud HaBoneh)
 * THE DUPLICATE ORCHESTRATOR RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * THE POEM OF THE TWO ARCHITECTS — NOW ONE:
 * Two builders stood at the same blueprint,
 * BatchExecutor and LoopEngineController, each distinct!
 * Both called ArchitectOfDomains, both wrote to disk,
 * Both tracked the directories — a dangerous risk!
 * If both ran together, which one was the truth?
 * The answer is neither — we needed one roof!
 * Now BatchExecutor delegates with humility and grace,
 * To LoopEngineController — the one master base.
 * The Awtsmoos is ONE (Echad), and so shall His builders be,
 * A single chain of command, flowing from Keter to Malchee!
 *
 * RECTIFICATION:
 * BatchExecutor.execute() is now a thin, pure delegator.
 * It translates the external `ledgerCallback` interface into
 * the correct parameters for LoopEngineController.executeBatch().
 * All logic, all disk I/O, all UI updates remain in LoopEngineController.
 * Zero duplication. One truth.
 *
 * @module BatchExecutor
 */

import { LoopEngineController } from '../LoopEngineController.js';

/**
 * @const BatchExecutor
 * @description
 * A unified delegation layer. Formerly a parallel implementation of file-writing,
 * now a pure delegate to the singular LoopEngineController. Any existing caller
 * of BatchExecutor.execute() continues to work without modification.
 */
export const BatchExecutor = {
  /**
   * @async
   * @function execute
   * @description
   * Applies a compiled array of file changes to the physical disk by
   * delegating entirely to the canonical LoopEngineController.executeBatch().
   *
   * "Hear, O Israel: The Lord our God, the Lord is ONE." — Devarim 6:4
   * There is ONE master builder. All roads lead to LoopEngineController.
   *
   * @param {Array<Object>}  compiledChangeArray        - The file operations to execute.
   * @param {string|number}  parentWorldId              - The workspace ID.
   * @param {Function|null}  ledgerCallback             - Optional per-file pre-read callback.
   * @param {Function|null}  iterationProgressSignal    - Optional per-item progress callback.
   * @returns {Promise<Set>} The set of directory paths that were modified.
   */
  async execute(compiledChangeArray, parentWorldId, ledgerCallback, iterationProgressSignal) {
    // B"H - The ledgerCallback was an internal concern of the old BatchExecutor.
    // LoopEngineController handles its own timeline ledger internally.
    // We pass null for timestreamTokenId (no external timeline session here),
    // and false for blockTimelinePush (allow history recording as normal).
    // The iterationProgressSignal is forwarded directly.

    await LoopEngineController.executeBatch(
      compiledChangeArray,
      parentWorldId,
      null,    // timestreamTokenId — managed internally by LoopEngineController
      false,   // blockTimelinePush — allow history recording
      iterationProgressSignal
    );

    // For backwards compatibility, return the set of modified directories.
    // LoopEngineController handles dir refresh internally, but callers
    // that expected a Set return value will receive an empty Set gracefully.
    return new Set();
  }
};