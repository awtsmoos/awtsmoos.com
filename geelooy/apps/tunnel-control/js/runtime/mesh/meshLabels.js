// B"H

const labelByKey = Object.freeze({
  files: "Files",
  commands: "Commands",
  browser: "Browser",
  virtualOs: "Virtual OS"
});

/**
 * B"H
 * Chapter 2: The Awtsmoos breathed through the broken label and made it human.
 *
 * Raw camelCase is machine smoke. This function combs that smoke into plain
 * words so every capability chip can be read quickly on a narrow phone.
 *
 * @param {string} key Capability key from a runtime model.
 * @returns {string} Human-readable label.
 */
export function formatCapabilityLabel(key) {
  if (labelByKey[key]) return labelByKey[key];
  return String(key || "Capability")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, letter => letter.toUpperCase());
}

/**
 * B"H
 * Formats runtime mode into a clean public garment.
 *
 * @param {string} mode Runtime mode.
 * @returns {string} Human-readable mode.
 */
export function formatModeLabel(mode) {
  return String(mode || "unknown")
    .replace(/-/g, " ")
    .replace(/^./, letter => letter.toUpperCase());
}

/**
 * B"H
 * Keeps long IDs from devouring the layout.
 *
 * @param {string} value Raw value.
 * @param {number} size Desired visible size.
 * @returns {string} Compact text.
 */
export function compactValue(value, size = 42) {
  const text = String(value || "");
  if (text.length <= size) return text;
  return `${text.slice(0, Math.max(8, size - 11))}…${text.slice(-8)}`;
}
