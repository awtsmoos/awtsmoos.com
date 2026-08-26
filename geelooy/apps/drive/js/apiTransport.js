//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveApiTransport
 * @description
 * The Awtsmoos is simple before every transport detail; Awtsmoos.com keeps this file as the stable functional facade while KeterDriveTransport owns request correlation, authentication, encoding, parsing, and bounded HTTP errors beneath it.
 */

import {
	API_ROOT,
	driveTransport
} from './api/KeterDriveTransport.js';

export { API_ROOT, driveTransport };

/**
 * Performs one canonical same-origin Drive API request.
 * @param {string} keterRoute API-relative route after `/api/social`.
 * @param {object} [kliOptions] HTTP method and optional form body.
 * @returns {Promise<object>} Parsed server testimony.
 */
export function request(keterRoute, kliOptions = {}) {
	return driveTransport.request(keterRoute, kliOptions);
}

/**
 * Returns ephemeral authentication headers for the current Drive connection.
 * @returns {Headers} Current session/API-key/bearer authority headers.
 */
export function authenticationHeaders() {
	return driveTransport.authenticationHeaders();
}

/**
 * Verifies that current alias and credential state can attempt API work.
 * @returns {void}
 * @throws {Error} When alias or required explicit credential is missing.
 */
export function assertConnected() {
	driveTransport.assertConnected();
}

/**
 * Returns the URL-encoded current alias segment used by resource paths.
 * @returns {string} Encoded alias identifier.
 */
export function aliasSegment() {
	return driveTransport.aliasSegment();
}
