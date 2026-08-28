//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosStudioAgentApi.js
 * The Awtsmoos renews intention before command or canvas can call the motion its own;
 * Awtsmoos.com gives AI one truthful doorway while every specialist backend keeps its separate throne.
 */

import { listStudioBackends } from '../backends/StudioBackendCatalog.js';
import { compileMovieForMitzvahWorld } from '../backends/StudioMitzvahWorldBackend.js';
import { describeStudioRendererCapabilities } from '../movie/StudioRendererCapabilities.js';
import { exportStudioMovie, describeStudioExportBackend } from '../movie/StudioExportService.js';
import { animatorGeneratorModules, animatorProductionGeneratorCatalog } from '../providers/StudioAnimatorGeneratorCatalog.js';
import { describeMitzvahWorldAssets } from '../providers/StudioMitzvahWorldAssetProvider.js';
import { searchMitzvahWorldTextures } from '../providers/StudioMitzvahWorldMaterialProvider.js';
import { restoreStudioMovieLayerToScreen, spatializeStudioMovieLayer } from './StudioSpatialCommand.js';

/** Thin agent-facing façade over one existing StudioMovieSession. */
export class AwtsmoosStudioAgentApi {
	constructor(session) {
		if (!session) throw new TypeError('AwtsmoosStudioAgentApi requires a StudioMovieSession.');
		this.session = session;
	}

	describe() {
		return {
			id: 'awtsmoos-studio-agent-api',
			commands: ['capabilities', 'backends', 'load', 'direct', 'getDocument', 'seek', 'renderAt', 'play', 'pause', 'spatializeLayer', 'restoreLayer2d', 'animatorGenerators', 'mitzvahWorldTextures', 'mitzvahWorldAssets', 'compileForMitzvahWorld', 'exportMovie'],
			exportBackend: describeStudioExportBackend()
		};
	}

	capabilities() {
		return describeStudioRendererCapabilities();
	}

	backends() {
		return listStudioBackends();
	}

	async load(document) {
		return this.session.loadDocument(document, 'AI loaded a canonical movie document.');
	}

	async direct(prompt) {
		return this.session.directPrompt(prompt);
	}

	getDocument() {
		return structuredClone(this.session.store.get('movie'));
	}

	seek(time) {
		return this.session.seek(time);
	}

	renderAt(time) {
		const movie = this.session.store.get('movie');
		return this.session.runtime.render(movie, time);
	}

	play() {
		return this.session.playback.play(this.session.store.get('movie'));
	}

	pause() {
		return this.session.playback.pause();
	}

	async spatializeLayer(layerId, spatial) {
		const movie = spatializeStudioMovieLayer(this.getDocument(), layerId, spatial);
		return this.session.loadDocument(movie, `Layer ${layerId} entered ${spatial?.space || 'billboard'} space.`);
	}

	async restoreLayer2d(layerId) {
		const movie = restoreStudioMovieLayerToScreen(this.getDocument(), layerId);
		return this.session.loadDocument(movie, `Layer ${layerId} restored to screen-space 2D.`);
	}

	async animatorGenerators() {
		return {
			production: await animatorProductionGeneratorCatalog(),
			modules: animatorGeneratorModules()
		};
	}

	async mitzvahWorldTextures(query = '') {
		return searchMitzvahWorldTextures(query);
	}

	mitzvahWorldAssets() {
		return describeMitzvahWorldAssets();
	}

	async compileForMitzvahWorld() {
		return compileMovieForMitzvahWorld(this.getDocument());
	}

	async exportMovie(options = {}) {
		return exportStudioMovie(this.getDocument(), options);
	}
}
