/**
 * B"H
 * @class State
 * @description One canonical memory for world, campaign, party, missions, story, economy, and battle.
 *
 * Every instant is recreated by the Awtsmoos. The game therefore keeps one
 * present tense: no mission, battle, shop, or old engine may inhabit a rival
 * universe of state.
 */
import { createEquipment, createHero, createInventory, createSefiros, createStats } from '../state/defaults/CoreDefaults.js';
import { createGifts, createLearnedRoutes, createMusagDex, createQuests, createSkills, createStory, createTorahCodex, createTorahKnowledge } from '../state/defaults/ProgressionDefaults.js';
import { createCampaign, createEconomy, createMissions, createParty, createScenes, createWorldState } from '../state/defaults/CampaignDefaults.js';
import { createDebate, createDialogue, createTestState } from '../state/defaults/RuntimeDefaults.js';
import * as actions from '../state/StateActions.js';

export class State {
	static ActiveRealm = 'OVERWORLD';
	static MapId = 'Overworld_Main';
	static Resolution = 64;
	static Speed = 3.35;
	static FrameDeltaScale = 1;
	static Hero = createHero();
	static Stats = createStats();
	static Sefiros = createSefiros();
	static Equipment = createEquipment();
	static Inventory = createInventory();
	static Story = createStory();
	static Gifts = createGifts();
	static Skills = createSkills();
	static TorahKnowledge = createTorahKnowledge();
	static TorahCodex = createTorahCodex();
	static LearnedRoutes = createLearnedRoutes();
	static MusagDex = createMusagDex();
	static Quests = createQuests();
	static Campaign = createCampaign();
	static Party = createParty();
	static Missions = createMissions();
	static Scenes = createScenes();
	static Economy = createEconomy();
	static WorldState = createWorldState();
	static HeroPath = [];
	static PathTarget = null;
	static UiPanel = null;
	static VisitedMaps = { Overworld_Main: true };
	static Dialogue = createDialogue();
	static Message = 'The Aleph has vanished. Advance the opening scene.';
	static MessageTTL = 1200;
	static BattleFx = [];
	static Debate = createDebate();
	static Test = createTestState();

	static setFrameDeltaScale(scale = 1) { actions.setFrameDeltaScale(this, scale); }
	static isUiBlocking() { return actions.isUiBlocking(this); }
	static clearPath() { actions.clearPath(this); }
	static resetHero(x, y, dir = 'd') { actions.resetHero(this, x, y, dir); }
	static rememberMap(mapId) { actions.rememberMap(this, mapId); }
	static openPanel(panel) { actions.openPanel(this, panel); }
	static openDialogue(payload) { actions.openDialogue(this, payload); }
	static closeDialogue(speak = true) { actions.closeDialogue(this, speak); }
	static dialogueNext(delta = 1) { actions.dialogueNext(this, delta); }
	static nextStoryBeat(key, total) { return actions.nextStoryBeat(this, key, total); }
	static say(message, ttl = 360) { actions.say(this, message, ttl); }
	static releaseIntents() { actions.releaseIntents(); }
}

const targetWindow = typeof window === 'undefined' ? globalThis : window;
targetWindow.AwtsmoosIntents ||= { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 };
