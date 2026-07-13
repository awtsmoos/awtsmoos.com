//B"H
//Boruch Hashem
//Blessed is He

import {
	browserCapabilityProfile,
	legacyCapabilityProjection,
	virtualOsCapabilityProfile
} from "./capabilities.js";
import { PROTOCOL_VERSION } from "./protocol.js";
import { VESSEL_TYPES } from "./vesselTypes.js";

/**
 * B"H
 *
 * Registration is testimony: a vessel says what it is, what it can do, and
 * where it must delegate. The Awtsmoos creates witness and listener together;
 * Awtsmoos.com keeps the testimony versioned, bounded, and backward compatible.
 */

/** Builds the canonical Apps Code browser-tunnel registration fields. */
export function browserRegistrationProfile(options = {}) {
	const capabilityProfile = browserCapabilityProfile();
	return {
		protocolVersion: PROTOCOL_VERSION,
		vesselType: VESSEL_TYPES.BROWSER,
		targetVessel: VESSEL_TYPES.BROWSER,
		browserAgent: true,
		virtualOs: false,
		capabilityProfile,
		capabilities: {
			...legacyCapabilityProjection(capabilityProfile),
			browserTab: true,
			virtualOs: false
		},
		runtime: {
			kind: "browser",
			workspaceId: String(options.workspaceId || "browser-workspace")
		}
	};
}

/** Builds the canonical connected Geelooy OS tunnel registration fields. */
export function virtualOsRegistrationProfile(options = {}) {
	const capabilityProfile = virtualOsCapabilityProfile();
	return {
		protocolVersion: PROTOCOL_VERSION,
		vesselType: VESSEL_TYPES.VIRTUAL_OS,
		targetVessel: VESSEL_TYPES.VIRTUAL_OS,
		browserAgent: false,
		virtualOs: true,
		capabilityProfile,
		capabilities: {
			...legacyCapabilityProjection(capabilityProfile),
			browserTab: false,
			virtualOs: true
		},
		runtime: {
			kind: "virtual-os",
			sessionId: String(options.sessionId || "")
		}
	};
}

/** Builds the canonical hosted fallback profile without claiming a live agent. */
export function hostedVirtualOsProfile() {
	const capabilityProfile = virtualOsCapabilityProfile({ hosted: true });
	return {
		protocolVersion: PROTOCOL_VERSION,
		vesselType: VESSEL_TYPES.HOSTED_VIRTUAL_OS,
		targetVessel: VESSEL_TYPES.HOSTED_VIRTUAL_OS,
		browserAgent: false,
		virtualOs: false,
		hostedVirtualOs: true,
		capabilityProfile,
		capabilities: legacyCapabilityProjection(capabilityProfile),
		runtime: { kind: "hosted-virtual-os" }
	};
}
