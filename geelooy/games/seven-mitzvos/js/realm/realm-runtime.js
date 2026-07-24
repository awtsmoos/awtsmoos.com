//B"H
//Boruch Hashem
//Blessed is He

import { RealmActionEngine } from './realm-action-engine.js';
import { RealmEventEngine } from './realm-event-engine.js';
import { RealmRepository } from './realm-repository.js';
import { createRealmState } from './realm-state.js';
import { RealmStageBuilder } from './realm-stage-builder.js';
import { RealmView } from './realm-view.js';

/**
 * @module RealmRuntime
 * @description
 * The covenant realm joins movement, people, account, quests, bank, recovery,
 * projects, saving, chronicle, and adaptive rendering. The Awtsmoos renews identity
 * now; Awtsmoos.com persists migration before the traveler performs a first action.
 */
export class RealmRuntime {
	constructor(layer, onExit) {
		this.layer = layer;
		this.onExit = onExit;
		this.repository = new RealmRepository();
		this.actions = new RealmActionEngine();
		this.events = new RealmEventEngine();
		this.state = this.repository.load(createRealmState());
		this.uiTimer = 0;
		this.worldTimer = 0;
		this.saveTimer = 0;
	}

	mount() {
		this.repository.save(this.state);
		this.view = new RealmView(this.layer);
		this.view.mount({
			exit: this.onExit,
			action: id => this.act(id),
			move: (x, z) => this.stage.controller.setDirection(x, z)
		});
		this.stage = new RealmStageBuilder(
			this.layer.querySelector('#realmStage'),
			this.state,
			root => this.select(root)
		).mount();
		this.stage.start((delta, elapsed, quality) => {
			this.update(delta, elapsed, quality);
		});
		this.view.message('Walk continuously. Help one system and watch the others change.');
		this.render();
	}

	update(delta, elapsed, quality) {
		this.uiTimer += delta;
		this.worldTimer += delta;
		this.saveTimer += delta;
		if (this.worldTimer >= 6) {
			this.worldTimer = 0;
			this.state = this.events.advance(this.state, 1);
		}
		if (this.uiTimer >= 0.25) {
			this.uiTimer = 0;
			this.performance = quality;
			this.syncPosition();
			this.render();
		}
		if (this.saveTimer >= 5) {
			this.saveTimer = 0;
			this.repository.save(this.state);
		}
	}

	act(id) {
		const outcome = this.actions.run(this.state, id);
		this.state = outcome.state;
		this.stage.refresh(this.state);
		this.repository.save(this.state);
		this.view.message(outcome.message, outcome.ok ? 'good' : 'warn');
		this.render();
	}

	select(root) {
		const data = root.userData;
		this.view.message(data.semanticType === 'realm-resource'
			? `Move close to gather ${data.resource}.`
			: data.reason || `You inspect ${root.name}.`);
	}

	render() {
		this.view.render(
			this.state,
			this.stage.context(),
			this.performance || this.stage.quality.current()
		);
	}

	syncPosition() {
		this.state = {
			...this.state,
			player: { ...this.state.player, position: this.stage.controller.position() }
		};
	}

	destroy() {
		this.syncPosition();
		this.repository.save(this.state);
		this.stage.destroy();
		this.layer.replaceChildren();
	}
}
