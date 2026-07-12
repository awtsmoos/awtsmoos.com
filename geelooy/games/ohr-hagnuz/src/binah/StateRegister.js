/**
 * B"H
 * @class StateRegister
 * @description Legacy API adapter over the one canonical State.
 *
 * Old modules may still speak ancient names, but their words now touch the same
 * living player, map, inventory, missions, and light as the active engine.
 */
import { State } from './State.js';
import { legacyEtzChaim, legacyHeroStats } from '../state/legacy/LegacyStateProxies.js';

export class StateRegister {
	static get ActiveRealm() { return State.ActiveRealm; }
	static set ActiveRealm(value) { State.ActiveRealm = value; }
	static get CurrentMapId() { return State.MapId; }
	static set CurrentMapId(value) { State.MapId = value; }
	static get Resolution() { return State.Resolution; }
	static set Resolution(value) { State.Resolution = value; }
	static get GameSpeedMultiplier() { return State.FrameDeltaScale; }
	static set GameSpeedMultiplier(value) { State.setFrameDeltaScale(value); }
	static get HeroPos() { return State.Hero; }
	static set HeroPos(value) { State.Hero = value; }
	static get HeroPath() { return State.HeroPath; }
	static set HeroPath(value) { State.HeroPath = value; }
	static get PathTarget() { return State.PathTarget; }
	static set PathTarget(value) { State.PathTarget = value; }
	static get HeroStats() { return legacyHeroStats; }
	static get EtzChaim() { return legacyEtzChaim; }
	static get Equipment() { return State.Equipment; }
	static set Equipment(value) { State.Equipment = value; }
	static get Inventory() { return State.Inventory; }
	static set Inventory(value) { State.Inventory = value; }
	static get MaterialBag() { return State.Inventory.materialBag; }
	static set MaterialBag(value) { State.Inventory.materialBag = value; }
	static get Gelt() { return State.Inventory.money || 0; }
	static set Gelt(value) { State.Inventory.money = value; }
	static get ActiveShlichus() { return State.Missions.legacyActive; }
	static set ActiveShlichus(value) { State.Missions.legacyActive = value; }
	static get CompletedShlichus() { return State.Missions.legacyCompleted; }
	static set CompletedShlichus(value) { State.Missions.legacyCompleted = value; }
	static get TimeState() { return State.WorldState.time; }
	static get Weather() { return State.WorldState.weather; }
	static get Purity() { return State.WorldState.purity; }
	static get Particles() { return State.BattleFx; }
	static set Particles(value) { State.BattleFx = value; }

	static ResolutionMultiplier = 2;
	static IsDialogueOpen = false;
	static DialogBankId = null;
	static DialogNodeId = 'START';
	static DialogLineIdx = 0;
	static DialogOptionCursor = 0;
	static VisibleText = '';
	static VisibleDialogText = '';
	static BattleMenuState = 'ROOT';
	static DebateCategory = 'mishnah';
	static EnemyStats = null;
	static IsSettingsMenuOpen = false;
	static SettingsSelectionIdx = 0;
	static Outfits = { owned: ['WHITE_LINEN'], active: 'WHITE_LINEN' };
	static Weapons = { owned: ['WEAPON_NONE'], active: 'WEAPON_NONE' };
}
