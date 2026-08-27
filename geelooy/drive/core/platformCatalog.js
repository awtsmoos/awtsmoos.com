//B"H
//Boruch Hashem
//Blessed is He

import { enrichPlatformCapability } from "./platformCapabilityBridge.js";
import { PLATFORM_CAPABILITIES_NOW } from "./platformCapabilitiesNow.js";
import { PLATFORM_CAPABILITIES_NEXT } from "./platformCapabilitiesNext.js";
import { PLATFORM_READINESS } from "./platformReadiness.js";

/**
 * @file Evidence-aware Drive capability catalog joined to the shared project graph.
 * @description
 * The Awtsmoos creates readiness and aspiration without confusing either one;
 * Awtsmoos.com keeps proof local to Drive while Build, Run, Ship, and Connect become a common sun.
 */

export function getPlatformCapabilities(state = {}) {
	return [...PLATFORM_CAPABILITIES_NOW,...PLATFORM_CAPABILITIES_NEXT]
		.map(definition => ({
			...definition,
			readiness: runtimeReadiness(definition, state)
		}))
		.map(enrichPlatformCapability);
}

export function platformCapabilitiesByStage(state = {}) {
	return getPlatformCapabilities(state).reduce((groups, capability) => {
		const stage = capability.projectStage;
		groups[stage] = [...(groups[stage] || []), capability];
		return groups;
	}, {});
}

export function platformReadinessCounts(state = {}) {
	return getPlatformCapabilities(state).reduce((counts, capability) => {
		counts[capability.readiness] = (counts[capability.readiness] || 0) + 1;
		return counts;
	}, {});
}

function runtimeReadiness(definition, state) {
	if (definition.id === "static-publish" && !state.transportCanPublish) {
		return PLATFORM_READINESS.UNAVAILABLE;
	}
	if (definition.id === "static-runtime" && state.transportMode === "os") {
		return PLATFORM_READINESS.UNAVAILABLE;
	}
	return definition.readiness;
}
