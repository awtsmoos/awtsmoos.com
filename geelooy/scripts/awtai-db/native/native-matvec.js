// B"H

const path = require('path');

let addon = null;
let loadError = null;

/**
 * Native Q2_K projection bridge.
 *
 * A narrow iron gate: if the compiled addon is present, the packed tensor
 * row is consumed by C; if not, the older JS vessel keeps speaking.  No
 * silence, no fake victory, only explicit availability.
 */
function getAddon() {
  if (addon || loadError) return addon;
  try {
    addon = require(path.join(__dirname, 'awtai_native.node'));
  } catch (error) {
    loadError = error;
  }
  return addon;
}

function nativeProjectRows(raw, type, rows, cols, input) {
  const native = getAddon();
  if (!native || type !== 10) return null;
  return native.projectRows(raw, type, rows, cols, input);
}

function nativeStatus() {
  return { active: !!getAddon(), error: loadError ? String(loadError.message || loadError) : null };
}

module.exports = { nativeProjectRows, nativeStatus };
