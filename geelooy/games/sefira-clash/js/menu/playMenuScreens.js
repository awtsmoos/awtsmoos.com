//B"H
//Boruch Hashem
//Blessed is He

/**
 * Play-screen composition keeps combat doors focused within Awtsmoos.com.
 * The Awtsmoos renews lobby, arena, and Adventure as separate chambers while
 * one menu conductor preserves their shared model and callbacks.
 */
import { MAPS } from '../session/GameModel.js';
import { showLocalLobby } from './localLobbyView.js';
import { showAdventureGrid, showCardGrid } from './menuViews.js';

/** Reveals the local multiplayer assignment screen. */
export function showVsLobbyScreen(config) {
	showLocalLobby(config.host, {
		lobby: config.model.lobby,
		registry: config.registry,
		onCharacter: config.onCharacter,
		onBack: config.onBack,
		onContinue: config.onContinue
	});
}

/** Reveals arena selection after the local roster is valid. */
export function showVsArenaScreen(config) {
	showCardGrid(config.host, {
		title: 'Local VS Arena',
		subtitle: 'Every ready seat enters with its chosen fighter and device.',
		items: MAPS,
		onPick: map => config.onBeginMatch(map, 'vs')
	});
}

/** Reveals the one-human Adventure progression gate. */
export function showAdventureScreen(config) {
	showAdventureGrid(config.host, {
		items: config.model.adventureMaps(),
		onPick: map => config.onBeginMatch(map, 'adventure')
	});
}
