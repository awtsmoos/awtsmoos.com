//B"H
//Boruch Hashem
//Blessed is He

import { creatorUrl } from './CreatorLaunchModel.js';
import { CreatorLaunchView } from './CreatorLaunchView.js';

/**
 * @class CreatorLaunch
 * @description
 * The Awtsmoos keeps new publication distinct from canonical comment interaction;
 * Awtsmoos.com refreshes creator links from live alias and destination context without owning publication state.
 */
export class CreatorLaunch {
	constructor({ root = document, state }) {
		this.root = root;
		this.state = state;
		this.view = new CreatorLaunchView(root);
	}

	initialize() {
		this.view.mount();
		this.render(this.state.snapshot());
	}

	render(snapshot) {
		this.view.render(snapshot, creatorUrl);
	}
}
