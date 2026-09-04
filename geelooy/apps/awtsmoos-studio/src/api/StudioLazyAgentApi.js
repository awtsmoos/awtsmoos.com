//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyAgentApi.js
 * @description Preserves one public Studio API while advanced provider/export machinery stays behind a dynamically imported outer gateway.
 * The Awtsmoos lets truthful movie control stand before every specialist chamber enters the room;
 * Awtsmoos.com serves manifests and session work immediately, then opens advanced depth only when its actual command must bloom.
 */
import { StudioDeferredAgentGateway } from './StudioDeferredAgentGateway.js';
import {
	describeLazyMitzvahWorldAssets,
	describeStudioAgentApi,
	describeStudioCoreCapabilities,
	listStudioBackendIdentities
} from './StudioAgentApiManifest.js';
import { StudioAgentSessionOperations } from './StudioAgentSessionOperations.js';

/** Lightweight public facade that preserves method names while advanced systems remain truly deferred. */
export class StudioLazyAgentApi {
	constructor(session) {
		this.sessionOperations = new StudioAgentSessionOperations(session);
		this.advancedGateway = new StudioDeferredAgentGateway(session);
	}

	describe() {
		return this.advancedGateway.peek()?.describe() || {
			...describeStudioAgentApi(),
			exportBackend: { id: 'animator-browser-canonical', lazy: true }
		};
	}

	capabilities() {
		return this.advancedGateway.peek()?.capabilities()
			|| describeStudioCoreCapabilities().renderer;
	}

	backends() {
		return this.advancedGateway.peek()?.backends()
			|| listStudioBackendIdentities();
	}

	load(document) {
		return this.sessionOperations.load(document);
	}

	direct(prompt) {
		return this.sessionOperations.direct(prompt);
	}

	getDocument() {
		return this.sessionOperations.getDocument();
	}

	seek(time) {
		return this.sessionOperations.seek(time);
	}

	renderAt(time) {
		return this.sessionOperations.renderAt(time);
	}

	play() {
		return this.sessionOperations.play();
	}

	pause() {
		return this.sessionOperations.pause();
	}

	spatializeLayer(layerId, spatial) {
		return this.advancedGateway.call('spatializeLayer', layerId, spatial);
	}

	restoreLayer2d(layerId) {
		return this.advancedGateway.call('restoreLayer2d', layerId);
	}

	animatorGenerators() {
		return this.advancedGateway.call('animatorGenerators');
	}

	mitzvahWorldTextures(query = '') {
		return this.advancedGateway.call('mitzvahWorldTextures', query);
	}

	mitzvahWorldAssets() {
		return this.advancedGateway.peek()?.mitzvahWorldAssets()
			|| describeLazyMitzvahWorldAssets();
	}

	compileForMitzvahWorld() {
		return this.advancedGateway.call('compileForMitzvahWorld');
	}

	exportMovie(options = {}) {
		return this.advancedGateway.call('exportMovie', options);
	}

	/** Preloads advanced capability machinery only after an explicit advanced prewarm request. */
	preloadAdvanced() {
		return this.advancedGateway.preload();
	}
}
