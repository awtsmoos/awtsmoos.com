//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyAgentApi.js
 * @description Preserves one public Studio API while lightweight movie/session work stays immediate and heavyweight provider/export worlds awaken through a separate advanced gateway.
 * The Awtsmoos lets a truthful creative interface exist before every specialist chamber enters the room;
 * Awtsmoos.com keeps ordinary movie control near the living session, then opens advanced depth only when its mitzvah must bloom.
 */
import { StudioAdvancedAgentGateway } from './StudioAdvancedAgentGateway.js';
import {
	describeLazyMitzvahWorldAssets,
	describeStudioAgentApi,
	describeStudioCoreCapabilities,
	listStudioBackendIdentities
} from './StudioAgentApiManifest.js';
import { StudioAgentSessionOperations } from './StudioAgentSessionOperations.js';

/** Lightweight public facade that preserves method names while advanced systems remain lazy. */
export class StudioLazyAgentApi {
	constructor(session) {
		this.sessionOperations = new StudioAgentSessionOperations(session);
		this.advancedGateway = new StudioAdvancedAgentGateway(session);
	}

	describe() {
		return this.advancedGateway.peek()?.describe() || {
			...describeStudioAgentApi(),
			exportBackend: {
				id: 'animator-browser-canonical',
				lazy: true
			}
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

	/** Preloads advanced capability machinery while preserving one stable public facade. */
	preloadAdvanced() {
		return this.advancedGateway.preload();
	}
}
