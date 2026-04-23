
/* B”H */
import { HTMLGenerator } from '../ui/HTMLGenerator.js';
import { AppLayout } from '../ui/AppLayout.js';
import { Workspace } from '../../ui/components/workspace/Workspace.js';
import { Timeline } from '../../ui/components/nle/Timeline.js';
import { HUD } from '../../ui/components/hud/HUD.js';

/**
 * @class AppUI
 * @description
 * The Master manifestor.
 * This class handles the sequence of emanation: 
 * 1. Generating the root shell structure.
 * 2. Mounting logical components.
 * 3. Ensuring no 'null' pointer errors by verifying the DOM before logic.
 */
export class AppUI {
  static setup(app) {
    const root = document.getElementById('app');
    if (!root) {
      console.error("B\"H: Root vessel '#app' not found. Existence cannot manifest.");
      return;
    }

    // 1. Reveal the structural blueprint
    const shellSchema = AppLayout.getSchema();
    const shellElement = HTMLGenerator.generate(shellSchema);
    
    // Clear the standard HTML provided and inject the spoken UI
    root.innerHTML = '';
    root.appendChild(shellElement);

    // 2. Add the visibility toggle (The eye)
    const toggle = HTMLGenerator.generate({
      tag: 'button',
      attr: { className: 'ui-visibility-toggle', title: 'Toggle Light/Darkness' },
      children: '👁️',
      events: { click: () => shellElement.classList.toggle('ui-hidden') }
    });
    shellElement.appendChild(toggle);

    // 3. Mount high-level logic vessels
    app.workspace = new Workspace(app.state, app);
    app.timeline = new Timeline(app.state, app);

    const wsMount = document.getElementById('workspace-mount');
    if (wsMount) {
      wsMount.appendChild(HTMLGenerator.generate(app.workspace.render()));
      app.workspace.mount(wsMount);
    }

    const tlMount = document.getElementById('nle-timeline');
    if (tlMount) {
      tlMount.appendChild(HTMLGenerator.generate(app.timeline.render()));
      app.timeline.mount(tlMount);
    }
    
    HUD.update(app.state);
  }
}
