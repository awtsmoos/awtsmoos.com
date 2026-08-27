// B"H
import { ChromeTemplate } from './ChromeTemplate.js';
import { AutoPlayCovenant } from '../../core/playback/AutoPlayCovenant.js';

/**
 * @file ResponsiveChrome.js
 * @description
 * ============================================================================
 * CHAPTER: THE UI THAT LEARNED TO BREATHE IN AND OUT
 * ============================================================================
 *
 * The user should not fight panels on a phone. The editor, properties, timeline,
 * and stage must retract like wings. Desktop wants a small rail. Mobile wants a
 * bottom dock. The canvas wants to remain alive behind everything.
 *
 * This class binds one data-based chrome to the whole app. It toggles body
 * attributes, syncs play state, and makes every existing panel obey one simple
 * covenant: stage, editor, time, props, play, hide.
 *
 * The Awtsmoos fills every vessel while remaining beyond every vessel. So this
 * UI appears when needed and nullifies itself when the scene must shine.
 *
 * @class ResponsiveChrome
 */
export class ResponsiveChrome {
  /**
   * Installs responsive chrome once.
   *
   * @param {Object} app - Application core.
   * @returns {void}
   */
  static install(app) {
    if (!document.body || document.getElementById('awtsmoos-chrome')) return;

    document.body.insertAdjacentHTML('beforeend', ChromeTemplate.html());
    document.body.dataset.awtsmoosPanel = 'stage';
    document.body.classList.add('awtsmoos-ui-ready');

    this.bind(app);
    this.syncPlayback(app);
  }

  /**
   * Binds all chrome buttons.
   *
   * @param {Object} app - Application core.
   * @returns {void}
   */
  static bind(app) {
    document.querySelectorAll('[data-chrome-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.chromeAction;
        this.handle(app, action);
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        AutoPlayCovenant.toggle(app);
        this.syncPlayback(app);
      }
      if (event.key === 'Escape') {
        this.setPanel('hide');
      }
    });
  }

  /**
   * Handles one chrome action.
   *
   * @param {Object} app - Application core.
   * @param {string} action - Action name.
   * @returns {void}
   */
  static handle(app, action) {
    const actions = {
      stage: () => this.setPanel('stage'),
      editor: () => this.togglePanel('editor'),
      time: () => this.togglePanel('time'),
      props: () => this.togglePanel('props'),
      hide: () => this.setPanel('hide'),
      play: () => {
        AutoPlayCovenant.toggle(app);
        this.syncPlayback(app);
      }
    };

    const fn = actions[action] || actions.stage;
    fn();
  }

  /**
   * Toggles a panel, retracting when pressed twice.
   *
   * @param {string} panel - Panel name.
   * @returns {void}
   */
  static togglePanel(panel) {
    const current = document.body.dataset.awtsmoosPanel || 'stage';
    this.setPanel(current === panel ? 'stage' : panel);
  }

  /**
   * Sets the active panel.
   *
   * @param {string} panel - stage, editor, time, props, or hide.
   * @returns {void}
   */
  static setPanel(panel) {
    const valid = new Set(['stage', 'editor', 'time', 'props', 'hide']);
    const chosen = valid.has(panel) ? panel : 'stage';

    document.body.dataset.awtsmoosPanel = chosen;
    document.body.classList.toggle('sidebar-mobile-active', chosen === 'editor');
    document.body.classList.toggle('timeline-mobile-active', chosen === 'time');
    document.body.classList.toggle('props-mobile-active', chosen === 'props');

    document.querySelectorAll('[data-chrome-action]').forEach((button) => {
      const action = button.dataset.chromeAction;
      button.classList.toggle('active', action === chosen);
    });
  }

  /**
   * Updates play button state.
   *
   * @param {Object} app - Application core.
   * @returns {void}
   */
  static syncPlayback(app) {
    const playing = app?.director?.isPlaying === true || app?.state?.get('isPlaying') === true;
    document.querySelectorAll('[data-chrome-action="play"]').forEach((button) => {
      const icon = button.querySelector('.awtsmoos-chrome-icon');
      const label = button.querySelector('.awtsmoos-chrome-label');
      if (icon) icon.textContent = playing ? '⏸' : '▶';
      if (label) label.textContent = playing ? 'Pause' : 'Play';
      button.classList.toggle('playing', playing);
    });
  }
}