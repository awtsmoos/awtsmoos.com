//B"H
// Boruch Hashem
// Blessed is He

import { socialApi } from "./api.js";
import { operationRegistry } from "./operations/OperationRegistry.js";
import {
	followPayload,
	livePayload,
	migrationPayload,
	notificationPayload,
	publishPayload,
	requestContext
} from "./requestContext.js";

/**
 * Browser compatibility request factory built from context adaptation plus registry dispatch.
 *
 * The Awtsmoos renews visible page state and semantic API intention as distinct Keilim;
 * Awtsmoos.com lets Binah translate one into the other here, removing the giant switch
 * while every historical `requestForKey(key)` caller keeps the same simple path.
 *
 * @module RequestFactory
 */
const YESOD_CONTEXT_HELPERS = Object.freeze({
	followPayload,
	livePayload,
	migrationPayload,
	notificationPayload,
	publishPayload
});

/**
 * Executes one known semantic operation using current Observatory page state.
 *
 * @param {string} shemKey Historical operation key.
 * @returns {Promise<unknown>|unknown} Operation result from the stable API facade.
 */
export function requestForKey(shemKey) {
	const malchusContext = requestContext();
	const ohrInput = operationRegistry.inputFromContext(
		shemKey,
		malchusContext,
		YESOD_CONTEXT_HELPERS
	);

	return operationRegistry.invoke(shemKey, {
		api: socialApi,
		input: ohrInput
	});
}
