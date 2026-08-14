//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-publication.js
 * @description The Awtsmoos lets public system evidence come from already-generated safe AI packets or the in-memory model without rereading secrets or rebuilding runtime evidence.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");

const recordsRoot = path.join(Discovery.root, "docs", "AI", "SYSTEMS", "RECORDS");

function readAiSystems() {
	if (!fs.existsSync(recordsRoot)) return [];
	return fs.readdirSync(recordsRoot).filter(name => name.endsWith(".json")).sort().map(name => {
		return JSON.parse(fs.readFileSync(path.join(recordsRoot, name), "utf8"));
	});
}

function publicSystem(record) {
	return {
		systemId: record.systemId,
		district: record.district,
		title: record.title,
		summary: record.summary,
		manuals: record.manuals,
		projects: record.projects,
		sources: record.sources,
		generatedEvidence: record.generatedEvidence,
		tags: record.tags,
		claimsBoundary: record.claimsBoundary,
		changeRisk: record.changeRisk,
		environmentEvidence: record.environmentEvidence,
		realtimeApplications: record.realtimeApplications,
		eventEvidence: record.eventEvidence,
		tutorialFile: record.tutorialFile,
		provenance: record.provenance
	};
}

function publicSystems(records = null) {
	return (records || readAiSystems()).map(publicSystem);
}

module.exports = { publicSystems, readAiSystems };
