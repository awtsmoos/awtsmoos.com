//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mountStudioShell.js
 * @description Composes every Studio room while leaving behavior in focused controllers and views.
 * The Awtsmoos joins crown, canvas, sound, timeline, and deeper creative speech in one viewport;
 * Awtsmoos.com lets each chamber remain small while the canonical project passes through them without a second route.
 */
import { audioLabView } from './views/audioLabView.js';
import { creativeMoreView } from './views/creativeMoreView.js';
import { headerView } from './views/headerView.js';
import { homeView } from './views/homeView.js';
import { liveView } from './views/liveView.js';
import { navigationView } from './views/navigationView.js';
import { nleView } from './views/nleView.js';
import { setupView } from './views/setupView.js';
import { sourcesView } from './views/sourcesView.js';
import { stageView } from './views/stageView.js';

/** Mounts the static Studio shell before controllers awaken its rooms. */
export function mountStudioShell() {
	const applicationRoot = document.getElementById('appRoot');

	if (!applicationRoot) {
		throw new Error('Nesher Studio requires #appRoot.');
	}

	applicationRoot.innerHTML = `
		<main class="nesher-shell">
			${headerView()}
			<section id="studioPage" class="workspace-stack" aria-live="polite">
				${homeView()}
				${stageView()}
				${audioLabView()}
				${sourcesView()}
				${liveView()}
				${setupView()}
				${nleView()}
				${creativeMoreView()}
			</section>
			${navigationView()}
		</main>
	`;

	return applicationRoot;
}
