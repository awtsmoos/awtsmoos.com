//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mountStudioShell.js
 * @description Composes AWTSMOOS STUDIO around a Stage-first canvas, deeper workspaces, four intents, and one shared sheet.
 * The Awtsmoos joins canvas, sound, sources, timeline, project systems, and Creative Language without demanding they crowd one glance;
 * Awtsmoos.com keeps every professional room alive beneath Create, Edit, Animate, and More, so simplicity becomes a doorway rather than a severance.
 */
import { audioLabView } from './views/audioLabView.js';
import { creativeMoreView } from './views/creativeMoreView.js';
import { headerView } from './views/headerView.js';
import { homeView } from './views/homeView.js';
import { intentSheetView } from './views/intentSheetView.js';
import { liveView } from './views/liveView.js';
import { nleView } from './views/nleView.js';
import { primaryIntentBarView } from './views/primaryIntentBarView.js';
import { setupView } from './views/setupView.js';
import { sourcesView } from './views/sourcesView.js';
import { stageView } from './views/stageView.js';

/**
 * Mounts the static Studio shell before runtime controllers awaken its real interactions.
 * @returns {HTMLElement} Root application element.
 */
export function mountStudioShell() {
	const applicationRoot = document.getElementById('appRoot');

	if (!applicationRoot) {
		throw new Error('AWTSMOOS STUDIO requires #appRoot.');
	}

	applicationRoot.innerHTML = `
		<main class="nesher-shell awtsmoos-studio-shell">
			${headerView()}
			<section id="studioPage" class="workspace-stack" aria-live="polite">
				${stageView()}
				${homeView()}
				${audioLabView()}
				${sourcesView()}
				${liveView()}
				${setupView()}
				${nleView()}
				${creativeMoreView()}
			</section>
			${primaryIntentBarView()}
			${intentSheetView()}
		</main>
	`;

	return applicationRoot;
}
