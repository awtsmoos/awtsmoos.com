//B"H

/**
 * B"H
 * Button forge. A command in the archive is no longer a cramped glyph smashed
 * against text; it is a clear gate with icon, label, intent, and room to breathe.
 * @param {object} spec Command description.
 * @param {string} spec.icon Visual symbol.
 * @param {string} spec.label Human label.
 * @param {string} spec.title Tooltip.
 * @param {string} spec.action Action key for handlers.
 * @param {object} spec.track Optional track payload.
 * @param {Function} spec.onAction Action callback.
 * @param {boolean} spec.disabled Initial disabled state.
 * @returns {HTMLButtonElement} Command button.
 */
export function createCommandButton({ icon, label, title, action, track, onAction, disabled = false }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = title || label;
  button.dataset.action = action;
  button.className = `mini-btn command-btn mini-${action}`;
  button.innerHTML = `<span class="cmd-icon">${icon}</span><span class="cmd-label">${label}</span>`;
  button.disabled = Boolean(disabled);
  button.onclick = event => {
    event.stopPropagation();
    onAction?.(action, track);
  };
  return button;
}

/**
 * B"H
 * Tiny text vessel for durations, kept separate so rows remain readable.
 * @param {string} text Already formatted duration.
 * @returns {HTMLSpanElement} Duration node.
 */
export function durationPill(text) {
  const span = document.createElement('span');
  span.className = 't-dur';
  span.textContent = text;
  return span;
}
