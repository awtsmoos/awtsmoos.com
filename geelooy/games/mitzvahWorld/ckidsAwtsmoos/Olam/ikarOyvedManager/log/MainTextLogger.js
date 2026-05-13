
/**
 * B"H
 * @file MainTextLogger.js
 * @description
 * Main thread text-only logger.
 *
 * Logs only errors.
 */

import { makeMainTextLine } from "./MainTextLogLine.js";

/**
 * B"H
 * Main thread text-only logger.
 */
export class MainTextLogger {
  /**
   * B"H
   * @param {string} channel
   * Channel.
   */
  constructor(channel = "MAIN") {
    this.channel = channel;
  }

  /**
   * B"H
   * Writes only errors.
   *
   * @param {string} level
   * Level.
   *
   * @param {string} message
   * Message.
   *
   * @param {Record<string, unknown>} fields
   * Fields.
   *
   * @returns {void}
   */
  line(level, message, fields = {}) {
    if (level !== "error") return;

    console.error(makeMainTextLine(level, this.channel, message, fields));
  }

  /**
   * B"H
   * Suppressed.
   *
   * @returns {void}
   */
  info() {}

  /**
   * B"H
   * Suppressed.
   *
   * @returns {void}
   */
  warn() {}

  /**
   * B"H
   * Writes error.
   *
   * @param {string} message
   * Message.
   *
   * @param {Record<string, unknown>} fields
   * Fields.
   *
   * @returns {void}
   */
  error(message, fields = {}) {
    this.line("error", message, fields);
  }
}

/**
 * B"H
 * Worker manager logger.
 */
export const oyvedManagerLog = new MainTextLogger("OYVED_MANAGER");
