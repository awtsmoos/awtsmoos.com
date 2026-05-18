// B"H
const fs = require("fs");

function edit(file, edits) {
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of edits) {
    if (!text.includes(from)) {
      throw new Error(`Pattern not found in ${file}: ${from.slice(0, 100)}`);
    }
    text = text.replace(from, to);
  }
  fs.writeFileSync(file, text);
}

edit("vibe/agent/executors/CognitionExecutor.js", [
  [
    "import { SelfHealLoop } from '../../runtime/reality/SelfHealLoop.js';",
    "import { SelfHealLoop } from '../../runtime/reality/SelfHealLoop.js';\nimport { ImportAssetVerifier } from '../../runtime/reality/ImportAssetVerifier.js';"
  ],
  [
    "return `${String(root || '/').replace(/\\/\\$/, '')}/${file}`;",
    "return `${String(root || '/').replace(/\\/$/, '')}/${file}`;"
  ],
  [
    "const project = await inspectProject(ws, coreType, resolvePath, normalized.target);\n\n        if (name === 'runtime_snapshot') {",
    "const project = await inspectProject(ws, coreType, resolvePath, normalized.target);\n        const importVerification = ImportAssetVerifier.verifyProjectSamples(project);\n\n        if (name === 'runtime_snapshot') {"
  ],
  [
    "const snapshot = RuntimeSnapshot.capture({ project, manifest, logs: [] });\n            return json({ ...baseReport(name, normalized, project), snapshot, realityScore: RealityScore.compute(snapshot, normalized.options) });",
    "const snapshot = RuntimeSnapshot.capture({ project, manifest, logs: [], importVerification });\n            return json({ ...baseReport(name, normalized, project), importVerification, snapshot, realityScore: RealityScore.compute(snapshot, normalized.options) });"
  ],
  [
    "project,\n                normalized,",
    "project,\n                importVerification,\n                normalized,"
  ]
]);

edit("vibe/runtime/reality/RuntimeSnapshot.js", [
  [
    "project: input.project || null,\n            manifest: input.manifest || null,",
    "project: input.project || null,\n            importVerification: input.importVerification || input.imports || null,\n            manifest: input.manifest || null,"
  ]
]);

edit("vibe/runtime/reality/RealityScore.js", [
  [
    "noRuntimeErrors: Number(snapshot.health?.errorCount || 0) === 0\n        };",
    "noRuntimeErrors: Number(snapshot.health?.errorCount || 0) === 0,\n            importAssetsOk: snapshot.importVerification ? !!snapshot.importVerification.ok : true\n        };"
  ],
  [
    "if (!gates.previewRunning) score -= 20;\n        score -= Math.min(30, Number(snapshot.health?.errorCount || 0) * 10);",
    "if (!gates.previewRunning) score -= 20;\n        if (!gates.importAssetsOk) score -= 15;\n        score -= Math.min(30, Number(snapshot.health?.errorCount || 0) * 10);"
  ]
]);

edit("vibe/runtime/reality/SelfHealLoop.js", [
  [
    "const snapshot = RuntimeSnapshot.capture({ project: ctx.project, manifest: preview.manifest || manifest, preview, logs });",
    "const snapshot = RuntimeSnapshot.capture({ project: ctx.project, importVerification: ctx.importVerification, manifest: preview.manifest || manifest, preview, logs });"
  ],
  [
    "if (score.failed.includes('noRuntimeErrors')) {",
    "if (score.failed.includes('importAssetsOk')) {\n            actions.push({ tool: 'semantic_search', fix: 'inspect suspicious imports/assets before preview handoff', risks: snapshot.importVerification?.risks || [] });\n        }\n        if (score.failed.includes('noRuntimeErrors')) {"
  ]
]);

console.log("wired import asset verifier");
