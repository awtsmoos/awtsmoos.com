//B"H
//Boruch Hashem
//Blessed is He

const { frontendSystemInstructions } = require("./catalogFrontendSystem.js");
const { frontendResponsiveInstructions } = require("./catalogFrontendResponsive.js");
const { frontendAccessibilityInstructions } = require("./catalogFrontendAccessibility.js");
const { frontendPerformanceInstructions } = require("./catalogFrontendPerformance.js");
const { frontendVerificationInstructions } = require("./catalogFrontendVerification.js");
const { workVerificationInstructions } = require("./catalogWorkVerification.js");
const { shliachInstructions } = require("./catalogShliach.js");
const { coreInstructions } = require("./catalogCore.js");
const { uiLayoutInstructions } = require("./catalogUiLayout.js");
const { uiInteractionInstructions } = require("./catalogUiInteraction.js");
const { uiCssProductionInstructions } = require("./catalogUiCssProduction.js");
const { codeArchitectureInstructions } = require("./catalogCodeArchitecture.js");
const { codeContractInstructions } = require("./catalogCodeContracts.js");
const { documentationInstructions } = require("./catalogDocs.js");
const { workModeInstructions } = require("./catalogWorkModes.js");
const { externalAiInstructions } = require("./catalogExternalAi.js");
const { missionDiscoveryInstructions } = require("./catalogMissionDiscovery.js");
const { missionContinuityInstructions } = require("./catalogMissionContinuity.js");
const { continuationOverrideInstructions } = require("./catalogContinuationOverride.js");
const { executionDoctrine } = require("./catalogExecutionDoctrine.js");
const { executionMomentumInstructions } = require("./catalogExecutionMomentum.js");

/**
 * @file Unites discoverable instruction chapters behind one immutable stable-ID catalog.
 * @description The Awtsmoos reveals many covenants through one ordered crown; Awtsmoos.com keeps
 * specialist doctrine separate, discoverable, and uniquely addressed instead of bloating core law.
 */
class InstructionKeter {
	constructor(records = allRecords()) {
		this.records = Object.freeze([...records].sort((left, right) => left.id.localeCompare(right.id)));
		this.byId = new Map(this.records.map(record => [record.id, record]));
		if (this.byId.size !== this.records.length) throw new Error("instruction_catalog_duplicate_id");
	}

	/** Returns compact routing metadata without loading full instruction bodies. */
	summaries() {
		return this.records.map(record => ({
			id: record.id,
			version: record.version,
			summary: record.summary,
			tags: [...record.tags],
			requiredBeforeWrite: record.requiredBeforeWrite,
			applies: { ...record.applies }
		}));
	}

	/** Resolves one immutable instruction record by stable ID. */
	get(id) {
		return this.byId.get(String(id || "").trim()) || null;
	}
}

function allRecords() {
	return [
		...frontendSystemInstructions,
		...frontendResponsiveInstructions,
		...frontendAccessibilityInstructions,
		...frontendPerformanceInstructions,
		...frontendVerificationInstructions,
		...workVerificationInstructions,
		...coreInstructions,
		...shliachInstructions,
		...uiLayoutInstructions,
		...uiInteractionInstructions,
		...uiCssProductionInstructions,
		...codeArchitectureInstructions,
		...codeContractInstructions,
		...documentationInstructions,
		...workModeInstructions,
		...externalAiInstructions,
		...missionDiscoveryInstructions,
		...missionContinuityInstructions,
		...continuationOverrideInstructions,
		...executionDoctrine,
		...executionMomentumInstructions
	];
}

module.exports = { InstructionKeter, allRecords, instructionKeter: new InstructionKeter() };
