// B"H
/**
 * @file AIPanel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE ORACLE PANEL (Luchot HaNavi)
 * ═══════════════════════════════════════════════════════════════
 *
 * "And the Lord spoke to Moses face to face, as a man speaks
 *  to his friend." — Shemot 33:11
 *
 * The Prophet stands before the Infinite and receives revelation —
 * not as fragmented data packets, but as a direct, intimate,
 * face-to-face communication. The AI Panel is the earthly analog.
 *
 * The user types their creative vision (or speaks it via the
 * Web Speech API microphone button), and the oracle receives it —
 * processing the request through the neural lattice of the AI —
 * and returns a fully-formed NLE sequence manifest as revelation.
 *
 * The panel is built from sub-components assembled by AILayout:
 *   AIHeader        — The title and branding strip
 *   AITextArea      — The prompt input textarea
 *   AIVoiceButton   — The microphone toggle (Web Speech API)
 *   AIGenerateButton — The "Receive Revelation" submit button
 *   AIStatus        — The status indicator (loading, error, done)
 *
 * AIPanel is the Keter of the AI sub-system — the crown that
 * unites all sub-components and provides the external interface
 * for AppUI to mount and bind the oracle in the sidebar.
 * ═══════════════════════════════════════════════════════════════
 */

import { AILayout } from './layout/AILayout.js';
import { AIEvents } from './events/AIEvents.js';

/**
 * @class AIPanel
 * @description
 * THE INTERFACE OF THE ORACLE (Panim HaNavi).
 *
 * A static class providing two operations:
 *   render() — Returns the HTML string for the entire AI panel UI.
 *   bind(app) — Wires interactive events after the panel is in the DOM.
 *
 * This separation (render then bind) matches the lifecycle used by
 * AppUI.setup(), which injects innerHTML and then calls bind separately.
 */
export class AIPanel {

  /**
   * @static
   * @function render
   * @description
   * Returns the complete HTML markup string for the AI oracle panel.
   * All sub-components are assembled through AILayout.render().
   * This string is injected via innerHTML by AppUI into the sidebar.
   *
   * @returns {string} The full HTML markup of the AI oracle panel.
   */
  static render() {
    return AILayout.render();
  }

  /**
   * @static
   * @function bind
   * @description
   * Binds all interactive events to the AI panel's DOM elements
   * after they have been injected into the live DOM.
   * Delegates the full binding logic to AIEvents.bind(app).
   *
   * Binding is separate from rendering to allow AppUI to inject
   * the HTML string and then attach events in a predictable sequence,
   * avoiding the need for live NodeLists or MutationObservers.
   *
   * @param {Object} app - The AppCore instance, passed through to AIEvents.
   * @returns {void}
   */
  static bind(app) {
    AIEvents.bind(app);
  }
}