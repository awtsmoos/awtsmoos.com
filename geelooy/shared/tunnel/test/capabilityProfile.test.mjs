//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	browserCapabilityProfile,
	legacyCapabilityProjection,
	virtualOsCapabilityProfile
} from "../capabilities.js";
import {
	browserRegistrationProfile,
	hostedVirtualOsProfile,
	virtualOsRegistrationProfile
} from "../registrationProfile.js";
import {
	inferVesselType,
	normalizeVesselType,
	VESSEL_TYPES
} from "../vesselTypes.js";

/**
 * B"H
 * These assertions keep every tunnel vessel within its truthful name and power.
 * The Awtsmoos creates native, browser, connected OS, and hosted fallback;
 * Awtsmoos.com proves that aliases converge without erasing their boundaries.
 */

assert.equal(normalizeVesselType("code-tab"), VESSEL_TYPES.BROWSER);
assert.equal(normalizeVesselType("awtsmoos-os"), VESSEL_TYPES.VIRTUAL_OS);
assert.equal(normalizeVesselType("hosted"), VESSEL_TYPES.HOSTED_VIRTUAL_OS);
assert.equal(inferVesselType({
	browserAgent: true,
	virtualOs: true
}), VESSEL_TYPES.VIRTUAL_OS);

const browser = browserCapabilityProfile();
assert.equal(browser.schemaVersion, 1);
assert.equal(browser.vesselType, VESSEL_TYPES.BROWSER);
assert.equal(browser.capabilities["fs.read"].state, "virtualized");
assert.equal(browser.capabilities["command.run"].state, "simulated");
assert.equal(browser.capabilities["native.access"].state, "delegated");
assert.equal(browser.capabilities["browser.control"].state, "unsupported");
assert.deepEqual(legacyCapabilityProjection(browser), {
	fsRead: true,
	fsWrite: true,
	commandRun: "simulated",
	chrome: false,
	runtime: "virtualized",
	vesselType: VESSEL_TYPES.BROWSER
});

const connectedOs = virtualOsCapabilityProfile();
const hostedOs = virtualOsCapabilityProfile({ hosted: true });
assert.equal(connectedOs.vesselType, VESSEL_TYPES.VIRTUAL_OS);
assert.equal(hostedOs.vesselType, VESSEL_TYPES.HOSTED_VIRTUAL_OS);
assert.equal(connectedOs.capabilities["fs.write"].state, "virtualized");
assert.equal(connectedOs.capabilities["command.run"].state, "unsupported");

const browserRegistration = browserRegistrationProfile({
	workspaceId: "workspace-one"
});
assert.equal(browserRegistration.targetVessel, VESSEL_TYPES.BROWSER);
assert.equal(browserRegistration.runtime.workspaceId, "workspace-one");
assert.equal(browserRegistration.browserAgent, true);
assert.equal(browserRegistration.virtualOs, false);

const osRegistration = virtualOsRegistrationProfile({ sessionId: "session-one" });
assert.equal(osRegistration.targetVessel, VESSEL_TYPES.VIRTUAL_OS);
assert.equal(osRegistration.browserAgent, false);
assert.equal(osRegistration.virtualOs, true);
assert.equal(osRegistration.runtime.sessionId, "session-one");

const hosted = hostedVirtualOsProfile();
assert.equal(hosted.vesselType, VESSEL_TYPES.HOSTED_VIRTUAL_OS);
assert.equal(hosted.hostedVirtualOs, true);
assert.equal(hosted.virtualOs, false);

console.log("BHY shared tunnel capability profile tests passed");
