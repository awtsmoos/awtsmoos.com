// B"H

import { phaseDefinition, labelForToolCall } from './phase-registry.js';

/**
 * @file timeline-store.js
 * @description
 * B"H.
 *
 * A tiny autonomous-agent timeline store.
 *
 * The broken UX had a spiritual cousin of a dead socket:
 * "waiting first spark" stayed on screen even while work was happening.
 *
 * This store guarantees:
 * - there is always a visible phase
 * - tool calls immediately replace the waiting placeholder
 * - collapsed summaries are default
 * - expanded details remain available
 * - errors become timeline events instead of hidden promise explosions
 */

/**
 * @class AgentTimelineStore
 * @description
 * B"H.
 *
 * Observable store for agent phases.
 */
export class AgentTimelineStore {
  /**
   * @constructor
   * @description
   * B"H.
   *
   * Creates an empty timeline.
   */
  constructor() {
    this.events = [];
    this.listeners = new Set();
    this.current = null;
  }

  /**
   * @method subscribe
   * @description
   * B"H.
   *
   * Subscribes a listener to timeline changes.
   *
   * @param {Function} listener
   * Callback receiving the store snapshot.
   *
   * @returns {Function}
   * Unsubscribe function.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());

    return () => this.listeners.delete(listener);
  }

  /**
   * @method snapshot
   * @description
   * B"H.
   *
   * Returns the current immutable-ish snapshot.
   *
   * @returns {{current: object|null, events: object[]}}
   * Timeline snapshot.
   */
  snapshot() {
    return {
      current: this.current,
      events: [...this.events]
    };
  }

  /**
   * @method notify
   * @description
   * B"H.
   *
   * Notifies all listeners.
   *
   * @returns {void}
   * Nothing.
   */
  notify() {
    const snapshot = this.snapshot();
    this.listeners.forEach(listener => listener(snapshot));
  }

  /**
   * @method push
   * @description
   * B"H.
   *
   * Pushes a phase event.
   *
   * @param {object} event
   * Phase event.
   *
   * @returns {object}
   * Normalized event.
   */
  push(event = {}) {
    const definition = phaseDefinition(event.type);

    const normalized = {
      id: event.id || `phase-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      at: event.at || new Date().toISOString(),
      type: event.type || "toolStart",
      label: event.label || definition.label,
      collapsed: event.collapsed ?? definition.collapsed,
      tone: event.tone || definition.tone,
      details: event.details || null,
      file: event.file || null,
      files: event.files || null,
      error: event.error || null,
      progress: event.progress ?? null
    };

    this.events.push(normalized);
    this.current = normalized;
    this.notify();

    return normalized;
  }

  /**
   * @method start
   * @description
   * B"H.
   *
   * Starts a stream lifecycle.
   *
   * @returns {object}
   * Connecting event.
   */
  start() {
    return this.push({
      type: "connecting",
      label: "Connecting to the AI stream",
      collapsed: true
    });
  }

  /**
   * @method thinking
   * @description
   * B"H.
   *
   * Marks active thinking.
   *
   * @param {string} [text]
   * Optional visible text.
   *
   * @returns {object}
   * Thinking event.
   */
  thinking(text) {
    return this.push({
      type: "thinking",
      label: text || "Thinking",
      collapsed: false
    });
  }

  /**
   * @method betweenThoughts
   * @description
   * B"H.
   *
   * Shows a collapsed between-step state.
   *
   * @returns {object}
   * Between-thoughts event.
   */
  betweenThoughts() {
    return this.push({
      type: "betweenThoughts",
      label: "Receiving the next step",
      collapsed: true
    });
  }

  /**
   * @method tool
   * @description
   * B"H.
   *
   * Shows a collapsed tool call immediately.
   *
   * @param {string} toolName
   * Tool name.
   *
   * @param {object} args
   * Tool arguments.
   *
   * @returns {object}
   * Tool event.
   */
  tool(toolName, args = {}) {
    const labeled = labelForToolCall(toolName, args);

    return this.push({
      type: labeled.type,
      label: labeled.label,
      collapsed: true,
      details: {
        toolName,
        args
      },
      file: args.path || args.file || args.filePath || null
    });
  }

  /**
   * @method error
   * @description
   * B"H.
   *
   * Adds a visible error event.
   *
   * @param {Error|object|string} error
   * Error value.
   *
   * @returns {object}
   * Error event.
   */
  error(error) {
    const message = error && error.message ? error.message : String(error);

    return this.push({
      type: "error",
      label: message,
      collapsed: false,
      error: {
        message,
        stack: error && error.stack ? error.stack : null
      }
    });
  }

  /**
   * @method done
   * @description
   * B"H.
   *
   * Marks the agent run as finished.
   *
   * @param {string} [label]
   * Optional finish label.
   *
   * @returns {object}
   * Done event.
   */
  done(label) {
    return this.push({
      type: "done",
      label: label || "Finished",
      collapsed: true
    });
  }

  /**
   * @method clear
   * @description
   * B"H.
   *
   * Clears the timeline.
   *
   * @returns {void}
   * Nothing.
   */
  clear() {
    this.events = [];
    this.current = null;
    this.notify();
  }
}

/**
 * @constant {AgentTimelineStore} AgentTimeline
 * @description
 * B"H.
 *
 * Shared timeline instance.
 */
export const AgentTimeline = new AgentTimelineStore();