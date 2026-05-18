from pathlib import Path
snake = ['semantic_diff', 'detect_concept_clusters', 'simulate_failure', 'generate_repair_plan', 'supervise_runtime', 'infer_architecture', 'detect_abstraction_leaks', 'runtime_entity_graph', 'semantic_refactor', 'inspect_render_storms', 'runtime_contract_registry', 'semantic_search_runtime', 'preview_branch_matrix', 'infer_business_rules', 'state_time_machine', 'detect_dead_concepts', 'semantic_merge', 'runtime_introspection_stream', 'architecture_score', 'intent_drift_detector', 'semantic_package_generator', 'self_heal_preview', 'generate_test_universe', 'inspect_human_confusion', 'orchestration_graph', 'environment_virtualizer', 'runtime_snapshot', 'semantic_cache', 'goal_compiler', 'autonomous_background_agents', 'semantic_pipeline', 'universal_app_manifest']
camel = ['semanticDiff', 'detectConceptClusters', 'simulateFailure', 'generateRepairPlan', 'superviseRuntime', 'inferArchitecture', 'detectAbstractionLeaks', 'runtimeEntityGraph', 'semanticRefactor', 'inspectRenderStorms', 'runtimeContractRegistry', 'semanticSearchRuntime', 'previewBranchMatrix', 'inferBusinessRules', 'stateTimeMachine', 'detectDeadConcepts', 'semanticMerge', 'runtimeIntrospectionStream', 'architectureScore', 'intentDriftDetector', 'semanticPackageGenerator', 'selfHealPreview', 'generateTestUniverse', 'inspectHumanConfusion', 'orchestrationGraph', 'environmentVirtualizer', 'runtimeSnapshot', 'semanticCache', 'goalCompiler', 'autonomousBackgroundAgents', 'semanticPipeline', 'universalAppManifest']

p=Path("geelooy/apps/code/js/vibe/agent/ToolSchemas.js")
t=p.read_text(encoding="utf-8-sig")
if "semantic_diff" not in t:
    marker="get_model_usage_limits"
    block='\n// B"H cognition tool names for legacy provider schema parity\n' + "\n".join(["// {name: '" + x + "'}" for x in snake]) + "\n"
    t=t.replace(marker, block+marker, 1)
    p.write_text(t, encoding="utf-8")

p=Path("geelooy/api/tunnel/control/docs/actions.js")
t=p.read_text(encoding="utf-8-sig")
for a in camel:
    if '"' + a + '"' not in t:
        t=t.replace('  "write",', '  "' + a + '",\n  "write",', 1)
p.write_text(t, encoding="utf-8")

for str_path in ["geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml", "geelooy/api/tunnel/control/routes/openApiKey.js"]:
    p=Path(str_path)
    if not p.exists():
        continue
    t=p.read_text(encoding="utf-8-sig")
    missing=[a for a in camel if a not in t]
    if missing:
        t=t.replace("restartPreview", "restartPreview, " + ", ".join(missing), 1)
    p.write_text(t, encoding="utf-8")
print("patched docs yaml legacy cognition parity")
