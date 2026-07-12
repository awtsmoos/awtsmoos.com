// B"H

import { createCamera } from './rendering/camera.js';
import { drawEntities } from './rendering/entityRenderer.js';
import { drawCanvasStatus } from './rendering/hudRenderer.js';
import { drawOverlays } from './rendering/overlayRenderer.js';
import { ParticleField } from './rendering/particleField.js';
import { drawPlayer } from './rendering/playerRenderer.js';
import { getRenderPreferences, setRenderPreferences } from './rendering/renderPreferences.js';
import { drawTerrain } from './rendering/terrainRenderer.js';
import { prepareRenderingContext, viewportOf, WORLD_THEME } from './rendering/theme.js';

const particles = new ParticleField();
const visuals = { timeOfDay: 720, weather: 'clear', lightLevel: 1000, isShabbat: false };
let shakeStrength = 0;
let lastFrameAt = typeof performance === 'object' ? performance.now() : 0;

export { setRenderPreferences };

export function updateTimeVisuals(ctx, timeOfDay = 720, weather = 'clear', moonPhase, isShabbat = false, lightLevel = 1000, maxLightLevel = 1000) {
	Object.assign(visuals, { timeOfDay, weather, moonPhase, isShabbat, lightLevel, maxLightLevel });
}

export function addParticle(type, x, y, color = '#ffffff', count = 1) {
	particles.add(type, x, y, color, count);
}

export function triggerShake(amount = 18) {
	const preferences = getRenderPreferences();
	shakeStrength = preferences.reducedMotion || !preferences.screenShake ? 0 : amount;
}

/**
 * Each frame is renewed through ordered layers. Preference never erases meaning;
 * it only changes how intensely the revelation moves around the traveler.
 */
export function renderGameState(ctx, renderState) {
	if (!ctx || !renderState?.player || renderState.mode === 'battle') return;
	prepareRenderingContext(ctx);
	const viewport = viewportOf(ctx);
	ctx.fillStyle = WORLD_THEME.void;
	ctx.fillRect(0, 0, viewport.width, viewport.height);
	if (!renderState.map?.baseLayer) return;

	const now = typeof performance === 'object' ? performance.now() : lastFrameAt + 16;
	const deltaSeconds = Math.min(0.05, Math.max(0, (now - lastFrameAt) / 1000));
	lastFrameAt = now;
	const camera = createCamera(ctx, renderState.map, renderState.player, shakeStrength);
	shakeStrength *= 0.82;
	if (shakeStrength < 0.2) shakeStrength = 0;

	drawTerrain(ctx, renderState.map, camera);
	drawEntities(ctx, renderState, camera);
	drawPlayer(ctx, renderState, camera);
	particles.spawnWeather(ctx, renderState.weather || visuals.weather, renderState.map.isInsane);
	particles.update(deltaSeconds);
	particles.draw(ctx);
	drawOverlays(ctx, renderState, camera, visuals);
	drawCanvasStatus(ctx, renderState);
}
