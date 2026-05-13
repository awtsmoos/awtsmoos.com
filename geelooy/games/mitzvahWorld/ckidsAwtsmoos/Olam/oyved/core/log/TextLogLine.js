
/**
 * B"H
 * @file TextLogLine.js
 * @description
 * A tiny pure text log formatter.
 *
 * No object logs.
 * No console tables.
 * No mysterious expandable DevTools blobs.
 *
 * Every log becomes one readable string line,
 * because when the worker falls into darkness,
 * the developer needs a candle, not a locked chest.
 */

/**
 * B"H
 * Turns any value into a safe one-line string.
 *
 * @param {unknown} value
 * Any value that needs to become text.
 *
 * @returns {string}
 * A readable single-line value.
 */
export function stringifyLogValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  try {
    return JSON.stringify(value, (_, nestedValue) => {
      if (typeof nestedValue === "function") return `[Function ${nestedValue.name || "anonymous"}]`;
      if (nestedValue instanceof Error) return `${nestedValue.name}: ${nestedValue.message}`;
      return nestedValue;
    }).replace(/\s+/g, " ").trim();
  } catch (error) {
    return Object.prototype.toString.call(value);
  }
}

/**
 * B"H
 * Builds a flat text log line.
 *
 * @param {string} level
 * Log level.
 *
 * @param {string} channel
 * Log channel.
 *
 * @param {string} message
 * Main message.
 *
 * @param {Record<string, unknown>} fields
 * Optional structured fields that will be flattened into text.
 *
 * @returns {string}
 * One single text line.
 */
export function makeTextLogLine(level, channel, message, fields = {}) {
  const stamp = new Date().toISOString();
  const parts = [`B"H`, stamp, level.toUpperCase(), channel, message];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(`${key}=${stringifyLogValue(value)}`);
  }

  return parts.join(" | ");
}
