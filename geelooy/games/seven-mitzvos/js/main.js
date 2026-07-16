//B"H
//Boruch Hashem
//Blessed is He

import { MITZVOS } from './data/mitzvos.js';
import { SCENARIOS } from './data/scenarios.js';
import { FOUNDATIONS } from './data/foundations.js';
import { BUILDINGS, BUILDING_BY_ID } from './data/buildings.js';
import { CRISES } from './data/crises.js';
import { GameState } from './game/game-state.js';
import { QuestionDeck } from './game/question-deck.js';
import { GameEngine } from './game/game-engine.js';
import { BuilderState } from './builder/builder-state.js';
import { ResourceRules } from './builder/resource-rules.js';
import { CrisisEngine } from './builder/crisis-engine.js';
import { TierEngine } from './builder/tier-engine.js';
import { BuilderSaveStore } from './builder/save-store.js';
import { BuilderSession } from './builder/builder-session.js';
import { BuilderEngine } from './builder/builder-engine.js';
import { mountSevenWorlds } from './universe/universe-bootstrap.js';
import { CampaignStore } from './campaign/campaign-store.js';
import { CampaignEngine } from './campaign/campaign-engine.js';
import { CampaignRewardApplicator } from './campaign/rewards/reward-applicator.js';
import { TzomayachLandscapeRenderer } from './render/landscape.js';
import { GameView } from './ui/game-view.js';
import { BuilderView } from './ui/builder-view.js';
import { MitzvahGallery } from './ui/mitzvah-gallery.js';
import { galleryElements, gameElements, requiredElement } from './ui/app-elements.js';
import { mountLivingWorld } from './client/living-world/living-world-app.js';

/**
 * @module SevenMitzvosMain
 * @description
 * Seven Provinces, seven independent worlds, two shared games, a preserved builder,
 * and Covenant Valley gather on Awtsmoos.com. The Awtsmoos gives each vessel
 * purpose without allowing a new revelation, reward, or save to erase an earlier path.
 */
const landscape = new TzomayachLandscapeRenderer(requiredElement('landscapeCanvas'));
const livingWorld = mountLivingWorld(requiredElement('livingWorldMount'));
const universe = mountSevenWorlds(requiredElement('universeMount'));
const campaignStore = new CampaignStore();
const builderStore = new BuilderSaveStore();
const builderState = new BuilderState(64);
builderState.applyLegacy(universe.progress.legacy());
const rewardApplicator = new CampaignRewardApplicator(campaignStore);
const rewardResult = rewardApplicator.applyToEligibleNewCity(builderState, builderStore);
const campaign = new CampaignEngine(requiredElement('campaignMount'), campaignStore);
const game = new GameEngine({
	state: new GameState(12),
	deck: new QuestionDeck(SCENARIOS, MITZVOS),
	view: new GameView(gameElements())
});
const builderView = new BuilderView(
	requiredElement('builderMount'),
	requiredElement('beginBuilder'),
	BUILDINGS,
	BUILDING_BY_ID,
	FOUNDATIONS,
	rewardApplicator.permanentUnlocks()
);
const builder = new BuilderEngine({
	state: builderState,
	catalog: BUILDING_BY_ID,
	view: builderView,
	resources: new ResourceRules(),
	crises: new CrisisEngine(CRISES, FOUNDATIONS),
	tiers: new TierEngine(),
	session: new BuilderSession(builderStore)
});
const gallery = new MitzvahGallery(galleryElements(), MITZVOS);

if (rewardResult.applied) {
	builder.event = rewardResult.message;
}
void livingWorld;
gallery.mount();
game.mount();
builder.mount();
landscape.start();
window.addEventListener('pagehide', () => {
	campaign.destroy();
	universe.destroy();
	landscape.destroy();
}, { once: true });
