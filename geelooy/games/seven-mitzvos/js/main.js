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
import { TzomayachLandscapeRenderer } from './render/landscape.js';
import { GameView } from './ui/game-view.js';
import { BuilderView } from './ui/builder-view.js';
import { MitzvahGallery } from './ui/mitzvah-gallery.js';

/**
 * @module SevenMitzvosMain
 * @description
 * Recognition game, city builder, learning gallery, and fast landscape become
 * one experience on Awtsmoos.com. The Awtsmoos gives each vessel its purpose
 * without allowing any new mode to erase the path that came before it.
 */
const landscape = new TzomayachLandscapeRenderer(requiredElement('landscapeCanvas'));
const gameView = new GameView({
	section: requiredElement('gameSection'),
	launch: requiredElement('beginGame'),
	start: requiredElement('startGame'),
	board: requiredElement('gameBoard'),
	prompt: requiredElement('gamePrompt'),
	answers: requiredElement('answerGrid'),
	feedback: requiredElement('gameFeedback'),
	score: requiredElement('gameScore'),
	streak: requiredElement('gameStreak'),
	round: requiredElement('gameRound'),
	best: requiredElement('gameBest'),
	light: requiredElement('lightFill'),
	progress: requiredElement('roundFill'),
	time: requiredElement('timeFill')
});
const game = new GameEngine({
	state: new GameState(12),
	deck: new QuestionDeck(SCENARIOS, MITZVOS),
	view: gameView
});
const builderView = new BuilderView(
	requiredElement('builderMount'),
	requiredElement('beginBuilder'),
	BUILDINGS,
	BUILDING_BY_ID,
	FOUNDATIONS
);
const builder = new BuilderEngine({
	state: new BuilderState(64),
	catalog: BUILDING_BY_ID,
	view: builderView,
	resources: new ResourceRules(),
	crises: new CrisisEngine(CRISES, FOUNDATIONS),
	tiers: new TierEngine(),
	session: new BuilderSession(new BuilderSaveStore())
});
const gallery = new MitzvahGallery({
	grid: requiredElement('mitzvahGrid'),
	dialog: requiredElement('mitzvahDialog'),
	close: requiredElement('closeDialog'),
	number: requiredElement('dialogNumber'),
	symbol: requiredElement('dialogSymbol'),
	title: requiredElement('dialogTitle'),
	summary: requiredElement('dialogSummary'),
	practice: requiredElement('dialogPractice')
}, MITZVOS);

gallery.mount();
game.mount();
builder.mount();
landscape.start();
window.addEventListener('pagehide', () => landscape.destroy(), { once: true });

/** @param {string} id @returns {HTMLElement} Existing required element. */
function requiredElement(id) {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Missing required element: ${id}`);
	}
	return element;
}
