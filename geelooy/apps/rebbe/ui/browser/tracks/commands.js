//B"H

/**
 * B"H
 * Command forge. A button in the archive is not a cramped accidental glyph; it
 * is a readable gate with icon, label, action key, variant, disabled law, and a
 * touch target large enough for the hand that seeks a sicha.
 * @param {object} spec Button description.
 * @param {string} spec.icon Visual sign.
 * @param {string} spec.label Human command label.
 * @param {string} spec.title Tooltip/title text.
 * @param {string} spec.action Stable action key.
 * @param {object} spec.track Optional track payload.
 * @param {Function} spec.onAction Action callback.
 * @param {boolean} spec.disabled Disabled state.
 * @param {string} spec.variant Visual command family.
 * @returns {HTMLButtonElement} Rendered command gate.
 */
export function createCommandButton({ icon = '', label = '', title = '', action = '', track, onAction, disabled = false, variant = 'neutral' } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = title || label || action;
  button.dataset.action = action;
  button.className = ['mini-btn', 'command-btn', `mini-${action}`, `cmd-${variant}`].join(' ');
  button.disabled = Boolean(disabled);
  button.append(commandCell('cmd-icon', icon), commandCell('cmd-label', label));
  button.onclick = event => { event.stopPropagation(); if (!button.disabled) onAction?.(action, track); };
  return button;
}

/**
 * B"H
 * Duration pill: a quiet spark beside row commands, showing the time-vessel
 * without stealing the command language.
 * @param {string} text Already formatted duration.
 * @returns {HTMLSpanElement} Duration node.
 */
export function durationPill(text) {
  const span = document.createElement('span');
  span.className = 't-dur';
  span.textContent = text;
  return span;
}

function commandCell(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}
