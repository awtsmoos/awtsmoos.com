// B"H
import { HTMLGenerator } from '../../ui/HTMLGenerator.js';
import { AppLayout } from '../../ui/AppLayout.js';
import { UIEvents } from './events.js';

/**
 * Legacy-compatible UI facade. It now emits the single canonical AppLayout
 * instead of preserving the removed duplicate template shell.
 */
export class UI {
  /**
   * Mounts the canonical app layout and binds old event hooks if invoked.
   *
   * @param {Object} app - Application core.
   * @returns {void}
   */
  static setup(app) {
    const appElement = document.getElementById('app');
    if (!appElement) return;

    appElement.innerHTML = '';
    appElement.appendChild(HTMLGenerator.generate(AppLayout.getSchema()));
    UIEvents.bind(app);
  }
}
