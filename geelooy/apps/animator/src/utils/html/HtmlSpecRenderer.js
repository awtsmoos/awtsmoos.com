
// B"H

/**
 * @file HtmlSpecRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE LETTERS THAT BECAME A PALACE
 * ============================================================================
 *
 * The Awtsmoos creates every world through speech, each letter descending
 * through measure, boundary, vessel, and form. This renderer imitates that
 * holy order in a tiny technical mirror: pure JSON enters as formless intent,
 * and DOM appears as a structured vessel.
 *
 * No scattered document.createElement storms. No chaos of manual fragments.
 * A data tree speaks, and the HTML vessel listens.
 *
 * @module HtmlSpecRenderer
 */

/**
 * @class HtmlSpecRenderer
 * @description
 * Converts declarative JSON node specifications into real DOM nodes.
 */
export class HtmlSpecRenderer {
  /**
   * Creates a DOM node from a JSON specification.
   *
   * @param {Object|string|number|null|undefined} spec - Node spec or primitive text.
   * @param {Object} events - Named event callbacks.
   * @returns {Node} Rendered DOM node.
   */
  static render(spec, events = {}) {
    if (spec === null || spec === undefined) return document.createTextNode('');
    if (typeof spec === 'string' || typeof spec === 'number') return document.createTextNode(String(spec));

    const tag = spec.tag || 'div';
    const el = document.createElement(tag);

    this.applyAttributes(el, spec.attrs || {});
    this.applyStyle(el, spec.style || {});
    this.applyDataset(el, spec.dataset || {});
    this.applyEvents(el, spec.on || {}, events);

    const children = Array.isArray(spec.children) ? spec.children : [];
    for (const child of children) {
      el.appendChild(this.render(child, events));
    }

    if (spec.text !== undefined && spec.text !== null) {
      el.appendChild(document.createTextNode(String(spec.text)));
    }

    return el;
  }

  /**
   * Replaces a mount element's children with one rendered specification.
   *
   * @param {Element} mount - Element receiving the generated DOM.
   * @param {Object} spec - JSON node specification.
   * @param {Object} events - Named event callbacks.
   * @returns {Element|null} First rendered element or null.
   */
  static mount(mount, spec, events = {}) {
    if (!mount) return null;
    mount.replaceChildren();
    const node = this.render(spec, events);
    mount.appendChild(node);
    return node.nodeType === Node.ELEMENT_NODE ? node : null;
  }

  /**
   * Applies normal attributes.
   *
   * @param {Element} el - Target element.
   * @param {Object} attrs - Attribute map.
   * @returns {void}
   */
  static applyAttributes(el, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === false || value === null || value === undefined) continue;
      if (key === 'className') {
        el.className = String(value);
      } else if (key === 'htmlFor') {
        el.htmlFor = String(value);
      } else if (value === true) {
        el.setAttribute(key, key);
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  /**
   * Applies inline style data.
   *
   * @param {HTMLElement} el - Target element.
   * @param {Object} style - CSS property map.
   * @returns {void}
   */
  static applyStyle(el, style) {
    for (const [key, value] of Object.entries(style)) {
      if (value !== null && value !== undefined) el.style[key] = String(value);
    }
  }

  /**
   * Applies dataset entries.
   *
   * @param {HTMLElement} el - Target element.
   * @param {Object} dataset - Dataset map.
   * @returns {void}
   */
  static applyDataset(el, dataset) {
    for (const [key, value] of Object.entries(dataset)) {
      if (value !== null && value !== undefined) el.dataset[key] = String(value);
    }
  }

  /**
   * Applies named events.
   *
   * @param {Element} el - Target element.
   * @param {Object} on - Event map.
   * @param {Object} events - Callback registry.
   * @returns {void}
   */
  static applyEvents(el, on, events) {
    for (const [eventName, handlerName] of Object.entries(on)) {
      const fn = typeof handlerName === 'function' ? handlerName : events[handlerName];
      if (typeof fn === 'function') el.addEventListener(eventName, fn);
    }
  }
}
