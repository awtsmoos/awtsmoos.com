
import { HTMLGenerator } from '../ui/HTMLGenerator.js';
import { AppLayout } from '../ui/AppLayout.js';
import { Workspace } from '../../ui/components/workspace/Workspace.js';
import { Timeline } from '../../ui/components/nle/Timeline.js';

/**
 * @file AppUI.js
 * @description
 * THE BUILDER OF THE TABERNACLE.
 * This class manifests the physical UI from the abstract layout.
 * 
 * RECTIFICATION:
 * Added recursive 'Vessel Checking'. If a mount point is not yet 
 * present in the DOM, it uses requestAnimationFrame to wait for the 
 * next tick of creation, ensuring no 'null' errors occur during boot.
 */

export class AppUI {
  /**
   * Manifests the UI and begins the component binding.
   * @param {AppCore} app - The core system.
   */
  static setup(app) {
    console.log('B"H - [AppUI] Preparing the physical Tabernacle.');
    
    const root = document.getElementById('app');
    if (!root) {
      console.error('B"H - ERROR: Root #app vessel is missing from the index.html!');
      return;
    }

    // 1. GENERATE THE SHELL
    const schema = AppLayout.getSchema();
    const shell = HTMLGenerator.generate(schema);
    root.innerHTML = '';
    root.appendChild(shell);

    // 2. MOUNT COMPONENTS WITH DEFENSIVE WAITING
    this._mountWhenReady(app);
  }

  /**
   * Ensures the DOM has stabilized before injecting complex components.
   */
  static _mountWhenReady(app) {
    const wsMount = document.getElementById('workspace-mount');
    const tlMount = document.getElementById('nle-timeline');

    if (!wsMount || !tlMount) {
      console.log('B"H - [AppUI] Vessels not yet manifest. Waiting for the next frame...');
      requestAnimationFrame(() => this._mountWhenReady(app));
      return;
    }

    console.log('B"H - [AppUI] Vessels detected. Breathing life into components.');

    // Initialize logic components
    app.workspace = new Workspace(app.state, app);
    app.timeline = new Timeline(app.state, app);

    // Mount them into their designated domains
    app.workspace.mount(wsMount);
    app.timeline.mount(tlMount);

    // Bind the global mobile interaction
    this._bindGlobalEvents();
  }

  static _bindGlobalEvents() {
    const sidebar = document.getElementById('left-sidebar');
    // For future mobile toggle button implementation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'b' && e.ctrlKey) {
        sidebar.classList.toggle('collapsed');
      }
    });
  }
}
