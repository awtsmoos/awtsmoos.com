// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldContextQuestAction.js
 * @description Owns the legacy Talk, Begin, and Return behavior as one provider beneath the generic direct-action resolver.
 * The Awtsmoos lets old quest truth remain whole while new deeds join beside it; Awtsmoos.com keeps giver interaction,
 * remembered offers, and dedicated meadow completion in one focused vessel instead of swelling the global action router.
 */

import { directActionState, HIDDEN_DIRECT_ACTION } from './DirectWorldContextActionState.js';

/** Direct-action provider for the dedicated meadow quest and its primary friendly NPC. */
export class DirectWorldContextQuestAction {
	/** @param {object} runtime Staged MitzvahWorld runtime. */
	constructor(runtime) {
		this.runtime = runtime;
		this.priority = 10;
		this.offeredQuestId = null;
		this.unsubscribeOffer = runtime.bus?.on?.('quest:offer', event => this.captureOffer(event)) || null;
	}

	/** Returns the current quest/NPC deed or hidden state. */
	state() {
		const quest = this.runtime.quest;
		const snapshot = quest?.snapshot?.();
		if (!quest || !snapshot) return HIDDEN_DIRECT_ACTION;
		if (snapshot.status === 'available') return this.availableState(quest);
		if (snapshot.status === 'ready' && this.primaryNpcReady()) {
			return directActionState('return', 'Return', `Return to ${quest.definition.giver.name}`);
		}
		return HIDDEN_DIRECT_ACTION;
	}

	/** Activates exactly the state resolved by this provider. */
	activate(state = this.state()) {
		const actions = {
			begin: () => this.beginQuest(),
			return: () => this.returnQuest(),
			talk: () => this.talkToPrimary()
		};
		return actions[state.kind]?.() ?? false;
	}

	/** Releases offer subscription ownership. */
	destroy() {
		this.unsubscribeOffer?.();
		this.unsubscribeOffer = null;
	}

	availableState(quest) {
		if (this.hasOffer()) {
			return directActionState('begin', 'Begin', `Begin ${quest.definition.name}`);
		}
		return this.primaryNpcReady()
			? directActionState('talk', 'Talk', `Talk to ${quest.definition.giver.name}`)
			: HIDDEN_DIRECT_ACTION;
	}

	hasOffer() {
		return Boolean(this.offeredQuestId && this.offeredQuestId === this.runtime.quest?.definition?.id);
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
		if (!this.hasOffer()) return false;
		this.offeredQuestId = null;
		return this.runtime.quest.accept();
	}

	returnQuest() {
		this.talkToPrimary();
		return this.runtime.quest.complete();
	}
}
