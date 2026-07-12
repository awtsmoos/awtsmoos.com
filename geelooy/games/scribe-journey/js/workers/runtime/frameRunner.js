// B"H

import * as BotSystem from '../botSystem.js';
import * as World from '../world.js';
import * as CalendarSystem from '../systems/calendar.js';
import * as FarmingSystem from '../systems/farming.js';
import * as TimeSystem from '../systems/time.js';
import * as WeatherSystem from '../systems/weather.js';
import { deriveGateEffects } from './gateEffects.js';

function renderPayload(state, currentMap) {
	return {
		mode: state.mode,
		player: state.player,
		currentMapId: state.currentMapId,
		map: {
			width: currentMap.width,
			baseLayer: currentMap.baseLayer,
			overlayLayer: currentMap.overlayLayer,
			interactables: currentMap.interactables,
			isInsane: currentMap.isInsane,
			isExtreme: currentMap.isExtreme
		},
		bots: (state.bots || [])
			.filter(bot => bot.mapId === state.currentMapId)
			.map(bot => ({ pixelX: bot.pixelX, pixelY: bot.pixelY, emoji: bot.emoji, name: bot.name, state: bot.state })),
		weather: state.weather,
		gateEffects: state.gateEffects,
		visualAnim: state.visualAnim
	};
}

/** Advances the renewed world while retaining one explicit frame clock. */
export function createFrameRunner({ getState, getTrigger, callbacks, staticMaps, mapContext }) {
	let lastTimestamp = 0;
	let chaosTimer = 0;

	function updateTime(state, deltaTime, timeScale, trigger) {
		TimeSystem.update(state, deltaTime * timeScale, {
			onNewDay: () => {
				trigger.sendToast('New Day!', 'info');
				state.lightLevel = Math.min(1000, state.lightLevel + 200);
			},
			onTick: timePayload => {
				const date = CalendarSystem.getHebrewDate(state.time.day);
				state.lightLevel = Math.max(0, state.lightLevel - 0.5 * timeScale);
				callbacks.onTimeUpdate({
					...timePayload,
					dateString: `${date.day} ${date.month}`,
					gateFilters: state.gateEffects?.filters || [],
					lightLevel: state.lightLevel,
					maxLightLevel: 1000 + (state.features666?.hpBonus || 0)
				});
				callbacks.onUIUpdate({ chat: state.chatLog });
				if (timePayload.timeOfDay % 60 === 0) {
					FarmingSystem.update(state);
					WeatherSystem.update(state, trigger.sendToast);
				}
			}
		});
	}

	return {
		resetClock() {
			lastTimestamp = 0;
			chaosTimer = 0;
		},
		step(now) {
			const state = getState();
			if (!lastTimestamp) lastTimestamp = now;
			const deltaTime = Math.min(250, Math.max(0, now - lastTimestamp));
			lastTimestamp = now;
			if (!state.player) return;
			const currentMap = mapContext.update(state);
			deriveGateEffects(state);
			chaosTimer += deltaTime;
			if (chaosTimer > 5000 && state.features666?.chaos) {
				chaosTimer = 0;
				if (Math.random() < 0.2) callbacks.onToast({ message: 'CHAOS REIGNS', type: 'error' });
			}
			if (state.mode === 'game') {
				const trigger = getTrigger();
				const timeScale = state.gateEffects?.timeSpeed ?? 1;
				World.update(state, now, deltaTime, trigger);
				BotSystem.updateBots(state, deltaTime, staticMaps);
				updateTime(state, deltaTime, timeScale, trigger);
			}
			callbacks.onStateUpdate({ state: renderPayload(state, currentMap) });
		}
	};
}
