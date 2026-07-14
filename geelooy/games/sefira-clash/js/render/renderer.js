//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews contest and lived-world imagery in Awtsmoos.com: atmosphere, camera,
 * geometry, thresholds, traversal, citizens, fighters, effects, and mode-honest HUD. Every
 * layer witnesses simulation truth after culling and never owns mission or combat law.
 */

import { updateCamera } from '../camera/camera.js';
import { drawBattlefieldScars } from '../stage/scars/battlefieldScars.js';
import { drawHazards } from '../stage/hazards/hazardRender.js';
import { drawObjective } from '../stage/objectives/objectiveDirector.js';
import { drawSpectacleOverlay } from '../spectacle/spectacleRender.js';
import { drawBackground } from './background.js';
import { drawExpeditionBackdrop, drawExpeditionHud } from './ExpeditionVisuals.js';
import { drawFighters } from './fighters.js';
import { drawOpenWorldAmbient } from './OpenWorldAmbientPainter.js';
import { drawOpenWorldCitizens } from './OpenWorldCitizenPainter.js';
import { drawOpenWorldEncounterHud } from './OpenWorldEncounterHud.js';
import { drawOpenWorldHud } from './OpenWorldHud.js';
import { drawOpenWorldPerformanceHud } from './OpenWorldPerformanceHud.js';
import { drawOpenWorldScene } from './OpenWorldPainter.js';
import { drawOpenWorldTraversal } from './OpenWorldTraversalPainter.js';
import { drawParticles } from './particles.js';
import { drawPlatforms } from './platforms.js';
import { drawPowerups } from './powerups.js';
import {
	makeRenderView,
	visibleRenderHazards,
	visibleRenderPoints,
	visibleRenderRects
} from './renderVisibility.js';
import { drawUi } from './ui.js';
import { drawHeldWeapons, drawWeapons } from './weapons.js';

export function draw(ctx, state, width, height) {
	ctx.clearRect(0, 0, width, height);
	drawBackground(ctx, state.map, width, height);
	drawExpeditionBackdrop(ctx, state, width, height);
	updateCamera(state, width, height);
	const zoom = state.camera.zoom || 1;
	const view = makeRenderView(state.camera, width, height, 300, zoom);
	ctx.save();
	ctx.translate(width / 2, height / 2);
	ctx.scale(zoom, zoom);
	ctx.translate(state.camera.x - width / 2, state.camera.y - height / 2);
	drawWorldLayers(ctx, state, view);
	ctx.restore();
	drawScreenLayers(ctx, state, width, height);
}

function drawWorldLayers(ctx, state, view) {
	drawBattlefieldScars(ctx, visibleRenderPoints(state.scars || [], view));
	drawPlatforms(
		ctx,
		visibleRenderRects([...(state.map.platforms || []), ...(state.map.walls || [])], view),
		state.map
	);
	drawOpenWorldScene(ctx, state);
	if (state.mode === 'openworld') drawOpenWorldActors(ctx, state, view);
	drawHazards(ctx, visibleRenderHazards(state.hazards || [], view));
	drawObjective(ctx, state.objective);
	drawPowerups(ctx, visibleRenderPoints(state.powerups || [], view));
	drawWeapons(ctx, visibleRenderPoints(state.weapons || [], view));
	drawHeldWeapons(
		ctx,
		state.fighters.filter(fighter => !fighter.hidden)
	);
	drawFighters(ctx, visibleRenderPoints(state.fighters, view));
	drawParticles(ctx, visibleRenderPoints(state.particles, view));
}

function drawOpenWorldActors(ctx, state, view) {
	const world = state.openWorld;
	drawOpenWorldAmbient(ctx, visibleRenderPoints(world.ambientParticles, view));
	drawOpenWorldTraversal(
		ctx,
		visibleRenderRects(state.map.openWorld?.traversalNodes || [], view),
		world.usedTraversalNodes,
		world.nearby?.kind === 'traversal' ? world.nearby.id : ''
	);
	drawOpenWorldCitizens(
		ctx,
		visibleRenderPoints(world.activeCitizens, view),
		world.nearby?.kind === 'citizen' ? world.nearby.id : ''
	);
}

function drawScreenLayers(ctx, state, width, height) {
	if (state.mode === 'openworld') {
		drawOpenWorldHud(ctx, state, width, height);
		drawOpenWorldEncounterHud(ctx, state, width, height);
		drawOpenWorldPerformanceHud(ctx, state, width);
	} else {
		drawUi(ctx, state, width, height);
		drawExpeditionHud(ctx, state, width, height);
	}
	drawSpectacleOverlay(ctx, state, width, height);
}
