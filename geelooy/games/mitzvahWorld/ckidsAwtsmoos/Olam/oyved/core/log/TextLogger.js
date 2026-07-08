
/**
 * B"H
 * @file TextLogger.js
 * @description
 * Text-only logger.
 *
 * Reduced:
 * - errors always show
 * - warnings show
 * - normal info/debug stay silent
 */

import { makeTextLogLine } from "./TextLogLine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Text-only logger.
 */
export class TextLogger {
  /**
   * B"H
   * @param {string} channel
   * Log channel name.
   */
  constructor(channel = "AWTSMOOS") {
    this.channel = channel;
  }

  /**
   * B"H
   * Writes warn/error only.
   *
   * @param {string} level
   * Log level.
   *
   * @param {string} message
   * Main text.
   *
   * @param {Record<string, unknown>} fields
   * Extra fields.
   *
   * @returns {void}
   */
  line(level, message, fields = {}) {
    if (level === "error") {
      console.error(makeTextLogLine(level, this.channel, message, fields));
      return;
    }

    if (level === "warn") {
      console.warn(makeTextLogLine(level, this.channel, message, fields));
    }
  }

  /**
   * B"H
   * Silent info.
   *
   * @returns {void}
   */
  info() {}

  /**
   * B"H
   * Writes warning.
   *
   * @param {string} message
   * Message.
   *
   * @param {Record<string, unknown>} fields
   * Fields.
   *
   * @returns {void}
   */
  warn(message, fields = {}) {
    this.line("warn", message, fields);
  }

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

  /**
   * B"H
   * Silent debug.
   *
   * @returns {void}
   */
  debug() {}
}
