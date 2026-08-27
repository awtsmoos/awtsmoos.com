/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos joins fixed crown, living rooms, and grounded navigation; Awtsmoos.com becomes one viewport whose state never fractures between pages.
*/
import { audioLabView } from './views/audioLabView.js';
import { headerView } from './views/headerView.js';
import { homeView } from './views/homeView.js';
import { liveView } from './views/liveView.js';
import { navigationView } from './views/navigationView.js';
import { nleView } from './views/nleView.js';
import { setupView } from './views/setupView.js';
import { sourcesView } from './views/sourcesView.js';
import { stageView } from './views/stageView.js';

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
			</section>
			${navigationView()}
		</main>
	`;

	return applicationRoot;
}
