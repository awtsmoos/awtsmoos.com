
/**
 * B"H
 * @file MainTextLogger.js
 * @description
 * Main thread text-only logger.
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
   * Writes a line.
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
    const method = console[level] ? level : "log";
    console[method](makeMainTextLine(level, this.channel, message, fields));
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
}

/**
 * B"H
 * Worker manager logger.
 */
export const oyvedManagerLog = new MainTextLogger("OYVED_MANAGER");
