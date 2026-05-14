// B"H

import { AgentTimeline } from '../agent/timeline-store.js';

/**
 * @file timeline-view.js
 * @description
 * B"H.
 *
 * Collapsed-first visual timeline for the AI agent.
 *
 * The UI should not freeze on "waiting first spark".
 * It should show the exact current motion:
 * Reading.
 * Editing.
 * Creating.
 * Testing.
 * Committing.
 * Done.
 *
 * Details are present, but folded, so the user sees clarity first and depth
 * only when expanding.
 */

/**
 * @function escapeHtml
 * @description
 * B"H.
 *
 * Escapes HTML text.
 *
 * @param {any} value
 * Input value.
 *
 * @returns {string}
 * Escaped text.
 */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("&lt;", "&amp;lt;")
    .replaceAll("&gt;", "&amp;gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * @function stringifyDetails
 * @description
 * B"H.
 *
 * Turns details into readable text.
 *
 * @param {any} details
 * Details object.
 *
 * @returns {string}
 * Pretty text.
 */
function stringifyDetails(details) {
  if (!details) return "";
  try {
    return JSON.stringify(details, null, 2);
  } catch (error) {
    return String(details);
  }
}

/**
 * @function renderEvent
 * @description
 * B"H.
 *
 * Renders one timeline event.
 *
 * @param {object} event
 * Timeline event.
 *
 * @returns {string}
 * HTML.
 */
function renderEvent(event) {
  const details = event.details || event.error || null;
  const openAttr = event.collapsed ? "" : " open";
  const file = event.file ? `<div class="agent-phase-file">${escapeHtml(event.file)}</div>` : "";

  return `
    <details class="agent-phase agent-phase-${escapeHtml(event.tone)}"${openAttr}>
      <summary>
        <span class="agent-phase-dot"></span>
        <span class="agent-phase-label">${escapeHtml(event.label)}</span>
        <span class="agent-phase-time">${escapeHtml(new Date(event.at).toLocaleTimeString())}</span>
      </summary>
      ${file}
      ${details ? `<pre class="agent-phase-details">${escapeHtml(stringifyDetails(details))}</pre>` : ""}
    </details>
  `;
}

/**
 * @class AgentTimelineView
 * @description
 * B"H.
 *
 * DOM renderer for the timeline store.
 */
export class AgentTimelineView {
  /**
   * @constructor
   * @description
   * B"H.
   *
   * Creates the view.
   *
   * @param {HTMLElement} root
   * Root element.
   *
   * @param {object} [store]
   * Timeline store.
   */
  constructor(root, store = AgentTimeline) {
    this.root = root;
    this.store = store;
    this.unsubscribe = null;
  }

  /**
   * @method mount
   * @description
   * B"H.
   *
   * Mounts the timeline.
   *
   * @returns {void}
   * Nothing.
   */
  mount() {
    if (!this.root) return;

    this.root.classList.add("agent-timeline-root");

    this.unsubscribe = this.store.subscribe(snapshot => {
      this.render(snapshot);
    });
  }

  /**
   * @method unmount
   * @description
   * B"H.
   *
   * Unmounts the timeline.
   *
   * @returns {void}
   * Nothing.
   */
  unmount() {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = null;
  }

  /**
   * @method render
   * @description
   * B"H.
   *
   * Renders a snapshot.
   *
   * @param {object} snapshot
   * Store snapshot.
   *
   * @returns {void}
   * Nothing.
   */
  render(snapshot) {
    const events = snapshot.events || [];

    if (!events.length) {
      this.root.innerHTML = `
        <div class="agent-empty">
          <span class="agent-phase-dot"></span>
          Ready
        </div>
      `;
      return;
    }

    this.root.innerHTML = events.map(renderEvent).join("");
    this.root.scrollTop = this.root.scrollHeight;
  }
}

/**
 * @function mountAgentTimeline
 * @description
 * B"H.
 *
 * Mounts a timeline view onto an element.
 *
 * @param {HTMLElement|string} target
 * Element or selector.
 *
 * @returns {AgentTimelineView|null}
 * Mounted view or null.
 */
export function mountAgentTimeline(target) {
  const root = typeof target === "string"
    ? document.querySelector(target)
    : target;

  if (!root) return null;

  const view = new AgentTimelineView(root);
  view.mount();
  return view;
}