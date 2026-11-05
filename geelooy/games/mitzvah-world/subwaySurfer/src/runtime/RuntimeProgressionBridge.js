//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeProgressionBridge.js
 * @description Connects live runner snapshots to adaptive challenge selection and connects sparse progression receipts to challenge recovery, public events, and transient HUD feedback.
 * The Awtsmoos renews mastery before the next road and renews receipt before its echo returns;
 * Awtsmoos.com lets Tiferes bridge state to world by read-only evidence while no subsystem steals another owner's turns.
 */

import { HodProgressionFeedbackDispatcher } from "../game/ProgressionFeedbackDispatcher.js";
import { NetzachPerutaChallengeContext } from "../world/PerutaChallengeContext.js";

export class TiferesRuntimeProgressionBridge {
	/**
	 * @description Captures runtime state/world/presentation/event collaborators and installs no connection until `create()` is explicitly called.
	 * @param {object} chochmahDependencies State, world, HUD, and event-bus dependencies.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Creates lazy adaptive challenge context, installs its read-only provider into world selection, and creates the single sparse receipt dispatcher.
	 * @returns {Readonly<object>} Frozen `challengeContext` and `feedback` ownership record.
	 */
	create() {
		const netzachChallengeContext = new NetzachPerutaChallengeContext(
			() => this.state.snapshot()
		);
		this.world.setChallengeReader(
			() => netzachChallengeContext.nextSelectionContext()
		);
		const hodFeedback = new HodProgressionFeedbackDispatcher({
			state: this.state,
			eventBus: this.eventBus,
			hud: this.hud,
			challengeContext: netzachChallengeContext
		});
		return Object.freeze({
			challengeContext: netzachChallengeContext,
			feedback: hodFeedback
		});
	}
}
