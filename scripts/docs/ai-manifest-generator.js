//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ai-manifest-generator.js
 * @description The Awtsmoos lets machine readers enter through learning, project teaching, system teaching, route tutorials, generated evidence, and finally current source.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const ProjectModel = require("./project-tutorial-model.js");
const ProjectRecord = require("./ai-project-record.js");

const aiRoot = path.join(Discovery.root, "docs", "AI");
const projectRoot = path.join(aiRoot, "PROJECTS");

function jsonWrite(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `${JSON.stringify(value, null, "\t")}\n`);
}

function writeProjectRecords(records) {
	fs.rmSync(projectRoot, { recursive: true, force: true });
	fs.mkdirSync(projectRoot, { recursive: true });
	return records.map(record => {
		const file = `${record.projectId}.json`;
		jsonWrite(path.join(projectRoot, file), ProjectRecord.createProjectRecord(record));
		return file;
	});
}

function writeProjectIndex(files) {
	const chunks = [];
	for (let index = 0; index < files.length; index += 80) {
		const name = `projects-${String(chunks.length + 1).padStart(3, "0")}.json`;
		jsonWrite(path.join(aiRoot, name), {
			BH: "B\"H / Boruch Hashem / Blessed is He",
			provenance: "generated-project-file-index",
			projects: files.slice(index, index + 80).map(file => `PROJECTS/${file}`)
		});
		chunks.push(name);
	}
	return chunks;
}

function manifestRecord(records, chunks, missingCount) {
	return {
		BH: "B\"H / Boruch Hashem / Blessed is He",
		schema: "awtsmoos-doc-discovery-v4",
		provenance: "generated-from-local-source-and-documentation",
		repository: "Awtsmoos.com",
		publicRoot: "geelooy",
		documentationRoot: "docs",
		learningRoot: "docs/LEARN",
		projectTutorialRoot: "docs/GENERATED/PROJECT_TUTORIALS/PROJECTS",
		generatedProjectTutorialIndex: "docs/GENERATED/PROJECT_TUTORIAL_INDEX.md",
		projectHumanGuide: "docs/TUTORIALS/PROJECTS/README.md",
		systemsManifest: "docs/AI/SYSTEMS/MANIFEST.json",
		generatedSystemTutorialIndex: "docs/GENERATED/SYSTEM_TUTORIAL_INDEX.md",
		systemHumanGuide: "docs/TUTORIALS/SYSTEMS/README.md",
		generatedEvidenceRoot: "docs/GENERATED",
		canonicalHumanStart: "docs/README.md",
		interactiveDocumentation: "/docs/",
		interactiveProjectExplorer: "/docs/?view=projects",
		interactiveSystemsExplorer: "/docs/?view=systems",
		publicPublicationManifest: "geelooy/docs/generated/manifest.json",
		apiTutorialManifest: "docs/AI/API_TUTORIALS/MANIFEST.json",
		generatedApiTutorialIndex: "docs/GENERATED/API_TUTORIAL_INDEX.md",
		aiStart: "docs/AI/README.md",
		regenerate: "node scripts/docs/generate-docs.js",
		validate: "node scripts/docs/validate-docs.js",
		projectCount: records.length,
		projectIndexChunks: chunks,
		missingLocalDocumentationCount: missingCount,
		keyGeneratedIndexes: [
			"docs/GENERATED/PROJECT_TUTORIAL_INDEX.md", "docs/GENERATED/PROJECT_ATLAS.md",
			"docs/GENERATED/SYSTEM_TUTORIAL_INDEX.md", "docs/GENERATED/API_TUTORIAL_INDEX.md",
			"docs/GENERATED/PROJECT_DEPENDENCIES.md", "docs/GENERATED/PUBLIC_ENTRY_POINTS.md",
			"docs/GENERATED/TEST_OWNERSHIP.md"
		],
		navigationRule: "Human tutorial -> generated system/project/route evidence -> current source/callers/tests -> runtime verification."
	};
}

function generateAiManifest(projectRecords = ProjectModel.projectTutorialRecords()) {
	const files = writeProjectRecords(projectRecords);
	const chunks = writeProjectIndex(files);
	const missingCount = projectRecords.filter(record => record.requiresLocalDoc && !record.documentationCovered).length;
	jsonWrite(path.join(aiRoot, "MANIFEST.json"), manifestRecord(projectRecords, chunks, missingCount));
	return { aiProjects: projectRecords.length, aiProjectFiles: files.length, aiIndexChunks: chunks.length, aiMissingDocs: missingCount };
}

module.exports = { generateAiManifest };
