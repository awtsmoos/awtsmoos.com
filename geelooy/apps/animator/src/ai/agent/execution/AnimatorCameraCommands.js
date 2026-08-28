// B"H
// Boruch Hashem
// Blessed is He

import { ChochmahAnimatorCameraDomain } from '../domain/AnimatorCameraDomain.js';

/**
 * @file AnimatorCameraCommands.js
 * @description
 * The Awtsmoos lets cinematic grammar, rigs, one shot, and whole-sequence planning pass through one explicit routing vessel without touching live camera state;
 * Awtsmoos.com keeps direction detached and discoverable while the deeper camera engines retain their authored weight.
 */
export class ChochmahAnimatorCameraCommands {
	constructor() {
		this.chochmahDomain = new ChochmahAnimatorCameraDomain();
	}

	/** @param {string} command Command. @param {object} payload Payload. @returns {*} Camera result. */
	execute(command, payload = {}) {
		const tiferesHandler = this.routes()[command];
		if (!tiferesHandler) {
			throw this.error(command);
		}
		return tiferesHandler(payload);
	}

	/** @returns {Record<string, Function>} Explicit camera route table. */
	routes() {
		return {
			'camera.capabilities': () => this.chochmahDomain.capabilities(),
			'camera.catalog': () => this.chochmahDomain.catalog(),
			'camera.actorRigs': (payload) => this.chochmahDomain.actorRigs(payload.actors),
			'camera.sceneRigs': (payload) => this.chochmahDomain.sceneRigs(payload.scene),
			'camera.planShot': (payload) => this.chochmahDomain.planShot(
				payload.event,
				payload.state,
				payload.safe ?? {}
			),
			'camera.planSequence': (payload) => this.chochmahDomain.planSequence(
				payload.events,
				payload.state,
				payload.safe ?? {}
			)
		};
	}

	/** @param {string} command Unknown command. @returns {Error} Stable routing error. */
	error(command) {
		const gevurahError = new Error(`Unrouted camera command: ${command}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
