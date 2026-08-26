//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandValidator.js
 * @description
 * The Awtsmoos grants power through truthful boundary, so command data is known before execution ever touches a frame;
 * Awtsmoos.com validates protocol, registry identity, payload schema, normalization, and correlation from one canonical name.
 */

import { KeserAnimatorProtocol } from './protocol/AnimatorProtocol.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';
import { YesodAnimatorPayloadNormalizer } from './schema/AnimatorPayloadNormalizer.js';
import { GevurahAnimatorSchemaValidator } from './schema/AnimatorSchemaValidator.js';

/** Guards and normalizes the public Animator JSON protocol before commands reach domain handlers. */
export class AnimatorCommandValidator {
	/** @param {object} keliEnvelope Agent command envelope. @returns {object} Validated canonical execution record. */
	static normalize(keliEnvelope = {}) {
		if (!keliEnvelope || typeof keliEnvelope !== 'object' || Array.isArray(keliEnvelope)) {
			throw this.error('invalid_envelope', 'Animator command must be an object.');
		}
		const shemMitzvah = String(keliEnvelope.command ?? '').trim();
		if (!shemMitzvah) throw this.error('missing_command', 'Animator command name is required.');
		const keliDescriptor = DaasAnimatorCommandRegistry.get(shemMitzvah);
		if (!keliDescriptor) throw this.error('unsupported_command', `Unsupported Animator command: ${shemMitzvah}`);
		const sodVersion = this.normalizeVersion(keliEnvelope.version ?? keliEnvelope.apiVersion);
		if (!KeserAnimatorProtocol.accepts(sodVersion)) {
			throw this.error('unsupported_version', `Unsupported Animator API version: ${sodVersion}`, { requestedVersion: sodVersion, protocol: KeserAnimatorProtocol.describe() });
		}
		const keilimPayload = keliEnvelope.payload ?? {};
		if (!keilimPayload || typeof keilimPayload !== 'object' || Array.isArray(keilimPayload)) {
			throw this.error('invalid_payload', 'Animator command payload must be an object.');
		}
		const keilimNormalized = YesodAnimatorPayloadNormalizer.normalize(keliDescriptor.payloadSchema, keilimPayload);
		const sederIssues = GevurahAnimatorSchemaValidator.inspect(keliDescriptor.payloadSchema, keilimNormalized);
		if (sederIssues.length) throw this.issueError(sederIssues[0]);
		return {
			command: shemMitzvah,
			payload: keilimNormalized,
			requestId: this.normalizeRequestId(keliEnvelope.requestId),
			version: sodVersion,
			descriptor: keliDescriptor
		};
	}

	/** @param {unknown} sodVersion Optional caller version. @returns {string|null} Trimmed version or null. */
	static normalizeVersion(sodVersion) {
		if (sodVersion === undefined || sodVersion === null || sodVersion === '') return null;
		return String(sodVersion).trim();
	}

	/** @param {unknown} sodRequestId Optional correlation value. @returns {string|null} Trimmed request ID or null. */
	static normalizeRequestId(sodRequestId) {
		if (sodRequestId === undefined || sodRequestId === null) return null;
		const keterId = String(sodRequestId).trim();
		if (!keterId) throw this.error('invalid_request_id', 'requestId must not be empty when provided.');
		if (keterId.length > 160) throw this.error('invalid_request_id', 'requestId must be 160 characters or fewer.');
		return keterId;
	}

	/** @param {object} keliIssue Schema issue. @returns {Error} Coded public validation error. */
	static issueError(keliIssue) {
		return this.error(keliIssue.code, keliIssue.message, { path: keliIssue.path });
	}

	/** @param {string} sodCode Code. @param {string} orMessage Message. @param {object} keilimDetails Details. @returns {Error} Coded error. */
	static error(sodCode, orMessage, keilimDetails = null) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = sodCode;
		gevurahError.details = keilimDetails;
		return gevurahError;
	}
}
