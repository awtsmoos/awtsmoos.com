// B"H
/**
 * @file PrioritiesPanel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE ORDER OF PRIORITIES (Seder HaEmdot)
 * ═══════════════════════════════════════════════════════════════
 *
 * In the Kabbalistic system of Seder Hishtalshelus (the chain of
 * emanation), every created being has its precise rank, its exact
 * position in the hierarchy, its specific Sefira through which
 * the divine light flows into it and sustains it.
 *
 * Nothing exists randomly. The stone does not happen to be heavier
 * than the feather — its weight is a precise divine decree encoded
 * in the letter-combinations (At-Bash, Albam) that form the word
 * "Even" (stone) from the original ten statements of creation.
 *
 * The PrioritiesPanel displays this hierarchy for the active souls
 * in the scene. Characters are listed in their order. Their current
 * state (speaking, walking, idle) is shown. A living dashboard of
 * the divine chain of emanation made visible to the human user.
 *
 * A glowing teal dot indicates an active speaking state.
 * A dim dot indicates rest — but the Awtsmoos still sustains them.
 * ═══════════════════════════════════════════════════════════════
 */

import { Component } from '../../../core/ui/Component.js';
import { HTMLGenerator } from '../../../core/ui/HTMLGenerator.js';

/**
 * @class PrioritiesPanel
 * @description
 * THE HIERARCHY DISPLAY (Tziyur HaDareg).
 *
 * Renders a live list of all active character souls in the current
 * scene, showing their ID, archetype, and behavioral state.
 * Extends Component for consistent lifecycle management.
 *
 * @extends Component
 * @param {Object} state - The global StateManager instance.
 */
export class PrioritiesPanel extends Component {

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
   * Generates the HTMLGenerator-compatible JSON schema for the priorities panel.
   * Reads characters from state and produces a styled list of soul entries.
   * Pure data output — no direct DOM manipulation.
   *
   * @returns {Object} The JSON schema for HTMLGenerator.
   */
  render() {
    const chars   = this.state.get('characters') || {};
    const charIds = Object.keys(chars);

    /** @type {Array<Object>} Schema nodes for each character entry */
    const charItems = charIds.map(id => {
      const c      = chars[id];
      const active = c.isTalking || c.isDancing || c.isWalking;

      /** @type {string} Behavioral state label text */
      const stateLabel = c.isTalking  ? 'SPEAKING'
                       : c.isDancing  ? 'DANCING'
                       : c.isWalking  ? 'WALKING'
                       : c.isDrinking ? 'DRINKING'
                       : c.isWaving   ? 'WAVING'
                       : 'IDLE';

      /** @type {string} Dot color — teal when active, dim when idle */
      const dotColor = active ? '#00ffcc' : '#2a2a2a';

      return {
        tag: 'div',
        attr: {
          className: 'priority-item',
          dataset: { charId: id },
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 8px',
            borderBottom: '1px solid #0d0d0d',
            cursor: 'pointer',
            fontSize: '9px',
            color: active ? '#888' : '#444',
            transition: 'background 0.2s'
          }
        },
        children: [
          {
            tag: 'div',
            attr: {
              style: {
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: dotColor,
                flexShrink: '0',
                boxShadow: active ? '0 0 6px #00ffcc88' : 'none',
                transition: 'all 0.3s'
              }
            }
          },
          {
            tag: 'span',
            attr: {
              style: {
                flex: '1',
                fontFamily: 'monospace',
                letterSpacing: '0.5px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            },
            children: `${id.toUpperCase()} // ${(c.archetype || 'SOUL').toUpperCase()}`
          },
          {
            tag: 'span',
            attr: {
              style: {
                color: active ? '#00ffcc55' : '#222',
                fontSize: '8px',
                fontFamily: 'monospace',
                letterSpacing: '1px',
                flexShrink: '0'
              }
            },
            children: stateLabel
          }
        ]
      };
    });

    /** @type {Object} Empty state fallback node */
    const emptyNode = {
      tag: 'div',
      attr: {
        style: {
          padding: '10px 8px',
          fontSize: '9px',
          color: '#222',
          fontFamily: 'monospace'
        }
      },
      children: '// NO SOULS MANIFESTED'
    };

    return {
      tag: 'div',
      attr: {
        className: 'priorities-panel',
        style: {
          borderTop: '1px solid #111',
          flexShrink: '0',
          maxHeight: '220px',
          overflowY: 'auto'
        }
      },
      children: [
        {
          tag: 'div',
          attr: {
            style: {
              padding: '5px 8px',
              fontSize: '8px',
              color: '#333',
              letterSpacing: '2px',
              borderBottom: '1px solid #0d0d0d',
              background: '#050508'
            }
          },
          children: 'SOUL_HIERARCHY'
        },
        ...(charIds.length > 0 ? charItems : [emptyNode])
      ]
    };
  }
}