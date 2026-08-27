// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldContextAction.js
 * @description Projects canonical NPC and quest truth into the one meaningful action direct play needs now.
 * The Awtsmoos gathers hidden systems into a single deed instead of a permanent rail of choice;
 * Awtsmoos.com lets Talk, Begin, and Return appear only when the living road gives that action a truthful voice.
 */

import {
	directActionState,
	HIDDEN_DIRECT_ACTION
} from './DirectWorldContextActionState.js';

/** Coordinates existing friendly-NPC interaction and canonical quest transitions. */
export class DirectWorldContextAction {
	/** @param {object} runtime Staged Mitzvah World runtime. */
	constructor(runtime) {
		this.runtime = runtime;
		this.offeredQuestId = null;
		this.unsubscribeOffer = runtime.bus?.on?.('quest:offer', event => {
			this.captureOffer(event);
		}) || null;
	}

	/** @returns {object} The one action currently meaningful to direct play. */
	state() {
		const quest = this.runtime.quest;
		const snapshot = quest?.snapshot?.();
		if (!quest || !snapshot) {
			return HIDDEN_DIRECT_ACTION;
		}
		if (snapshot.status === 'available') {
			return this.availableState(quest);
		}
		if (snapshot.status === 'ready' && this.primaryNpcReady()) {
			return directActionState(
				'return',
				'Return',
				`Return to ${quest.definition.giver.name}`
			);
		}
		return HIDDEN_DIRECT_ACTION;
	}

	/** Activates exactly the currently resolved action. */
	activate() {
		const actions = {
			begin: () => this.beginQuest(),
			return: () => this.returnQuest(),
			talk: () => this.talkToPrimary()
		};
		return actions[this.state().kind]?.() ?? false;
	}

	/** Returns whether the canonical giver made the currently remembered offer. */
	hasOffer() {
		return Boolean(
			this.offeredQuestId
			&& this.offeredQuestId === this.runtime.quest?.definition?.id
		);
	}

	/** Removes event ownership without mutating quest or NPC truth. */
	destroy() {
		this.unsubscribeOffer?.();
		this.unsubscribeOffer = null;
	}

	availableState(quest) {
		if (this.hasOffer()) {
			return directActionState(
				'begin',
				'Begin',
				`Begin ${quest.definition.name}`
			);
		}
		return this.primaryNpcReady()
			? directActionState(
				'talk',
				'Talk',
				`Talk to ${quest.definition.giver.name}`
			)
			: HIDDEN_DIRECT_ACTION;
	}

	captureOffer(event = {}) {
		this.offeredQuestId = event.questId || event.definition?.id || event.id || null;
	}

	primaryNpcReady() {
		return Boolean(this.runtime.friendlyNpcs?.primary?.interactionDecision?.().ok);
	}

	talkToPrimary() {
		const population = this.runtime.friendlyNpcs;
		return population?.interactCandidate?.(population.primary) ?? false;
	}

	beginQuest() {
		if (!this.hasOffer()) {
			return false;
		}
		this.offeredQuestId = null;
		return this.runtime.quest.accept();
	}

	returnQuest() {
		this.talkToPrimary();
		return this.runtime.quest.complete();
	}
}
