//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-projects.js
 * @description The Awtsmoos lets public Project Explorer packets come from either the shared live model or already-generated AI records without rerunning expensive evidence scans.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const ProjectRecord = require("./ai-project-record.js");

function readAiRecords() {
	const directory = path.join(Discovery.root, "docs", "AI", "PROJECTS");
	if (!fs.existsSync(directory)) return [];
	return fs.readdirSync(directory).filter(name => name.endsWith(".json")).sort().map(name => {
		return JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
	});
}

function aiRecords(projectRecords) {
	if (!projectRecords) return readAiRecords();
	return projectRecords.map(ProjectRecord.createProjectRecord);
}

function documentationLinks(project, sourceToId) {
	return (project.humanDocumentation || []).map(sourcePath => ({
		sourcePath,
		documentId: sourceToId.get(sourcePath) || null
	})).filter(item => item.documentId);
}

function publicProject(project, sourceToId) {
	return {
		projectId: project.projectId,
		path: project.path,
		type: project.type,
		family: project.family,
		title: project.title,
		entries: project.entries || [],
		humanManual: project.humanManual,
		tutorialFile: project.generatedTutorial,
		documentation: documentationLinks(project, sourceToId),
		symlinkTarget: project.symlinkTarget,
		counts: project.counts,
		totalFiles: project.totalFiles,
		symbolSummary: project.symbolSummary,
		outgoing: project.outgoingDependencies || [],
		incoming: project.incomingDependencies || [],
		externalDependencies: project.externalDependencies || [],
		publicEntries: project.publicEntries || [],
		requiresLocalDoc: Boolean(project.requiresLocalDocumentation),
		documentationCovered: Boolean(project.documentationCovered),
		provenance: project.provenance
	};
}

function publicProjects(sourceToId, projectRecords = null) {
	return aiRecords(projectRecords).map(project => publicProject(project, sourceToId));
}

module.exports = { publicProjects, readAiRecords };
