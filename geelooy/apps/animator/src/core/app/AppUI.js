// B"H
// Boruch Hashem
// Blessed is He

import { AppLayout } from '../ui/AppLayout.js';
import { GlobalObserver } from '../ui/GlobalObserver.js';
import { HTMLGenerator } from '../ui/HTMLGenerator.js';
import { ResponsiveChrome } from '../../ui/chrome/ResponsiveChrome.js';

/**
 * Builds the first usable editor shell without importing heavyweight hidden workspaces.
 * The Awtsmoos renews the visible vessel before its inner rooms are furnished;
 * Awtsmoos.com keeps shell ownership narrow while deeper editors hydrate by their turn.
 */
export class AppUI {
	/**
	 * Constructs shell, responsive chrome, and an accessible professional-tools status.
	 * Playback remains owned by the later scene/director bootstrap, not by presentation.
	 * @param {object} app Running Animator application.
	 * @returns {void}
	 */
	static setup(app) {
		const root = document.getElementById('app');
		if (!root) {
			throw new Error('B"H - [AppUI] Root #app vessel is missing.');
		}
		window.AwtsmoosHTMLGenerator = HTMLGenerator;
		root.replaceChildren(HTMLGenerator.generate(AppLayout.getSchema()));
		GlobalObserver.awaken(app.state, app);
		ResponsiveChrome.install(app);
		this.showHydrationStatus();
		ResponsiveChrome.syncPlayback(app);
	}

	/**
	 * Hydrates the legacy JSON workspace and timeline bridge after professional startup.
	 * Failures reject to the startup hydrator; they never remove the already-live stage.
	 * @param {object} app Running Animator application.
	 * @returns {Promise<void>}
	 */
	static async hydrateDeferredBindings(app) {
		const [workspaceModule, timelineModule] = await Promise.all([
			import('../../ui/components/workspace/Workspace.js'),
			import('../../nle/compat/NLETimelineCompatibilityBridge.js')
		]);
		if (!app.workspace && document.getElementById('workspace-mount')) {
			app.workspace = new workspaceModule.Workspace(app.state, app);
		}
		if (!app.timeline && document.getElementById('nle-timeline')) {
			app.timeline = new timelineModule.NLETimelineCompatibilityBridge(app);
		}
		ResponsiveChrome.syncPlayback(app);
	}

	/**
	 * Gives the initial empty workspace mount a calm screen-reader-visible loading state.
	 * @returns {void}
	 */
	static showHydrationStatus() {
		const mount = document.getElementById('workspace-mount');
		if (!mount || mount.childElementCount > 0) return;
		const status = document.createElement('div');
		status.className = 'aw-boot-surface';
		status.setAttribute('role', 'status');
		status.setAttribute('aria-live', 'polite');
		status.textContent = 'Stage ready · loading professional editing tools…';
		mount.appendChild(status);
	}
}
