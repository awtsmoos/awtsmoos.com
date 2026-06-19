// B"H
import { CHROME_ACTIONS } from './ChromeSchema.js';

/**
 * @file ChromeTemplate.js
 * @description
 * ============================================================================
 * CHAPTER: THE BUTTONS THAT CAME FROM ONE TABLE
 * ============================================================================
 *
 * No scattered document.createElement storms. The chrome is emitted from data,
 * cleanly and repeatedly. Desktop gets a side rail. Mobile gets a thumb dock.
 * Both speak the same action language.
 *
 * The Awtsmoos speaks and worlds emerge. This template speaks from schema and
 * the UI emerges, not as chaos, but as ordered vessels ready for motion.
 *
 * @class ChromeTemplate
 */
export class ChromeTemplate {
  /**
   * Builds the full chrome HTML.
   *
   * @returns {string} HTML string for mobile and desktop chrome.
   */
  static html() {
    const buttons = CHROME_ACTIONS.map((item) => this.button(item)).join('');

    return `
      <div id="awtsmoos-chrome" class="awtsmoos-chrome" data-open-panel="stage">
        <div class="awtsmoos-chrome-rail" aria-label="Desktop controls">
          ${buttons}
        </div>
        <div class="awtsmoos-mobile-dock" aria-label="Mobile controls">
          ${buttons}
        </div>
      </div>
    `;
  }

  /**
   * Builds one action button.
   *
   * @param {Object} item - Chrome action schema item.
   * @param {string} item.id - Action id.
   * @param {string} item.label - Visible label.
   * @param {string} item.icon - Visible icon.
   * @param {string} item.panel - Panel action target.
   * @param {string} item.title - Accessible title.
   * @returns {string} Button HTML.
   */
  static button(item) {
    return `
      <button
        class="awtsmoos-chrome-btn"
        data-chrome-action="${item.panel}"
        title="${item.title}"
        aria-label="${item.title}"
        type="button"
      >
        <span class="awtsmoos-chrome-icon">${item.icon}</span>
        <span class="awtsmoos-chrome-label">${item.label}</span>
      </button>
    `;
  }
}