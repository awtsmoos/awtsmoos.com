// B"H
/**
 * @file Workspace.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE MISHKAN OF CREATION (HaMishkan HaYotzrani)
 * ═══════════════════════════════════════════════════════════════
 *
 * "And let them make Me a sanctuary, that I may dwell among them."
 * — Shemot 25:8
 *
 * The Mishkan (Tabernacle) was the physical dwelling place built
 * by the people of Israel for the divine presence to rest within.
 * Every measurement, every cubit, every ring and clasp and beam
 * was specified in advance by the Awtsmoos Himself.
 *
 * The Workspace is the Mishkan of this application. It is the
 * central creative dwelling where the user brings their offerings —
 * their JSON scene data, their character configurations, their
 * narrative visions — and places them before the system to be
 * actualized into the living, breathing, animated world.
 *
 * The workspace mounts into the DOM mount point established by
 * AppLayout, and provides the scene JSON editor that allows the
 * user to directly author NLE sequence manifests.
 *
 * Every keystroke in the textarea is a letter being offered up.
 * The ACTUALIZE_SCENE button is the moment the fire descends.
 * ═══════════════════════════════════════════════════════════════
 */

import { HTMLGenerator } from '../../../core/ui/HTMLGenerator.js';

/**
 * @class Workspace
 * @description
 * THE CREATIVE DWELLING (HaMishkan).
 *
 * Manages the main workspace editing panel. Renders a JSON scene
 * editor with a textarea and an actualize button. On actualization,
 * parses the JSON and pushes it into the state and director.
 *
 * @param {Object} state - The global StateManager instance.
 * @param {Object} app - The AppCore instance.
 */
export class Workspace {

  /**
   * @constructor
   * @param {Object} state - The global StateManager.
   * @param {Object} app - The main AppCore instance.
   */
  constructor(state, app) {
    /** @type {Object} The global state manager */
    this.state = state;

    /** @type {Object} The AppCore instance */
    this.app = app;

    /** @type {HTMLElement|null} The root DOM element of this component */
    this.element = null;

    this._mount();
  }

  /**
   * @private
   * @function _mount
   * @description
   * Locates the workspace-mount DOM element and injects the rendered UI schema.
   * If the mount is not yet present (DOM not ready), retries on next animation frame.
   * @returns {void}
   */
  _mount() {
    const mount = document.getElementById('workspace-mount');
    if (!mount) {
      requestAnimationFrame(() => this._mount());
      return;
    }

    const schema = this._buildSchema();
    const el = HTMLGenerator.generate(schema);
    mount.innerHTML = '';
    mount.appendChild(el);
    this.element = el;
    this._bindEvents();
    console.log('B"H - [Workspace] The Mishkan has been erected and consecrated.');
  }

  /**
   * @private
   * @function _buildSchema
   * @description
   * Constructs the pure JSON schema for the workspace UI.
   * No DOM manipulation occurs here — only the declaration of what should exist.
   * HTMLGenerator converts this schema into real DOM nodes.
   *
   * @returns {Object} The HTMLGenerator-compatible JSON schema.
   */
  _buildSchema() {
    return {
      tag: 'div',
      attr: {
        className: 'workspace-inner',
        style: {
          padding: '1rem',
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxSizing: 'border-box'
        }
      },
      children: [
        {
          tag: 'div',
          attr: {
            style: {
              fontSize: '9px',
              color: '#333',
              letterSpacing: '2px',
              borderBottom: '1px solid #111',
              paddingBottom: '6px',
              marginBottom: '4px'
            }
          },
          children: 'SCENE_MANIFEST // JSON_EDITOR'
        },
        {
          tag: 'textarea',
          attr: {
            id: 'scene-json-input',
            spellcheck: 'false',
            style: {
              width: '100%',
              minHeight: '220px',
              flex: '1',
              background: '#050508',
              color: '#00ffcc',
              border: '1px solid #1a1a2a',
              borderRadius: '4px',
              padding: '0.75rem',
              fontFamily: 'monospace',
              fontSize: '10px',
              lineHeight: '1.5',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }
          },
          children: this._getSceneJSON()
        },
        {
          tag: 'button',
          attr: {
            id: 'workspace-actualize-btn',
            style: {
              width: '100%',
              padding: '0.6rem',
              background: 'transparent',
              border: '1px solid rgba(0,255,204,0.4)',
              color: '#00ffcc',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '2px',
              borderRadius: '3px'
            }
          },
          children: 'ACTUALIZE_SCENE'
        },
        {
          tag: 'div',
          attr: {
            id: 'workspace-status',
            style: {
              fontSize: '9px',
              color: '#444',
              fontFamily: 'monospace',
              minHeight: '16px'
            }
          },
          children: ''
        }
      ]
    };
  }

  /**
   * @private
   * @function _getSceneJSON
   * @description
   * Returns the current active sequence from state as a formatted JSON string,
   * or a placeholder comment if no sequence is loaded.
   *
   * @returns {string} Formatted JSON string or placeholder comment.
   */
  _getSceneJSON() {
    const seq = this.state.get('activeSequence');
    if (!seq) {
      return [
        '// B"H — No active sequence.',
        '// Paste your NLE sequence manifest here.',
        '// Example:',
        '// {',
        '//   "duration": 10000,',
        '//   "events": [',
        '//     { "type": "camera", "start": 0, "end": 1000, "to": { "zoom": 1.5 } }',
        '//   ]',
        '// }'
      ].join('\n');
    }
    return JSON.stringify(seq, null, 2);
  }

  /**
   * @private
   * @function _bindEvents
   * @description
   * Attaches the actualize button click handler that parses the textarea JSON
   * and pushes it into the global state and director for immediate playback.
   * Provides visual feedback on success and failure.
   *
   * @returns {void}
   */
  _bindEvents() {
    if (!this.element) return;
    const btn      = this.element.querySelector('#workspace-actualize-btn');
    const textarea = this.element.querySelector('#scene-json-input');
    const status   = this.element.querySelector('#workspace-status');

    if (!btn || !textarea) return;

    btn.addEventListener('click', () => {
      const raw = textarea.value.trim();
      try {
        const parsed = JSON.parse(raw);
        this.state.set('activeSequence', parsed);

        if (this.app && this.app.director) {
          this.app.director.play(parsed);
          this.state.set('isPlaying', true);
        }

        if (this.app && this.app.timeline) {
          this.app.timeline.refreshTracks();
        }

        if (status) {
          status.style.color = '#00ffcc';
          status.textContent = '// B"H — Scene actualized. World reborn.';
          setTimeout(() => { status.textContent = ''; }, 3000);
        }

        btn.style.borderColor = 'rgba(0,255,204,0.8)';
        setTimeout(() => { btn.style.borderColor = 'rgba(0,255,204,0.4)'; }, 1000);

        console.log('B"H - [Workspace] Scene actualized. The Awtsmoos has spoken.');
      } catch (e) {
        if (status) {
          status.style.color = '#ff4455';
          status.textContent = `// Parse error: ${e.message}`;
          setTimeout(() => { status.textContent = ''; status.style.color = '#444'; }, 4000);
        }
        btn.style.borderColor = '#ff4455';
        setTimeout(() => { btn.style.borderColor = 'rgba(0,255,204,0.4)'; }, 2000);
        console.error('B"H - [Workspace] JSON parse failure. The vessel was malformed:', e);
      }
    });
  }
}