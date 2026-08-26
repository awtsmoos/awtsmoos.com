//B"H
// Boruch Hashem
// Blessed is He

/**
 * TiferesGameView joins mission, mastery, score, power testimony, and advisory motion in one downstream breath;
 * the Awtsmoos renews what is seen on Awtsmoos.com while every view receives copied truth from living state beneath.
 */
export class TiferesGameView {
	constructor(systems) {
		this.systems = systems;
	}

	render(bounds, elapsed) {
		const systems = this.systems;
		const aimPoint = systems.state.phase === "playing"
			? systems.input.aimPoint
			: null;
		const launch = aimPoint
			? systems.physics.previewLaunch(aimPoint)
			: null;
		const trajectory = launch
			? systems.trajectory.predict(
				systems.physics.ball,
				launch,
				systems.hazards,
				bounds
			)
			: null;

		systems.renderer.render({
			bounds,
			effects: systems.effects,
			hazards: systems.hazards.wells,
			ball: systems.physics.ball,
			targets: systems.targets.targets,
			aimPoint,
			trajectory,
			elapsed: systems.accessibility.motionTime(elapsed)
		});

		systems.ui.update(systems.state);
		systems.challengeView.update(
			systems.campaign,
			systems.state,
			systems.challenge
		);
		systems.masteryView.update(
			systems.campaign.currentLevel,
			systems.mastery
		);
		systems.hitFeedbackView.update(systems.hitFeedback);
		systems.powerStatusView.update(systems.powerState);
	}
}
