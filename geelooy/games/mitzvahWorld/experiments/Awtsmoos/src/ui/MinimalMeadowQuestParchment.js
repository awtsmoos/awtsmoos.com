// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestParchment.js
 * @description Owns Shlichus dialog, progress, teaching placement, and visible completion testimony.
 * The Awtsmoos gives mission, deed, return, and reward one continuous parchment; Awtsmoos.com
 * refuses to close the instant a reward is granted, allowing the completed chapter to be witnessed.
 */

import {
	createMinimalMeadowQuestParchmentRoot,
	createMinimalMeadowQuestTracker
} from './MinimalMeadowQuestParchmentElements.js';
import { handleMinimalMeadowQuestParchmentAction } from './MinimalMeadowQuestParchmentActions.js';
import {
	minimalMeadowQuestParchmentMarkup,
	minimalMeadowQuestTrackerMarkup
} from './MinimalMeadowQuestPresentation.js';
import { installMinimalMeadowQuestParchmentStyles } from './MinimalMeadowQuestParchmentStyles.js';
import {
	TEACHING_PLACEMENTS,
	TeachingPlacementPreference
} from './TeachingPlacementPreference.js';

export class MinimalMeadowQuestParchment {
	constructor(quest, bus, documentValue) {
		this.quest = quest;
		this.bus = bus;
		this.documentValue = documentValue;
		this.opened = false;
		this.preference = new TeachingPlacementPreference(
			documentValue.defaultView?.localStorage || globalThis.localStorage
		);
		installMinimalMeadowQuestParchmentStyles(documentValue);
		this.root = createMinimalMeadowQuestParchmentRoot(documentValue);
		this.tracker = createMinimalMeadowQuestTracker(documentValue);
		documentValue.body.append(this.root, this.tracker);
		this.onRootClick = event => this.click(event);
		this.onTrackerClick = event => this.click(event);
		this.root.addEventListener('click', this.onRootClick);
		this.tracker.addEventListener('click', this.onTrackerClick);
		this.unsubscribeOffer = bus.on('quest:offer', snapshot => this.open(snapshot));
		this.unsubscribeState = quest.onChange(snapshot => this.refresh(snapshot));
		this.unsubscribePreference = this.preference.onChange(() => {
			this.refresh(this.quest.snapshot());
		});
	}

	open(snapshot = this.quest.snapshot()) {
		this.opened = true;
		this.root.dataset.open = 'true';
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.render(snapshot);
	}

	close() {
		this.opened = false;
		this.root.dataset.open = 'false';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
	}

	refresh(snapshot) {
		this.renderTracker(snapshot);
		if (this.opened) this.render(snapshot);
	}

	render(snapshot) {
		this.root.dataset.questStatus = snapshot.status;
		this.root.innerHTML = minimalMeadowQuestParchmentMarkup(
			snapshot,
			this.preference.snapshot()
		);
	}

	renderTracker(snapshot) {
		const active = snapshot.status === 'active' || snapshot.status === 'ready';
		const side = this.preference.snapshot() === TEACHING_PLACEMENTS.SIDE;
		this.tracker.hidden = !active || !side;
		if (!active || !side) {
			this.tracker.replaceChildren();
			return;
		}
		this.tracker.dataset.ready = String(snapshot.status === 'ready');
		this.tracker.innerHTML = minimalMeadowQuestTrackerMarkup(snapshot);
	}

	click(event) {
		handleMinimalMeadowQuestParchmentAction(this, event);
	}

	destroy() {
		this.unsubscribeOffer();
		this.unsubscribeState();
		this.unsubscribePreference();
		this.root.removeEventListener('click', this.onRootClick);
		this.tracker.removeEventListener('click', this.onTrackerClick);
		this.root.remove();
		this.tracker.remove();
	}
}
