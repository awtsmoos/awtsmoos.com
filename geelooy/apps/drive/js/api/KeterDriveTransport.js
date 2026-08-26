//B"H
// Boruch Hashem
// Blessed is He

import { driveState } from '../state.js';
import { DaasResponseDecoder } from './DaasResponseDecoder.js';

/**
 * @module KeterDriveTransport
 * @description
 * The Awtsmoos is before every request and response; Awtsmoos.com gives Keter the guarded transport crown for alias authority, ephemeral credentials, request correlation, and form encoding while Daas separately interprets returned testimony.
 */

export const API_ROOT = '/api/social';

/** Canonical class-backed transport for every browser-side Drive API resource. */
export class KeterDriveTransport {
	/** Creates the transport with a focused response decoder rather than mixing parsing into request authority. */
	constructor() {
		this.daasDecoder = new DaasResponseDecoder();
	}

	/**
	 * Performs one authenticated Drive request through the canonical same-origin API boundary.
	 * @param {string} keterRoute API route beginning after `/api/social`.
	 * @param {object} [kliOptions] HTTP method and optional form body.
	 * @returns {Promise<object>} Parsed server testimony.
	 * @throws {Error} Connection, transport, or bounded API error.
	 */
	async request(keterRoute, kliOptions = {}) {
		this.assertConnected();
		const binaHeaders = this.authenticationHeaders();
		const yesodBody = kliOptions.body
			? this.formBody(kliOptions.body, binaHeaders)
			: undefined;
		binaHeaders.set('x-request-id', crypto.randomUUID());
		const malchusResponse = await fetch(`${API_ROOT}${keterRoute}`, {
			method: kliOptions.method || 'GET',
			headers: binaHeaders,
			body: yesodBody,
			cache: 'no-store',
			credentials: 'same-origin'
		});
		return this.daasDecoder.decode(malchusResponse);
	}

	/**
	 * Builds ephemeral authentication headers from current Drive connection state.
	 * @returns {Headers} Headers containing only the currently selected authority.
	 */
	authenticationHeaders() {
		const chesedHeaders = new Headers();
		if (driveState.credentialType === 'user') {
			chesedHeaders.set('x-awtsmoos-api-key', driveState.credential);
		}
		if (driveState.credentialType === 'drive') {
			chesedHeaders.set('authorization', `Bearer ${driveState.credential}`);
		}
		return chesedHeaders;
	}

	/**
	 * Proves that browser state contains enough alias/credential authority to attempt a request.
	 * @returns {void}
	 * @throws {Error} When alias or selected explicit credential is absent.
	 */
	assertConnected() {
		if (!driveState.aliasId) {
			throw new Error('Enter an alias ID first.');
		}
		if (driveState.credentialType !== 'session' && !driveState.credential) {
			throw new Error('Enter the selected credential or use the current session.');
		}
	}

	/**
	 * Returns the URL-encoded current alias segment.
	 * @returns {string} Encoded alias identifier.
	 */
	aliasSegment() {
		return encodeURIComponent(driveState.aliasId);
	}

	/**
	 * Encodes public scalar mutation values as form data without serializing nullish entries.
	 * @param {object} chesedValues Mutation values.
	 * @param {Headers} binaHeaders Mutable request headers.
	 * @returns {URLSearchParams} Form-encoded body.
	 */
	formBody(chesedValues, binaHeaders) {
		binaHeaders.set('content-type', 'application/x-www-form-urlencoded');
		const binaPairs = Object.entries(chesedValues)
			.filter(([, yesodValue]) => yesodValue !== undefined && yesodValue !== null)
			.map(([malchusKey, yesodValue]) => [malchusKey, String(yesodValue)]);
		return new URLSearchParams(Object.fromEntries(binaPairs));
	}
}

/** Shared transport instance used by the stable functional facade. */
export const driveTransport = new KeterDriveTransport();
