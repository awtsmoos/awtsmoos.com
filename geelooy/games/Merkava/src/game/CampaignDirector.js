//B"H
// Boruch Hashem
// Blessed is He
/**
 * The campaign turns distance into routes, blessings, worlds, victory, or endless renewal.
 * The Awtsmoos opens every chamber anew while Awtsmoos.com carries the journey.
 */
import { BOSS_PROFILES, WORLDS, currentLevel } from '../config/campaignConfig.js';
import { GAME } from '../config/gameConfig.js';
import { isEndlessMode } from '../modes/RunModeCatalog.js';
import { clearCampaignLaneState, renewEndlessCampaign } from './CampaignTransitions.js';
import { createBoss } from './EntityFactory.js';

export class CampaignDirector {
	update(state) {
		if (state.paused || state.transitionRequest || state.victory) {
			return;
		}
		if (state.blessing >= GAME.blessingThreshold && !state.boss) {
			this.openFragmentBlessing(state);
			return;
		}
		const level = currentLevel(state);
		if (state.levelProgress < GAME.levelDistance) {
			return;
		}
		if (level.boss) {
			this.ensureBoss(state);
			return;
		}
		state.pendingAdvance = true;
		state.transitionRequest = level.checkpoint ? 'shop' : 'route';
		state.paused = true;
		state.pushEvent('level-complete', { name: level.name });
	}

	openFragmentBlessing(state) {
		state.blessing -= GAME.blessingThreshold;
		state.blessingFragments = 0;
		state.transitionRequest = 'fragment-blessing';
		state.paused = true;
		state.pushEvent('fragments-complete');
	}

	ensureBoss(state) {
		if (state.boss) {
			return;
		}
		const profile = BOSS_PROFILES[state.worldIndex];
		state.boss = createBoss(profile, state.worldIndex);
		if (isEndlessMode(state)) {
			const multiplier = state.endlessBossHealthMultiplier || 1;
			state.boss.health = Math.round(state.boss.health * multiplier);
			state.boss.maxHealth = state.boss.health;
		}
		state.pushEvent('boss-enter', {
			name: profile.name,
			cycle: state.endlessCycle
		});
	}

	markBossDefeated(state) {
		state.bossesDefeated += 1;
		state.pendingAdvance = true;
		state.transitionRequest = 'major-blessing';
		state.paused = true;
		state.pushEvent('boss-defeated', { world: state.worldIndex });
	}

	continueChoice(state) {
		if (state.pendingAdvance) {
			this.advance(state);
			return;
		}
		state.transitionRequest = null;
		state.paused = false;
	}

	clearLaneState(state) {
		clearCampaignLaneState(state);
	}

	advance(state) {
		if (!state.pendingAdvance) {
			return;
		}
		state.pendingAdvance = false;
		state.transitionRequest = null;
		state.paused = false;
		state.levelProgress = 0;
		this.clearLaneState(state);
		if (state.levelIndex < WORLDS[state.worldIndex].levels.length - 1) {
			state.levelIndex += 1;
			state.pushEvent('level-enter', { name: currentLevel(state).name });
			return;
		}
		if (state.worldIndex < WORLDS.length - 1) {
			state.worldIndex += 1;
			state.levelIndex = 0;
			state.pushEvent('world-enter', { world: WORLDS[state.worldIndex].name });
			return;
		}
		if (isEndlessMode(state)) {
			renewEndlessCampaign(state);
			return;
		}
		state.victory = true;
		state.running = false;
		state.pushEvent('campaign-victory');
	}
}
