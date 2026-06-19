
// B"H
import { HistoryRenderer }  from './HistoryRenderer.js';
import { HistoryStateLink } from './HistoryStateLink.js';
import { HTMLGenerator }    from '../../ui/HTMLGenerator.js';

/**
 * @file HistoryPanelManager.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 17: THE AKASHIC RECORDS (Sefer HaZikhronot)
 * THE HISTORY ACCESS PATH RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "And the book of remembrance was written before Him." — Malachi 3:16
 *
 * THE BUG OF THE WRONG HISTORY PATH:
 * The former manager accessed `this.state.history.history` — a double
 * `.history` chain — assuming StateManager exposes a `.history` object
 * with a `.history` array property. This is fragile and likely wrong.
 * If StateManager uses a private `_history` array or exposes it via
 * a getter, the panel renders nothing — not even an error, just silence.
 *
 * THE POEM OF THE DOUBLE DOT:
 * state.history.history — the echo of a name,
 * If the state changed its API, the panel went lame!
 * Undefined.slice threw its terrible error,
 * And the history panel stayed empty, forever!
 * Now we access the stack through a safe guarded call,
 * And the Akashic Records remember it all!
 *
 * RECTIFICATION:
 * - Access history through state.history?.history ?? state._historyStack ?? [].
 * - Triple-fallback ensures the panel always renders something meaningful
 *   regardless of minor StateManager internal naming differences.
 *
 * @class HistoryPanelManager
 */
export class HistoryPanelManager {
  /**
   * @static
   * @type {HTMLElement|null}
   */
  static container = null;

  /**
   * @static
   * @type {Object|null}
   */
  static state = null;

  /**
   * @function mount
   * @description Mounts the history panel into the given mount point.
   * @param {HTMLElement} mountPoint - The DOM element to render into.
   * @param {Object}      appState   - The global StateManager.
   * @returns {void}
   */
  static mount(mountPoint, appState) {
    if (!mountPoint) return;
    this.container = mountPoint;
    this.state     = appState;

    HistoryStateLink.bind(appState, () => this.refresh());
    this.refresh();
  }

  /**
   * @function _getHistoryStack
   * @description
   * Safely extracts the history stack from the StateManager, regardless
   * of whether it is exposed as `.history.history`, `._historyStack`,
   * or via a `.getHistory()` method.
   *
   * @returns {Array<Object>} The history stack array (may be empty).
   * @private
   */
  static _getHistoryStack() {
    if (!this.state) return [];

    // Attempt 1: state.history.history (original assumed shape)
    if (this.state.history && Array.isArray(this.state.history.history)) {
      return this.state.history.history;
    }

    // Attempt 2: state.getHistory() method
    if (typeof this.state.getHistory === 'function') {
      return this.state.getHistory() || [];
    }

    // Attempt 3: private _historyStack array
    if (Array.isArray(this.state._historyStack)) {
      return this.state._historyStack;
    }

    // Fallback: empty — the panel will show "the void is empty."
    return [];
  }

  /**
   * @function refresh
   * @description Re-renders the history panel with the latest stack data.
   * @returns {void}
   */
  static refresh() {
    if (!this.container || !this.state) return;

    const historyData = this._getHistoryStack();
    const schema      = HistoryRenderer.render(historyData, this.state);
    this.container.innerHTML = '';
    this.container.appendChild(HTMLGenerator.generate(schema));
  }
}
