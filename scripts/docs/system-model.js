//B"H
//Boruch Hashem
//Blessed is He

/** @file system-model.js @description The Awtsmoos lets each stable system concept become one bounded teaching packet with explicit evidence and claims boundaries. */

const Catalog = require("./system-catalog.js");
const Evidence = require("./system-evidence.js");

function systemRecords() {
	return Evidence.evidenceForSystems(Catalog.systems).map(system => ({
		schema: "awtsmoos-system-tutorial-v1",
		systemId: system.id,
		district: system.district,
		title: system.title,
		summary: system.summary,
		manuals: system.manuals,
		projects: system.projectEvidence,
		sources: system.sources,
		generatedEvidence: system.generated,
		tags: system.tags,
		claimsBoundary: system.claimsBoundary,
		changeRisk: system.changeRisk,
		environmentEvidence: system.environmentEvidence,
		realtimeApplications: system.realtimeApplications,
		eventEvidence: system.eventEvidence,
		tutorialFile: `docs/GENERATED/SYSTEM_TUTORIALS/SYSTEMS/${system.id}.md`,
		aiFile: `docs/AI/SYSTEMS/RECORDS/${system.id}.json`,
		provenance: system.provenance
	}));
}

module.exports = { systemRecords };
