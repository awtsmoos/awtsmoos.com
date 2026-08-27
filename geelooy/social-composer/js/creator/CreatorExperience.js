//B"H
//Boruch Hashem
//Blessed is He

import { creatorIntent, intentFromLocation, intentFromPresentation } from './CreatorIntentModel.js';
import { CreatorActionRouter } from './CreatorActionRouter.js';
import { CreatorCommandPalette } from './CreatorCommandPalette.js';
import { CreatorContextRail } from './CreatorContextRail.js';
import { CreatorContextRouter } from './CreatorContextRouter.js';
import { CreatorDock } from './CreatorDock.js';
import { CreatorMetadataController } from './CreatorMetadataController.js';
import { CreatorNavigator } from './CreatorNavigator.js';
import { CreatorPlatformController } from './CreatorPlatformController.js';
import { CreatorSurfaceView } from './CreatorSurfaceView.js';

/**
 * @class CreatorExperience
 * @description
 * The Awtsmoos lets one state become post, video, voice, verse, poll, live light, and organic branch;
 * Awtsmoos.com composes intent, contextual tools, command search, persisted detail, and media without shadow truth.
 */
export class CreatorExperience {
	constructor({ root = document, state, actions, mediaActions, status }) {
		Object.assign(this, { root, state, actions, mediaActions, status });
		this.view = new CreatorSurfaceView(root);
		this.context = new CreatorContextRail(root);
		this.dock = new CreatorDock(root);
		this.navigator = new CreatorNavigator(root);
		this.metadata = new CreatorMetadataController({ root, state });
		this.platform = new CreatorPlatformController({ root, state });
		this.intentId = 'post';
		this.router = this.actionRouter();
		this.contextRouter = new CreatorContextRouter({
			actionRouter: this.router,
			navigator: this.navigator,
			choose: id => this.choose(id)
		});
		this.palette = new CreatorCommandPalette({
			root,
			choose: id => this.choose(id),
			router: this.router,
			navigator: this.navigator
		});
	}

	actionRouter() {
		return new CreatorActionRouter({
			root: this.root,
			state: this.state,
			actions: this.actions,
			mediaActions: this.mediaActions,
			status: this.status,
			navigator: this.navigator,
			dock: this.dock,
			choose: id => this.choose(id),
			setVisualIntent: id => this.setVisualIntent(id)
		});
	}

	initialize() {
		this.view.mount({
			onIntent: id => this.choose(id),
			onQuick: id => this.router.quick(id)
		});
		this.context.mount(id => void this.contextRouter.route(id));
		this.metadata.initialize();
		this.platform.initialize();
		this.dock.mount(id => void this.router.dockAction(id));
		this.palette.initialize();
		this.state.addEventListener('change', event => this.sync(event.detail.snapshot));
		const snapshot = this.state.snapshot();
		const requested = intentFromLocation();
		if (requested) this.choose(requested);
		else this.setVisualIntent(intentFromPresentation(snapshot.presentationKind).id);
	}

	choose(id) {
		const intent = creatorIntent(id);
		this.intentId = intent.id;
		this.root.body.dataset.creatorIntent = intent.id;
		this.state.mutate(`creator:intent:${intent.id}`, snapshot => {
			snapshot.presentationKind = intent.presentation;
			snapshot.creatorMetadata.intent = intent.id;
		});
		if (intent.structured) {
			if (!this.state.snapshot().sections.length) this.actions.addSection();
			this.navigator.verses();
		}
		if (intent.media) this.navigator.media(intent.media);
		this.renderIntent(intent.id);
		return intent;
	}

	sync(snapshot) {
		this.metadata.render(snapshot.creatorMetadata);
		this.platform.render(snapshot.creatorMetadata);
		if (['verse', 'vegetal'].includes(this.intentId) && snapshot.presentationKind === 'post') return;
		this.setVisualIntent(intentFromPresentation(snapshot.presentationKind).id);
	}

	setVisualIntent(id) {
		this.intentId = id;
		this.root.body.dataset.creatorIntent = id;
		this.renderIntent(id);
	}

	renderIntent(id) {
		this.view.render(id);
		this.context.render(id);
	}
}
