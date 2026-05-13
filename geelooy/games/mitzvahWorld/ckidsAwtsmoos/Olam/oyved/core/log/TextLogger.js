
/**
 * B"H
 * @file TextLogger.js
 * @description
 * Text-only logger for worker boot.
 *
 * This refuses object logs on purpose.
 * The console should read like a scroll:
 * one line, one meaning, one flame.
 */

import { makeTextLogLine } from "./TextLogLine.js";

/**
 * B"H
 * Console method map.
 */
const CONSOLE_METHODS = Object.freeze({
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error"
});

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
   * Writes a line.
   *
   * @param {string} level
   * Log level.
   *
   * @param {string} message
   * Main text.
   *
   * @param {Record<string, unknown>} fields
   * Extra fields flattened into text.
   *
   * @returns {void}
   */
  line(level, message, fields = {}) {
    const method = CONSOLE_METHODS[level] || "log";
    const line = makeTextLogLine(level, this.channel, message, fields);
    console[method](line);
  }

  /**
   * B"H
   * @param {string} message
   * Message.
   *
   * @param {Record<string, unknown>} fields
   * Fields.
   *
   * @returns {void}
   */
  info(message, fields = {}) {
    this.line("info", message, fields);
  }

  /**
   * B"H
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
   * @param {string} message
   * Message.
   *
   * @param {Record<string, unknown>} fields
   * Fields.
   *
   * @returns {void}
   */
  debug(message, fields = {}) {
    this.line("debug", message, fields);
  }
}
