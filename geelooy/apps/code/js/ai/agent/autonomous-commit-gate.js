// B"H

/**
 * @file autonomous-commit-gate.js
 * @description
 * B"H.
 *
 * This module prevents premature GitHub pushes.
 *
 * The AI agent may read, edit, create, test, repair, and iterate.
 * But GitHub receives a commit only after the agent explicitly marks the file
 * work as finished.
 *
 * This is not magic AGI. It is a disciplined gate:
 * - track active file operations
 * - track test status
 * - track finalization
 * - allow commit only when safe
 */

/**
 * @class AutonomousCommitGate
 * @description
 * B"H.
 *
 * Commit safety gate for vibe-coding agent runs.
 */
export class AutonomousCommitGate {
  /**
   * @constructor
   * @description
   * B"H.
   *
   * Creates a gate in blocked state.
   */
  constructor() {
    this.reset();
  }

  /**
   * @method reset
   * @description
   * B"H.
   *
   * Resets the gate for a new agent run.
   *
   * @returns {void}
   * Nothing.
   */
  reset() {
    this.activeOperations = new Set();
    this.finishedFiles = new Set();
    this.failedFiles = new Set();
    this.testsPassed = false;
    this.agentFinished = false;
    this.finalReason = "";
  }

  /**
   * @method startFile
   * @description
   * B"H.
   *
   * Marks a file operation active.
   *
   * @param {string} path
   * File path.
   *
   * @returns {void}
   * Nothing.
   */
  startFile(path) {
    if (!path) return;
    this.activeOperations.add(path);
    this.finishedFiles.delete(path);
    this.failedFiles.delete(path);
    this.agentFinished = false;
  }

  /**
   * @method finishFile
   * @description
   * B"H.
   *
   * Marks a file operation finished.
   *
   * @param {string} path
   * File path.
   *
   * @returns {void}
   * Nothing.
   */
  finishFile(path) {
    if (!path) return;
    this.activeOperations.delete(path);
    this.finishedFiles.add(path);
  }

  /**
   * @method failFile
   * @description
   * B"H.
   *
   * Marks a file operation failed.
   *
   * @param {string} path
   * File path.
   *
   * @param {string} reason
   * Failure reason.
   *
   * @returns {void}
   * Nothing.
   */
  failFile(path, reason = "") {
    if (!path) return;
    this.activeOperations.delete(path);
    this.failedFiles.add(path);
    this.finalReason = reason;
  }

  /**
   * @method markTests
   * @description
   * B"H.
   *
   * Stores test status.
   *
   * @param {boolean} passed
   * Whether tests passed.
   *
   * @returns {void}
   * Nothing.
   */
  markTests(passed) {
    this.testsPassed = Boolean(passed);
  }

  /**
   * @method markAgentFinished
   * @description
   * B"H.
   *
   * Marks the agent's own file-writing loop as fully complete.
   *
   * @param {string} [reason]
   * Optional reason.
   *
   * @returns {void}
   * Nothing.
   */
  markAgentFinished(reason = "agent reported completion") {
    this.agentFinished = true;
    this.finalReason = reason;
  }

  /**
   * @method canCommit
   * @description
   * B"H.
   *
   * Determines whether GitHub commit is allowed.
   *
   * @param {object} [options]
   * Commit policy options.
   *
   * @param {boolean} [options.requireTests=false]
   * Whether passing tests are required.
   *
   * @returns {{ok: boolean, reason: string}}
   * Commit permission result.
   */
  canCommit(options = {}) {
    if (this.activeOperations.size) {
      return {
        ok: false,
        reason: `File operations still active: ${Array.from(this.activeOperations).join(", ")}`
      };
    }

    if (this.failedFiles.size) {
      return {
        ok: false,
        reason: `File operations failed: ${Array.from(this.failedFiles).join(", ")}`
      };
    }

    if (!this.agentFinished) {
      return {
        ok: false,
        reason: "Agent has not marked file work complete."
      };
    }

    if (options.requireTests && !this.testsPassed) {
      return {
        ok: false,
        reason: "Tests are required before commit and have not passed."
      };
    }

    return {
      ok: true,
      reason: this.finalReason || "Commit gate open."
    };
  }

  /**
   * @method assertCanCommit
   * @description
   * B"H.
   *
   * Throws unless commit is allowed.
   *
   * @param {object} [options]
   * Commit policy options.
   *
   * @returns {true}
   * True when commit is allowed.
   */
  assertCanCommit(options = {}) {
    const result = this.canCommit(options);

    if (!result.ok) {
      throw new Error(`[AutonomousCommitGate] GitHub push blocked: ${result.reason}`);
    }

    return true;
  }
}

/**
 * @constant {AutonomousCommitGate} autonomousCommitGate
 * @description
 * B"H.
 *
 * Shared commit gate.
 */
export const autonomousCommitGate = new AutonomousCommitGate();