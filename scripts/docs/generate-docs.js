//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file generate-docs.js
 * @description The Awtsmoos renews source evidence, route/project/system teaching, AI discovery, and browser publication through one explicit orchestration gate.
 */

const { generateBaseDocs } = require("./base-generator.js");
const { generateExtendedDocs } = require("./extended-generator.js");
const { generateDiscoveryDocs } = require("./discovery-generator.js");
const { generateTutorialDocs } = require("./tutorial-generator.js");
const ProjectModel = require("./project-tutorial-model.js");
const { generateProjectTutorialDocs } = require("./project-tutorial-generator.js");
const { generateAiManifest } = require("./ai-manifest-generator.js");
const SystemModel = require("./system-model.js");
const { generateSystemTutorialDocs } = require("./system-tutorial-generator.js");
const { generateSystemAi } = require("./system-ai-generator.js");
const { generatePublicationDocs } = require("./publication-generator.js");

const base = generateBaseDocs();
const extended = generateExtendedDocs();
const discovery = generateDiscoveryDocs();
const tutorials = generateTutorialDocs();
const projectRecords = ProjectModel.projectTutorialRecords();
const projectTutorials = generateProjectTutorialDocs(projectRecords);
const ai = generateAiManifest(projectRecords);
const systemRecords = SystemModel.systemRecords();
const systems = generateSystemTutorialDocs(systemRecords);
const systemAi = generateSystemAi(systemRecords);
const publication = generatePublicationDocs(projectRecords, systemRecords);

console.log(JSON.stringify({
	...base, ...extended, ...discovery, ...tutorials, ...projectTutorials, ...ai,
	...systems, ...systemAi, ...publication,
	generatedEntryPoints: base.baseEntryPoints + extended.extendedEntryPoints + discovery.discoveryEntryPoints + 4,
	generatedChunks: base.baseChunks + extended.extendedChunks + discovery.discoveryChunks + tutorials.tutorialIndexChunks + projectTutorials.projectTutorialChunks + systems.systemTutorialChunks
}, null, 2));
