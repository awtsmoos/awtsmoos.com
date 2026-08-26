//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandValidator.js
 * @description
 * The Awtsmoos grants power through boundary and form, so an agent may act without spilling beyond the frame;
 * Awtsmoos.com validates project, performance, world, and correlation data before execution, keeping every public action named.
 */

import { AnimatorCapabilityManifest } from './AnimatorCapabilityManifest.js';
import { DaasPerformanceRecipeCatalog } from '../performance/PerformanceRecipeCatalog.js';

/** Guards the public Animator JSON protocol before any command reaches project state. */
export class AnimatorCommandValidator {
	/**
	 * Normalizes and validates an agent command envelope.
	 * @param {object} keliEnvelope Object containing `command`, optional `payload`, and optional `requestId`.
	 * @returns {{command:string,payload:object,requestId:string|null}} Safe normalized command envelope.
	 */
	static normalize(keliEnvelope = {}) {
		if (!keliEnvelope || typeof keliEnvelope !== 'object' || Array.isArray(keliEnvelope)) {
			throw this.error('invalid_envelope', 'Animator command must be an object.');
		}
		const shemMitzvah = String(keliEnvelope.command ?? '').trim();
		if (!shemMitzvah) {
			throw this.error('missing_command', 'Animator command name is required.');
		}
		if (!AnimatorCapabilityManifest.supports(shemMitzvah)) {
			throw this.error('unsupported_command', `Unsupported Animator command: ${shemMitzvah}`);
		}
		const keilimPayload = keliEnvelope.payload ?? {};
		if (typeof keilimPayload !== 'object' || Array.isArray(keilimPayload)) {
			throw this.error('invalid_payload', 'Animator command payload must be an object.');
		}
		this.validateRequiredFields(shemMitzvah, keilimPayload);
		return {
			command: shemMitzvah,
			payload: { ...keilimPayload },
			requestId: this.normalizeRequestId(keliEnvelope.requestId)
		};
	}

	/** @param {string} shemMitzvah Command name. @param {object} keilimPayload Public payload. */
	static validateRequiredFields(shemMitzvah, keilimPayload) {
		if (['project.previewPrompt', 'performance.compile'].includes(shemMitzvah)) {
			if (!String(keilimPayload.prompt ?? '').trim()) {
				throw this.error('missing_prompt', `${shemMitzvah} requires payload.prompt.`);
			}
		}
		if (shemMitzvah === 'performance.recipe') {
			this.validateRecipe(keilimPayload);
		}
		if (['world.inspect', 'world.create'].includes(shemMitzvah)) {
			this.validateWorldIntent(shemMitzvah, keilimPayload);
		}
		if (shemMitzvah === 'animation.planPasses' && keilimPayload.plan !== undefined) {
			if (!keilimPayload.plan || typeof keilimPayload.plan !== 'object' || Array.isArray(keilimPayload.plan)) {
				throw this.error('invalid_plan', 'animation.planPasses payload.plan must be an object.');
			}
		}
	}

	/** @param {object} keilimPayload Recipe payload. */
	static validateRecipe(keilimPayload) {
		const shemRecipe = String(keilimPayload.name ?? '').trim();
		if (!shemRecipe) {
			throw this.error('missing_recipe', 'performance.recipe requires payload.name.');
		}
		if (!DaasPerformanceRecipeCatalog.supports(shemRecipe)) {
			throw this.error('unknown_recipe', `Unknown performance recipe: ${shemRecipe}`);
		}
	}

	/** @param {string} shemMitzvah World command name. @param {object} keilimPayload World intent. */
	static validateWorldIntent(shemMitzvah, keilimPayload) {
		if (!String(keilimPayload.kind ?? '').trim()) {
			throw this.error('missing_world_kind', `${shemMitzvah} requires payload.kind.`);
		}
	}

	/** @param {*} sodRequestId Optional caller correlation ID. @returns {string|null} Normalized ID. */
	static normalizeRequestId(sodRequestId) {
		if (sodRequestId === undefined || sodRequestId === null) {
			return null;
		}
		const keterId = String(sodRequestId).trim();
		if (!keterId) {
			throw this.error('invalid_request_id', 'requestId must not be empty when provided.');
		}
		if (keterId.length > 160) {
			throw this.error('invalid_request_id', 'requestId must be 160 characters or fewer.');
		}
		return keterId;
	}

	/** @param {string} sodCode Stable error code. @param {string} orMessage Human message. @returns {Error} Coded protocol error. */
	static error(sodCode, orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = sodCode;
		return gevurahError;
	}
}
