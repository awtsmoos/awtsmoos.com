
/**
 * B"H
 * @file MainTextLogLine.js
 * @description
 * Main thread text-only log formatter.
 */

/**
 * B"H
 * Flattens a value.
 *
 * @param {unknown} value
 * Value.
 *
 * @returns {string}
 * Text.
 */
export function mainLogValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();

  try {
    return JSON.stringify(value).replace(/\s+/g, " ").trim();
  } catch (error) {
    return String(value);
  }
}

/**
 * B"H
 * Creates main thread log line.
 *
 * @param {string} level
 * Level.
 *
 * @param {string} channel
 * Channel.
 *
 * @param {string} message
 * Message.
 *
 * @param {Record<string, unknown>} fields
 * Fields.
 *
 * @returns {string}
 * One line.
 */
export function makeMainTextLine(level, channel, message, fields = {}) {
  const parts = [`B"H`, new Date().toISOString(), level.toUpperCase(), channel, message];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(`${key}=${mainLogValue(value)}`);
  }

  return parts.join(" | ");
}
