//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-tutorial-model.js
 * @description The Awtsmoos lets every current project boundary become one conservative teaching packet that points back to human docs and source evidence.
 */

const Projects = require("./project-discovery.js");
const Evidence = require("./project-evidence.js");
const Catalog = require("./project-type-catalog.js");

function compactEdges(values) {
	return values.slice(0, 12).map(value => ({ ...value }));
}

function projectTutorialRecords() {
	const projects = Projects.projectRecords();
	const evidence = Evidence.evidenceByProject(projects);
	return projects.map(project => {
		const joined = evidence.get(project.path);
		const family = Catalog.familyForType(project.type);
		return {
			schema: "awtsmoos-project-tutorial-v1",
			projectId: project.id,
			path: project.path,
			type: project.type,
			title: project.title || project.path,
			entries: project.entries,
			localDoc: project.localDoc || null,
			symlinkTarget: project.symlinkTarget || null,
			counts: project.counts,
			totalFiles: project.total,
			symbolSummary: joined.symbolSummary,
			outgoing: compactEdges(joined.outgoing),
			incoming: compactEdges(joined.incoming),
			externalDependencies: compactEdges(joined.externalDependencies),
			publicEntries: joined.publicEntries.slice(0, 12),
			requiresLocalDoc: joined.requiresLocalDoc,
			documentationCovered: joined.documentationCovered,
			humanManual: family.manual,
			family: { id: family.id, title: family.title },
			tutorialFile: `docs/GENERATED/PROJECT_TUTORIALS/PROJECTS/${project.id}.md`,
			provenance: "generated-from-local-source"
		};
	});
}

module.exports = { projectTutorialRecords };
