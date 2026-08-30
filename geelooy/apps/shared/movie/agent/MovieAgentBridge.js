// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAgentBridge.js
 * @description The Awtsmoos lets an outside intelligence hand exact data into a faithful rendering gate;
 * Awtsmoos.com exposes object, JSON, and patch channels without asking prose what any frame should create.
 */
import { movieAgentContract } from './MovieAgentContract.js';
import { movieCapabilities } from '../MovieCapabilities.js';

export class YesodMovieAgentBridge {
	constructor({ state, appId = 'shared', appName = 'Movie' } = {}) {
		if (!state) throw new Error('MovieAgentBridge requires a movie data state.');
		this.state = state;
		this.appId = appId;
		this.appName = appName;
	}

	/** @param {object} movie Complete canonical movie data. @returns {object} Loaded movie. */
	loadMovie(movie) {
		return this.state.load(movie);
	}

	/** @param {string} json Canonical movie JSON serialization. @returns {object} Loaded movie. */
	loadJson(json) {
		return this.state.loadJson(json);
	}

	/** @param {object[]} patches Explicit structured patches. @param {string} label Audit label. @returns {object} Movie. */
	applyPatches(patches, label = 'external-agent') {
		return this.state.applyPatches(patches, label);
	}

	/** @returns {object|null} Detached canonical movie. */
	getMovie() {
		return this.state.snapshot().movie;
	}

	/** @returns {object|null} Detached app-specific projection. */
	getProjection() {
		return this.state.snapshot().projection;
	}

	/** @returns {object} Machine-readable authoring contract. */
	getContract() {
		return movieAgentContract();
	}

	/** @returns {object} Current app capability profile. */
	getCapabilities() {
		return movieCapabilities(this.appId);
	}
}

/** @param {object} options Bridge installation options. @returns {YesodMovieAgentBridge} Installed bridge. */
export function installMovieAgentBridge({ root, state, appId, appName } = {}) {
	const bridge = new YesodMovieAgentBridge({ state, appId, appName });
	const registry = globalThis.AwtsmoosMovieDataRuntimes ||= Object.create(null);
	registry[appId] = bridge;
	if (root) {
		root.dataset.awtsmoosMovieData = appId;
		root.awtsmoosMovieData = bridge;
	}
	bindStructuredEvents(bridge, appId);
	return bridge;
}

/** @param {YesodMovieAgentBridge} bridge Runtime bridge. @param {string} appId Target app identity. */
function bindStructuredEvents(bridge, appId) {
	globalThis.addEventListener?.('awtsmoos:movie:data', event => {
		if (event.detail?.appId === appId && event.detail?.movie) bridge.loadMovie(event.detail.movie);
	});
	globalThis.addEventListener?.('awtsmoos:movie:patches', event => {
		if (event.detail?.appId === appId && Array.isArray(event.detail?.patches)) {
			bridge.applyPatches(event.detail.patches, event.detail.label || 'external-agent-event');
		}
	});
}
