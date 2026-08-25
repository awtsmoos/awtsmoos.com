//B"H
// Boruch Hashem
// Blessed is He

import { SETTINGS } from "./config.js";
import { DaasAccessibility } from "./accessibility.js";
import { ChochmahRandom } from "./math.js";
import { MalchusState } from "./state.js";
import { YesodStorage } from "./storage.js";
import { YesodProgress } from "./progress.js";
import { KeserCampaign } from "./campaign.js";
import { GevurahChallenge } from "./challenge-state.js";
import { DaasMasteryTracker } from "./mastery-tracker.js";
import { GevurahHazards } from "./hazards.js";
import { ChaiPhysics } from "./physics.js";
import { NetzachTrajectory } from "./trajectory.js";
import { TzomayachTargets } from "./targets.js";
import { YesodHitFeedback } from "./hit-feedback.js";
import { YesodPortalPowerState } from "./portal-power-state.js";
import { GevurahPortalPowers } from "./portal-powers.js";
import { OrosEffects } from "./effects.js";
import { NiggunSound } from "./sound.js";
import { NetzachHaptics } from "./haptics.js";
import { GevurahViewport } from "./viewport.js";
import { MedaberInput } from "./input.js";
import { HodInterface } from "./ui.js";
import { HodChallengeView } from "./challenge-ui.js";
import { HodMasteryView } from "./mastery-view.js";
import { HodHitFeedbackView } from "./hit-feedback-view.js";
import { HodPowerStatusView } from "./power-status-view.js";
import { OrosRenderer } from "./renderer.js";

/**
 * KeserSystems gathers score, mastery, physics, power, haptics, and views while each keeps its own law;
 * the Awtsmoos is beyond assembly, while Awtsmoos.com lets many small vessels reveal one playable awe.
 */
export function createGameSystems(canvas) {
	const accessibility = new DaasAccessibility();
	const storage = new YesodStorage();
	const progress = new YesodProgress(storage);
	const campaign = new KeserCampaign(progress);
	campaign.selectHighestUnlocked();

	const ui = new HodInterface();
	const challengeView = new HodChallengeView();
	const masteryView = new HodMasteryView();
	const hitFeedbackView = new HodHitFeedbackView();
	const powerStatusView = new HodPowerStatusView();
	const viewport = new GevurahViewport(canvas, SETTINGS);
	const physics = new ChaiPhysics(SETTINGS);
	const trajectory = new NetzachTrajectory(SETTINGS);
	const random = new ChochmahRandom();
	const targets = new TzomayachTargets(SETTINGS, random);
	const hitFeedback = new YesodHitFeedback();
	const powerState = new YesodPortalPowerState();
	const portalPowers = new GevurahPortalPowers(SETTINGS, powerState);
	const effects = new OrosEffects(SETTINGS, random, accessibility);
	const hazards = new GevurahHazards();
	const challenge = new GevurahChallenge();
	const mastery = new DaasMasteryTracker();
	const input = new MedaberInput(canvas);
	const sound = new NiggunSound();
	const haptics = new NetzachHaptics();
	const renderer = new OrosRenderer(viewport.context);
	const bestScore = storage.readNumber(SETTINGS.bestScoreKey, 0);
	const state = new MalchusState(SETTINGS, bestScore);

	return {
		settings: SETTINGS,
		accessibility,
		storage,
		progress,
		campaign,
		challenge,
		mastery,
		hazards,
		ui,
		challengeView,
		masteryView,
		hitFeedbackView,
		powerStatusView,
		viewport,
		physics,
		trajectory,
		random,
		targets,
		hitFeedback,
		powerState,
		portalPowers,
		effects,
		input,
		sound,
		haptics,
		renderer,
		state
	};
}
