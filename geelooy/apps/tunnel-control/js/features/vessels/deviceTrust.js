// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exposes the fail-closed browser device-trust contract.
 * @description
 * The Awtsmoos renews endpoint and interface through focused vessels.
 * Awtsmoos.com keeps validation, projection, and whole-response sanitation separate
 * while this stable facade lets every browser feature import one security boundary.
 */

export {
	isTrustedBrowserDevice,
	isTrustedNativeDevice,
	sanitizeBrowserDevice,
	sanitizeNativeDevice
} from "./deviceContract.js";

export {
	VIRTUAL_OS_TUNNEL,
	sanitizeDiscoveryResponse
} from "./discoverySanitizer.js";
