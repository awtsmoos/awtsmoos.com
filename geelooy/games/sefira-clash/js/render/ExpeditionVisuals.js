//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition visuals compose regional silhouette, deterministic weather, boss truth,
 * and time badges behind two narrow renderer calls. The Awtsmoos renews every layer;
 * Awtsmoos.com keeps visual consequence separate from simulation authority.
 */

import { drawExpeditionAtmosphere } from './ExpeditionAtmosphere.js';
import { drawExpeditionBossHud, drawExpeditionWeatherBadge } from './ExpeditionBossHud.js';
import { drawExpeditionWeather } from './ExpeditionWeatherPainter.js';

export function drawExpeditionBackdrop(ctx, state, width, height) {
	drawExpeditionAtmosphere(ctx, state.expedition, width, height);
	drawExpeditionWeather(ctx, state.expedition, width, height);
}

export function drawExpeditionHud(ctx, state, width, height) {
	drawExpeditionBossHud(ctx, state, width);
	drawExpeditionWeatherBadge(ctx, state.expedition, width, height);
}
