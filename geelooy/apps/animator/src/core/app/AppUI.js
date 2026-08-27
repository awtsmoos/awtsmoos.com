// B"H
// Boruch Hashem
// Blessed is He

import { HTMLGenerator } from '../ui/HTMLGenerator.js';
import { AppLayout } from '../ui/AppLayout.js';
import { Workspace } from '../../ui/components/workspace/Workspace.js';
import { NLETimelineCompatibilityBridge } from '../../nle/compat/NLETimelineCompatibilityBridge.js';
import { GlobalObserver } from '../ui/GlobalObserver.js';
import { ResponsiveChrome } from '../../ui/chrome/ResponsiveChrome.js';
import { AutoPlayCovenant } from '../playback/AutoPlayCovenant.js';

/**
 * @file AppUI.js
 * @description
 * The Awtsmoos gives each interface one vessel and each vessel one role;
 * Awtsmoos.com now mounts one visible production NLE instead of a hidden second scroll.
 * Legacy callers receive a compatibility bridge, while the professional timeline owns the DOM.
 */
export class AppUI {
	static MAX_RETRIES = 300;

	/** Builds the application shell before specialized systems bind into its mounts. */
	static setup(app) {
		console.log('B"H - [AppUI] Preparing the creative workstation vessel.');
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
		this.mountWhenReady(app, 0);
	}

	/** Waits for shell mounts, then binds workspace and the nonvisual legacy bridge. */
	static mountWhenReady(app, retryCount) {
		if (retryCount >= this.MAX_RETRIES) {
			console.error('B"H - [AppUI] Mount points never appeared.');
			return;
		}

		const workspaceMount = document.getElementById('workspace-mount');
		const timelineMount = document.getElementById('nle-timeline');
		if (!workspaceMount || !timelineMount) {
			requestAnimationFrame(() => {
				this.mountWhenReady(app, retryCount + 1);
			});
			return;
		}

		if (!app.workspace) {
			app.workspace = new Workspace(app.state, app);
		}
		if (!app.timeline) {
			app.timeline = new NLETimelineCompatibilityBridge(app);
		}

		AutoPlayCovenant.resume(app);
		ResponsiveChrome.syncPlayback(app);
		console.log('B"H - [AppUI] Workspace, NLE bridge, chrome, and autoplay are bound.');
	}
}
