// B"H
import { HTMLGenerator } from '../ui/HTMLGenerator.js';
import { AppLayout } from '../ui/AppLayout.js';
import { Workspace } from '../../ui/components/workspace/Workspace.js';
import { NLETimelineUI } from '../../nle/ui/manifest/NLETimelineUI.js';
import { GlobalObserver } from '../ui/GlobalObserver.js';
import { ResponsiveChrome } from '../../ui/chrome/ResponsiveChrome.js';
import { AutoPlayCovenant } from '../playback/AutoPlayCovenant.js';
import { AppComponentMount } from './AppComponentMount.js';

/**
 * @file AppUI.js
 * @description
 * ============================================================================
 * CHAPTER: THE TABERNACLE THAT STOPPED BREAKING ITS OWN PRIESTS
 * ============================================================================
 *
 * The previous patch passed the wrong arguments into Workspace. The component
 * expected state and app, but received app and a DOM node. Then the workspace
 * called this.state.get, and the console screamed because app.get was not born.
 *
 * This version respects each vessel:
 * - Workspace receives app.state and app.
 * - NLETimelineUI receives app.state and app.
 * - The HTML shell is generated once.
 * - The responsive chrome is installed after the shell exists.
 * - Default playback is resumed after the stage is mounted.
 *
 * The Awtsmoos creates all worlds with order. This file now follows order:
 * first vessel, then light; first state, then component; first stage, then play.
 *
 * @class AppUI
 */
export class AppUI {
  /**
   * @type {number}
   */
  static MAX_RETRIES = 300;

  /**
   * Builds and mounts the complete app UI.
   *
   * @param {Object} app - Application core.
   * @returns {void}
   */
  static setup(app) {
    console.log('B"H - [AppUI] Preparing the physical Tabernacle.');

    const root = document.getElementById('app');
    if (!root) {
      console.error('B"H - [AppUI] Root #app vessel is missing.');
      return;
    }

    window.AwtsmoosHTMLGenerator = HTMLGenerator;

    const schema = AppLayout.getSchema();
    const shell = HTMLGenerator.generate(schema);

    root.innerHTML = '';
    root.appendChild(shell);

    GlobalObserver.awaken(app.state, app);
    ResponsiveChrome.install(app);

    this._mountWhenReady(app, 0);
  }

  /**
   * Waits for mount points, then creates workspace and timeline.
   *
   * @param {Object} app - Application core.
   * @param {number} retryCount - Current retry count.
   * @returns {void}
   * @private
   */
  static _mountWhenReady(app, retryCount) {
    if (retryCount >= this.MAX_RETRIES) {
      console.error('B"H - [AppUI] Mount points never appeared.');
      return;
    }

    const workspaceMount = document.getElementById('workspace-mount');
    const timelineMount = document.getElementById('nle-timeline');

    if (!workspaceMount || !timelineMount) {
      requestAnimationFrame(() => this._mountWhenReady(app, retryCount + 1));
      return;
    }

    if (!app.workspace) {
      app.workspace = new Workspace(app.state, app);
    }

    if (!app.timeline) {
      app.timeline = AppComponentMount.create(NLETimelineUI, app, timelineMount);
    }

    AutoPlayCovenant.resume(app);
    ResponsiveChrome.syncPlayback(app);

    console.log('B"H - [AppUI] Workspace, timeline, chrome, and autoplay are bound.');
  }
}