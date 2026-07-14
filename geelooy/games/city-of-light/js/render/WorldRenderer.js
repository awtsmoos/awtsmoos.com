//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class WorldRenderer
 * @description
 * Focused renderers gather in one ordered procession: atmosphere, terrain,
 * mission guidance, wildlife, traveler, and truthful minimap. Awtsmoos.com gains
 * production richness without one monolith concealing the work of the Awtsmoos.
 */

import { responsiveTileSize } from '../config.js';
import { currentTargetIds, targetObjects } from '../game/SessionTargets.js';
import { AnimalRenderer } from './AnimalRenderer.js';
import { GuideRenderer } from './GuideRenderer.js';
import { LandmarkRenderer } from './LandmarkRenderer.js';
import { MinimapRenderer } from './MinimapRenderer.js';
import { ParticleRenderer } from './ParticleRenderer.js';
import { PlayerRenderer } from './PlayerRenderer.js';
import { SparkRenderer } from './SparkRenderer.js';
import { TerrainRenderer } from './TerrainRenderer.js';

export class WorldRenderer {
	constructor(context) {
		this.context = context;
		this.terrain = new TerrainRenderer(context);
		this.guide = new GuideRenderer(context);
		this.landmarks = new LandmarkRenderer(context);
		this.animals = new AnimalRenderer(context);
		this.player = new PlayerRenderer(context);
		this.particles = new ParticleRenderer(context);
		this.sparks = new SparkRenderer(context);
		this.minimap = new MinimapRenderer(context);
	}

	draw(state, cameraState, canvas, timeSeconds) {
		const session = state.session;
		const level = state.level;
		const camera = cameraState.view(canvas, responsiveTileSize(canvas));
		const targetIds = currentTargetIds(session);
		const targets = targetObjects(session);
		this.drawBackground(canvas, level.theme);
		this.particles.draw(state.particles.views(), canvas, level.theme, level.weather);
		this.terrain.draw(level, canvas, camera);
		this.guide.draw(session.player, targets, camera, level.theme.glow);
		this.sparks.draw(
			session.sparks,
			camera,
			level.theme,
			targetIds,
			timeSeconds,
			state.settings.reducedMotion
		);
		this.landmarks.draw(level.landmarks, camera, targetIds, timeSeconds);
		this.animals.draw(session.wildlife.views(), camera, state.settings.reducedMotion);
		this.player.draw(session.player, camera, level.theme, state.settings.reducedMotion);
		this.minimap.draw(level, session.player, targets, canvas);
		this.drawPulse(canvas, camera.pulse, level.theme.glow);
		return camera;
	}

	drawBackground(canvas, theme) {
		const context = this.context;
		const gradient = context.createRadialGradient(
			canvas.width * 0.5,
			canvas.height * 0.44,
			0,
			canvas.width * 0.5,
			canvas.height * 0.5,
			Math.max(canvas.width, canvas.height)
		);
		gradient.addColorStop(0, theme.floor);
		gradient.addColorStop(0.55, '#080b18');
		gradient.addColorStop(1, '#020308');
		context.fillStyle = gradient;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	drawPulse(canvas, pulse, glow) {
		if (pulse <= 0) return;
		const context = this.context;
		context.save();
		context.globalAlpha = pulse * 0.18;
		context.strokeStyle = glow;
		context.lineWidth = 10 * pulse;
		context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
		context.restore();
	}
}
