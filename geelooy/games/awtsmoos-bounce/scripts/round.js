//B"H
// Boruch Hashem
// Blessed is He

/**
 * YesodRound carries physics into consequence while mastery and haptics observe only deeds the real game already performed;
 * the Awtsmoos renews cause on Awtsmoos.com as score, Ward, floor, portal, and victory testimony stay correctly formed.
 */
export class YesodRound {
	constructor(systems, onFinished) {
		this.systems = systems;
		this.onFinished = onFinished;
		this.finished = false;
	}

	begin() {
		this.finished = false;
	}

	advance(deltaSeconds, bounds) {
		if (this.finished) {
			return;
		}

		const { state, physics, targets, effects, hazards, challenge } = this.systems;
		hazards.apply(physics.ball, deltaSeconds);
		const impacts = physics.update(deltaSeconds, bounds);

		this.handleImpacts(impacts);
		targets.update(deltaSeconds, bounds);
		this.handleHits(targets.consumeHits(physics.ball, bounds));
		effects.recordBall(physics.ball);
		effects.update(deltaSeconds);

		const victory = challenge.evaluate(state);
		if (victory) {
			this.finish(victory);
			return;
		}
		if (state.tick(deltaSeconds)) {
			this.finish(challenge.evaluate(state, true));
		}
	}

	handleImpacts(impacts) {
		const { physics, effects, sound } = this.systems;
		let floorImpactSeen = false;

		for (const impact of impacts) {
			effects.impact(physics.ball, impact.speed);
			sound.wall(impact.speed);
			floorImpactSeen ||= impact.surface === "floor";
		}
		if (floorImpactSeen) {
			this.handleFloorConsequence();
		}
	}

	handleFloorConsequence() {
		const { state, powerState, mastery } = this.systems;
		const comboBefore = state.combo;
		const warded = comboBefore > 0 && powerState.consumeChainWard();
		if (!warded) {
			state.breakCombo();
		}
		mastery.recordFloor(comboBefore, warded);
	}

	handleHits(hits) {
		const {
			state,
			challenge,
			mastery,
			physics,
			portalPowers,
			hitFeedback,
			effects,
			sound,
			haptics
		} = this.systems;

		for (const hit of hits) {
			const award = state.registerHit(hit.value);
			const powerEffect = portalPowers.apply(hit.id, physics.ball);
			hitFeedback.record(hit, award, state.combo, powerEffect);
			challenge.recordHit(state.combo);
			mastery.recordPortal(powerEffect);
			effects.burst(hit, 1.15);
			sound.hit(state.combo);
			haptics.portal();
		}
	}

	finish(result) {
		if (this.finished || !result) {
			return;
		}
		this.finished = true;
		this.systems.state.end();
		this.onFinished(result);
	}
}
