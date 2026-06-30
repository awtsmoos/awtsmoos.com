import { bindTouchActionButton } from './touchButtonBinding.js';

/**
 * B"H
 * Wires every visible mobile action button.
 *
 * The public function stays tiny so the controls folder is split and readable.
 * Each button owns its pointer lifecycle in `touchButtonBinding.js`, where the
 * rapid-punch ghost state is forced to clear on release or cancellation.
 *
 * @param {Document} doc - Document containing data-act buttons.
 * @param {object} state - Mutable input state used by the combat loop.
 */
export function touchButtons(doc, state) {
  doc.querySelectorAll('[data-act]').forEach(button => {
    bindTouchActionButton(doc, button, state);
  });
}
