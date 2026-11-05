// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHud.js
 * @description Binds bounded gameplay and subtitle events into one accessible vertical-slice presentation.
 * The Awtsmoos renews hidden mechanics as public words, meters, and patterned borders;
 * Awtsmoos.com lets intention, posture, knowledge, boss, quest, sound alternatives, and feedback agree.
 */

import {
	createMinimalMeadowVerticalSliceHudState,
	reduceMinimalMeadowVerticalSliceHud
} from './MinimalMeadowVerticalSliceHudState.js';
import {
	installMinimalMeadowVerticalSliceHudStyles
} from './MinimalMeadowVerticalSliceHudStyles.js';
import {
	createMinimalMeadowVerticalSliceHudView
} from './MinimalMeadowVerticalSliceHudView.js';

const EVENTS = Object.freeze([
	'audio:subtitle',
	'boss:defeated',
	'boss:phase',
	'combat:cleanse',
	'combat:kavanah-authority-failed',
	'combat:kavanah-authority-release',
	'combat:kavanah-authority-start',
	'combat:kavanah-cancel',
	'combat:kavanah-release',
	'combat:kavanah-start',
	'combat:posture',
	'combat:reaction',
	'combat:support-authority-failed',
	'daas:learned',
	'enemy:cast-interrupted',
	'reward:granted',
	'teaching-quest:advanced',
	'teaching-quest:completed'
]);

export class MinimalMeadowVerticalSliceHud {
	constructor(host, bus, documentValue) {
		installMinimalMeadowVerticalSliceHudStyles(documentValue);
		this.bus = bus;
		this.state = createMinimalMeadowVerticalSliceHudState();
		this.view = createMinimalMeadowVerticalSliceHudView(
			host,
			documentValue
		);
		this.unsubscribers = EVENTS.map(eventName => {
			return bus.on(eventName, detail => {
				this.receive(eventName, detail);
			});
		});
		this.view.update(this.state);
	}

	receive(eventName, detail) {
		reduceMinimalMeadowVerticalSliceHud(
			this.state,
			eventName,
			detail || {}
		);
		this.view.update(this.state);
	}

	diagnostics() {
		return {
			bossVisible: Boolean(this.state.boss),
			daasVisible: Boolean(this.state.daas),
			feedbackState: this.state.feedbackState,
			kavanahVisible: Boolean(this.state.kavanah),
			postureVisible: Boolean(this.state.posture),
			questVisible: Boolean(this.state.quest)
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		this.view.destroy();
	}
}
