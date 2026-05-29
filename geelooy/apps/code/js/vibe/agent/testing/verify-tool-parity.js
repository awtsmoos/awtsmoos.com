// B"H
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../..");
const semanticTools = ["semantic_outline","semantic_search","dependency_graph","file_hashes","replace_range","apply_patch"];
const runtimeTools = ["inspect_runtime","launch_preview","list_previews","preview_logs","stop_preview","restart_preview"];
const universalWorkflowTools = ["run_semantic_workflow", "run_command_tree", "ai_command_batch", "assert_runtime_contracts"];
const tunnelMerkavaTools = ["simulateRuntime", "runtimeWorkflow", "merkavaWorkflowRun", "aiWorkflowRun", "aiCommandBatch", "testRuntimeOnce"];
const tunnelPreviewTools = ["inspectRuntime","launchPreview","listPreviews","previewLogs","stopPreview","restartPreview"];
const cognitionTools = [
  "semantic_diff",
  "detect_concept_clusters",
  "simulate_failure",
  "generate_repair_plan",
  "supervise_runtime",
  "infer_architecture",
  "detect_abstraction_leaks",
  "runtime_entity_graph",
  "semantic_refactor",
  "inspect_render_storms",
  "runtime_contract_registry",
  "semantic_search_runtime",
  "preview_branch_matrix",
  "infer_business_rules",
  "state_time_machine",
  "detect_dead_concepts",
  "semantic_merge",
  "runtime_introspection_stream",
  "architecture_score",
  "intent_drift_detector",
  "semantic_package_generator",
  "self_heal_preview",
  "generate_test_universe",
  "inspect_human_confusion",
  "orchestration_graph",
  "environment_virtualizer",
  "runtime_snapshot",
  "semantic_cache",
  "goal_compiler",
  "autonomous_background_agents",
  "semantic_pipeline",
  "universal_app_manifest"
];
const tunnelCognitionTools = [
  "semanticDiff",
  "detectConceptClusters",
  "simulateFailure",
  "generateRepairPlan",
  "superviseRuntime",
  "inferArchitecture",
  "detectAbstractionLeaks",
  "runtimeEntityGraph",
  "semanticRefactor",
  "inspectRenderStorms",
  "runtimeContractRegistry",
  "semanticSearchRuntime",
  "previewBranchMatrix",
  "inferBusinessRules",
  "stateTimeMachine",
  "detectDeadConcepts",
  "semanticMerge",
  "runtimeIntrospectionStream",
  "architectureScore",
  "intentDriftDetector",
  "semanticPackageGenerator",
  "selfHealPreview",
  "generateTestUniverse",
  "inspectHumanConfusion",
  "orchestrationGraph",
  "environmentVirtualizer",
  "runtimeSnapshot",
  "semanticCache",
  "goalCompiler",
  "autonomousBackgroundAgents",
  "semanticPipeline",
  "universalAppManifest"
];

const surfaces = [
  { name: "editor-modular-fs", file: "vibe/agent/schemas/FileSystem.js", tools: semanticTools },
  { name: "editor-legacy-schemas", file: "vibe/agent/ToolSchemas.js", tools: [...semanticTools, ...runtimeTools, ...cognitionTools] },
  { name: "editor-runtime-schemas", file: "vibe/agent/schemas/Runtime.js", tools: runtimeTools },
  { name: "editor-cognition-schemas", file: "vibe/agent/cognitionToolNames.js", tools: cognitionTools },
  { name: "editor-schema-index", file: "vibe/agent/schemas/index.js", tools: ["CognitionSchemas", "WorkflowSchemas"] },
  { name: "editor-router", file: "vibe/agent/executors/ToolRouter.js", tools: [...semanticTools, ...runtimeTools, "CognitionExecutor", "WorkflowExecutor"] },
  { name: "editor-cognition-executor", file: "vibe/agent/executors/CognitionExecutor.js", tools: cognitionTools },
  { name: "editor-workflow-schemas", file: "vibe/agent/schemas/Workflow.js", tools: universalWorkflowTools },
  { name: "editor-workflow-executor", file: "vibe/agent/executors/WorkflowExecutor.js", tools: universalWorkflowTools },
  { name: "editor-workflow-runner", file: "vibe/agent/executors/workflow/runStep.js", tools: ["foreach", "fallback", "onFailure", "retry", "executeTool"] },
  { name: "editor-workflow-condition", file: "vibe/agent/executors/workflow/condition.js", tools: ["evaluateWorkflowCondition", "all", "any", "matches"] },
  { name: "editor-fs-executor", file: "vibe/agent/executors/FileSystemExecutor.js", tools: semanticTools },
  { name: "editor-runtime-executor", file: "vibe/agent/executors/RuntimeExecutor.js", tools: runtimeTools },
  { name: "editor-runtime-manifest", file: "vibe/runtime/RuntimeManifest.js", tools: ["RuntimeManifest", "awtsmoos.vibe.runtime"] },
  { name: "tunnel-docs-actions", file: "../../../api/tunnel/control/docs/actions.js", tools: [...tunnelPreviewTools, ...tunnelCognitionTools, ...tunnelMerkavaTools] },
  { name: "tunnel-preview-actions", file: "../../tunnel/agent/tools/fs/actionGroups/previewActions.js", tools: [...tunnelPreviewTools, "publicUrl", "previewProxyUrl"] },
  { name: "tunnel-cognition-actions", file: "../../tunnel/agent/tools/fs/cognitionCommandNames.js", tools: tunnelCognitionTools },
  { name: "tunnel-agent-registry", file: "../../tunnel/agent/tools/fs/actions.js", tools: ["buildPreviewActions", "buildCognitionActions"] },
  { name: "tunnel-runtime-manifest", file: "../../tunnel/agent/tools/fs/runtimeManifest.js", tools: ["createRuntimeManifest", "awtsmoos.vibe.runtime"] },
  { name: "tunnel-preview-proxy-route", file: "../../../api/tunnel/control/routes/previewProxy.js", tools: ["previewProxy", "httpRequest"] },
  { name: "dynamic-openapi", file: "../../../api/tunnel/control/routes/openApi.js", tools: ["awtsmoos-action-openapi", "openApi"] },
  { name: "api-key-openapi", file: "../../../api/tunnel/control/routes/openApiKey.js", tools: [...tunnelPreviewTools, ...tunnelCognitionTools, "/api/tunnel/control/preview/{tunnelName}", "awtsmoosPreviewProxyWithApiKey"] },
  { name: "gpt-action-yaml", file: "../../tunnel-control/gpt/awtsmoos-action-openapi.yaml", tools: [...tunnelPreviewTools, ...tunnelCognitionTools, ...tunnelMerkavaTools, "/api/tunnel/control/preview/{tunnelName}", "awtsmoosPreviewProxy"] }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const missing = [];
for (const surface of surfaces) {
  let text = "";
  try { text = read(surface.file); }
  catch (e) {
    missing.push({ surface: surface.name, file: surface.file, tool: "<file>", error: e.message });
    continue;
  }
  for (const tool of surface.tools) {
    if (!text.includes(tool)) missing.push({ surface: surface.name, file: surface.file, tool });
  }
}

const result = {
  ok: missing.length === 0,
  semanticTools: semanticTools.length,
  runtimeTools: runtimeTools.length,
  tunnelPreviewTools: tunnelPreviewTools.length,
  cognitionTools: cognitionTools.length,
  tunnelCognitionTools: tunnelCognitionTools.length,
  surfaces: surfaces.length,
  missing
};

if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(result));
