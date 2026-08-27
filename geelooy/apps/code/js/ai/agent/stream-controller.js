// B"H

import { AgentTimeline } from './timeline-store.js';
import { autonomousCommitGate } from './autonomous-commit-gate.js';

/**
 * @file stream-controller.js
 * @description
 * B"H.
 *
 * A defensive adapter for AI streaming UIs.
 *
 * It does not assume a specific backend protocol.
 * It accepts events and converts them into timeline phases.
 *
 * Use it wherever the AI API stream is currently setting:
 * "waiting first spark"
 *
 * Instead of leaving the user in mist, call these methods as chunks/tool calls
 * arrive.
 */

/**
 * @class AgentStreamController
 * @description
 * B"H.
 *
 * Controls visible stream state and commit safety.
 */
export class AgentStreamController {
  /**
   * @constructor
   * @description
   * B"H.
   *
   * Creates the stream controller.
   *
   * @param {object} [options]
   * Options.
   *
   * @param {object} [options.timeline]
   * Timeline store.
   *
   * @param {object} [options.commitGate]
   * Commit gate.
   */
  constructor(options = {}) {
    this.timeline = options.timeline || AgentTimeline;
    this.commitGate = options.commitGate || autonomousCommitGate;
    this.hasFirstSpark = false;
    this.active = false;
  }

  /**
   * @method start
   * @description
   * B"H.
   *
   * Starts a run.
   *
   * @returns {void}
   * Nothing.
   */
  start() {
    this.active = true;
    this.hasFirstSpark = false;
    this.commitGate.reset();
    this.timeline.clear();
    this.timeline.start();
  }

  /**
   * @method receiveText
   * @description
   * B"H.
   *
   * Handles model text/thought deltas.
   *
   * @param {string} text
   * Text delta.
   *
   * @returns {void}
   * Nothing.
   */
  receiveText(text) {
    if (!this.active) this.start();
    this.hasFirstSpark = true;

    const trimmed = String(text || "").trim();

    if (trimmed) {
      this.timeline.thinking(trimmed.slice(0, 180));
    } else {
      this.timeline.betweenThoughts();
    }
  }

  /**
   * @method toolStart
   * @description
   * B"H.
   *
   * Handles tool-call start.
   *
   * @param {string} toolName
   * Tool name.
   *
   * @param {object} args
   * Tool args.
   *
   * @returns {void}
   * Nothing.
   */
  toolStart(toolName, args = {}) {
    if (!this.active) this.start();

    this.hasFirstSpark = true;
    this.timeline.tool(toolName, args);

    const file = args.path || args.file || args.filePath || args.targetPath;

    if (file && /write|edit|patch|create/i.test(toolName)) {
      this.commitGate.startFile(file);
    }
  }

  /**
   * @method toolFinish
   * @description
   * B"H.
   *
   * Handles tool-call completion.
   *
   * @param {string} toolName
   * Tool name.
   *
   * @param {object} args
   * Tool args.
   *
   * @param {object} result
   * Tool result.
   *
   * @returns {void}
   * Nothing.
   */
  toolFinish(toolName, args = {}, result = {}) {
    const file = args.path || args.file || args.filePath || args.targetPath;

    if (file && /write|edit|patch|create/i.test(toolName)) {
      this.commitGate.finishFile(file);
      this.timeline.push({
        type: args.kind === "new" ? "createFile" : "editFile",
        label: `Finished ${file}`,
        collapsed: true,
        file,
        details: result
      });
    }
  }

  /**
   * @method toolError
   * @description
   * B"H.
   *
   * Handles tool-call failure.
   *
   * @param {string} toolName
   * Tool name.
   *
   * @param {object} args
   * Tool args.
   *
   * @param {Error} error
   * Error object.
   *
   * @returns {void}
   * Nothing.
   */
  toolError(toolName, args = {}, error) {
    const file = args.path || args.file || args.filePath || args.targetPath;

    if (file) {
      this.commitGate.failFile(file, error && error.message ? error.message : String(error));
    }

    this.timeline.error(error);
  }

  /**
   * @method testsFinished
   * @description
   * B"H.
   *
   * Handles test result.
   *
   * @param {boolean} passed
   * Whether tests passed.
   *
   * @param {object} [details]
   * Test details.
   *
   * @returns {void}
   * Nothing.
   */
  testsFinished(passed, details = {}) {
    this.commitGate.markTests(passed);

    this.timeline.push({
      type: passed ? "testPass" : "testFail",
      label: passed ? "Tests passed" : "Tests failed",
      collapsed: passed,
      details
    });
  }

  /**
   * @method finish
   * @description
   * B"H.
   *
   * Marks the AI run complete.
   *
   * @param {string} [reason]
   * Completion reason.
   *
   * @returns {void}
   * Nothing.
   */
  finish(reason = "AI finished all file work") {
    this.active = false;
    this.commitGate.markAgentFinished(reason);
    this.timeline.done("AI finished all file work");
  }

  /**
   * @method fail
   * @description
   * B"H.
   *
   * Fails the AI run visibly.
   *
   * @param {Error|string} error
   * Error.
   *
   * @returns {void}
   * Nothing.
   */
  fail(error) {
    this.active = false;
    this.timeline.error(error);
  }
}

/**
 * @constant {AgentStreamController} agentStreamController
 * @description
 * B"H.
 *
 * Shared stream controller.
 */
export const agentStreamController = new AgentStreamController();