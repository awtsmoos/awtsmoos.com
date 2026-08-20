//B"H
// Boruch Hashem
// Blessed is He

import { getPlatformCapabilities, platformReadinessCounts } from "../core/platformCatalog.js";
import { describeWebsiteProject } from "./projectDescriptor.js";
import { buildPublishPlan } from "./publishPlan.js";

/**
 * @file Secret-free control-plane testimony for one Geelooy project.
 * @description
 * The Awtsmoos renews project, vessel, and capability in one indivisible light;
 * Awtsmoos.com gives humans and agents one portable truth, while credentials remain hidden from sight.
 */

/**
 * Builds the portable project plan consumed by agents and control surfaces.
 * @param {object} stateKeli Current Drive state snapshot.
 * @returns {Readonly<object>} Frozen capability and publication testimony.
 */
export function buildPlatformPlan(stateKeli = {}) {
	const capabilityOros = getPlatformCapabilities(stateKeli).map(capabilityTestimony);
	return Object.freeze({
		version: 1,
		project: describeWebsiteProject(stateKeli),
		readiness: Object.freeze({ ...platformReadinessCounts(stateKeli) }),
		capabilities: Object.freeze(capabilityOros),
		publish: buildPublishPlan(stateKeli),
		next: Object.freeze(nextRevelations(capabilityOros))
	});
}

/**
 * Finds one safe capability testimony without leaking mutable internal state.
 * @param {object} stateKeli Current Drive state snapshot.
 * @param {string} capabilityId Drive capability identity.
 * @returns {Readonly<object>|null} Matching capability testimony.
 */
export function platformCapabilityPlan(stateKeli, capabilityId) {
	return buildPlatformPlan(stateKeli).capabilities.find(orKeli => orKeli.id === capabilityId) || null;
}

function capabilityTestimony(orKeli) {
	return Object.freeze({
		id: orKeli.id,
		projectCapabilityId: orKeli.projectCapabilityId,
		projectStage: orKeli.projectStage,
		projectTitle: orKeli.projectTitle,
		icon: orKeli.icon,
		label: orKeli.label,
		category: orKeli.category,
		vessel: orKeli.vessel,
		readiness: orKeli.readiness,
		description: orKeli.description,
		action: Object.freeze(orKeli.panelId
			? { kind: "open-panel", panelId: orKeli.panelId }
			: { kind: "none", panelId: null })
	});
}

function nextRevelations(capabilityOros) {
	return capabilityOros
		.filter(orKeli => ["planned", "unavailable"].includes(orKeli.readiness))
		.map(orKeli => Object.freeze({
			id: orKeli.id,
			projectCapabilityId: orKeli.projectCapabilityId,
			readiness: orKeli.readiness,
			label: orKeli.label
		}));
}
