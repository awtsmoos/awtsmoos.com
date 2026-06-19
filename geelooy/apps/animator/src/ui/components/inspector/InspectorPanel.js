// B"H
/**
 * @file InspectorPanel.js  — src/ui/components/inspector/InspectorPanel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE INSPECTOR OF SOULS (HaBodek HaNeshamot)
 * ═══════════════════════════════════════════════════════════════
 *
 * In the Heavenly Tribunal, every created being is inspected —
 * its deeds, its intentions, its inner essence — all laid bare
 * before the court. No concealment is possible in that realm.
 *
 * The InspectorPanel is its earthly analog. When a clip-spark
 * is selected in the NLE, its full event data object — every key,
 * every value, every nested property — is laid bare in this panel
 * for the user (the Beit Din) to examine and modify.
 *
 * IMPORTANT: This is the RIGHT-SIDE inspector at the component path
 * src/ui/components/inspector/InspectorPanel.js — distinct from the
 * sidebar version at src/ui/components/sidebar/InspectorPanel.js.
 * This version is the full, production inspector with the static
 * show() method called by ClipSelector.
 * ═══════════════════════════════════════════════════════════════
 */

import { Component } from '../../../core/ui/Component.js';

/**
 * @class InspectorPanel
 * @description
 * THE PROPERTIES INSPECTOR (Bodek HaTkhunim).
 *
 * Renders a contextual properties panel that populates dynamically
 * when a clip is selected in the NLE via ClipSelector.
 * Also provides a static show() method for direct imperative calls.
 *
 * @extends Component
 * @param {Object} state - The global StateManager.
 */
export class InspectorPanel extends Component {

  /**
   * @constructor
   * @param {Object} state - The global StateManager.
   */
  constructor(state) {
    super(state);
  }

  /**
   * @function render
   * @description
   * Generates the empty inspector shell schema.
   * The inner content (#inspector-content) is populated dynamically
   * by the static show() method when clips are selected.
   *
   * @returns {Object} HTMLGenerator schema for the empty inspector container.
   */
  render() {
    return {
      tag: 'div',
      attr: {
        id: 'inspector-panel-root',
        className: 'inspector-panel',
        style: {
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }
      },
      children: [
        {
          tag: 'div',
          attr: {
            style: {
              fontSize: '8px',
              color: '#333',
              letterSpacing: '2px',
              borderBottom: '1px solid #111',
              paddingBottom: '6px'
            }
          },
          children: 'INSPECTOR // SELECT A CLIP IN THE NLE'
        },
        {
          tag: 'div',
          attr: {
            id: 'inspector-content',
            style: {
              fontSize: '9px',
              color: '#333',
              fontFamily: 'monospace',
              lineHeight: '1.6',
              whiteSpace: 'pre'
            }
          },
          children: '// No entity selected.\n// Click a clip in the NLE\n// to inspect its inner essence.'
        }
      ]
    };
  }

  /**
   * @static
   * @function show
   * @description
   * Populates the inspector content area with the formatted properties
   * of a selected NLE event. Called by ClipSelector on click.
   *
   * Renders a labeled key-value table of all event properties,
   * with color-coding for property keys vs values.
   *
   * @param {Object}      eventData - The NLE event data to display.
   * @param {HTMLElement} container - The DOM element to populate (prop-content area).
   * @param {Object}      state     - The global StateManager.
   * @param {Object}      app       - The AppCore instance.
   * @returns {void}
   */
  static show(eventData, container, state, app) {
    if (!container || !eventData) return;

    /** @type {string} The event type label, uppercased */
    const typeLabel = (eventData.type || 'UNKNOWN').toUpperCase();

    /** @type {string} The event ID or dash if absent */
    const idLabel = eventData.id || '—';

    /**
     * @type {string[]} Array of HTML row strings for each property
     */
    const rows = Object.entries(eventData).map(([key, val]) => {
      const displayVal = typeof val === 'object'
        ? JSON.stringify(val, null, 0)
        : String(val);

      return `
        <div style="display:flex; gap:8px; align-items:flex-start; border-bottom:1px solid #0d0d0d; padding:4px 0;">
          <span style="color:#444; flex-shrink:0; width:70px; font-size:8px; padding-top:1px; letter-spacing:0.5px;">
            ${key}
          </span>
          <span style="color:#00ffcc; font-family:monospace; font-size:9px; word-break:break-all; line-height:1.5;">
            ${displayVal}
          </span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="font-size:8px; color:#444; letter-spacing:2px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #111;">
        TYPE: <span style="color:#00ffcc;">${typeLabel}</span>
        &nbsp;&nbsp;ID: <span style="color:#888;">${idLabel}</span>
      </div>
      <div style="display:flex; flex-direction:column;">
        ${rows.join('')}
      </div>
    `;
  }
}