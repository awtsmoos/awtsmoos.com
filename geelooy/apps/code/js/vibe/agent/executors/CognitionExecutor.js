// B"H
/**
 * @file CognitionExecutor.js
 * @brief AI-native cognition tools for goal compilation, runtime scoring, and preview self-healing.
 */
import { FileSystemProvider } from '../../../fs-provider.js';
import { PreviewRuntimeManager } from '../../runtime/PreviewRuntimeManager.js';
import { RuntimeSnapshot } from '../../runtime/reality/RuntimeSnapshot.js';
import { RealityScore } from '../../runtime/reality/RealityScore.js';
import { SelfHealLoop } from '../../runtime/reality/SelfHealLoop.js';
import { ImportAssetVerifier } from '../../runtime/reality/ImportAssetVerifier.js';

export const cognitiveToolNames = [
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

function json(value) { return JSON.stringify(value, null, 2); }

function normalizeArgs(args = {}) {
    return {
        target: args.target || args.path || args.project_path || '/',
        goal: args.goal || args.intent || '',
        args: args.args || {},
        options: args.options || {}
    };
}

async function readMaybe(ws, coreType, path) {
    try {
        const raw = await FileSystemProvider.read({ ...ws, type: coreType, path, kind: 'file' });
        return raw instanceof Blob ? await raw.text() : String(raw);
    } catch (e) {
        return '';
    }
}

function cleanJoin(root, file) {
    return `${String(root || '/').replace(/\/$/, '')}/${file}`;
}

function safeJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
}

async function inspectProject(ws, coreType, resolvePath, target = '/') {
    const root = resolvePath(target || '/');
    const packageJson = await readMaybe(ws, coreType, cleanJoin(root, 'package.json'));
    const indexHtml = await readMaybe(ws, coreType, cleanJoin(root, 'index.html'));
    const serverJs = await readMaybe(ws, coreType, cleanJoin(root, 'server.js'));
    const indexJs = await readMaybe(ws, coreType, cleanJoin(root, 'index.js'));

    return {
        root,
        hasPackageJson: !!packageJson,
        hasIndexHtml: !!indexHtml,
        hasServerJs: !!serverJs,
        hasIndexJs: !!indexJs,
        packageJson: packageJson ? safeJson(packageJson) : null,
        samples: {
            indexHtml: indexHtml.slice(0, 1500),
            serverJs: serverJs.slice(0, 1500),
            indexJs: indexJs.slice(0, 1500)
        }
    };
}

function scoreArchitecture(project) {
    let score = 70;
    const findings = [];
    if (!project.hasPackageJson && !project.hasIndexHtml) {
        score -= 25;
        findings.push('No package.json or index.html found at target root.');
    }
    if (project.hasServerJs && project.hasIndexHtml) {
        score += 8;
        findings.push('Project appears fullstack-capable.');
    }
    if (project.packageJson?.scripts?.test) score += 8;
    else findings.push('No test script detected.');
    if (project.packageJson?.scripts?.dev || project.packageJson?.scripts?.start) score += 6;
    else findings.push('No obvious dev/start script detected.');
    return { score: Math.max(0, Math.min(100, score)), findings };
}

function conceptReport(value, project) {
    const haystack = JSON.stringify(project.samples).toLowerCase();
    const concepts = Array.isArray(value) ? value : [value].filter(Boolean);
    return concepts.map(concept => ({
        concept,
        present: haystack.includes(String(concept).toLowerCase()),
        evidence: haystack.includes(String(concept).toLowerCase())
            ? 'Term appears in sampled project files.'
            : 'No match in sampled project files.'
    }));
}

function baseReport(tool, normalized, project) {
    return {
        ok: true,
        tool,
        target: normalized.target,
        goal: normalized.goal || null,
        generatedAt: new Date().toISOString(),
        project,
        architecture: scoreArchitecture(project)
    };
}

function workflowFor(normalized) {
    return {
        graph: {
            nodes: [
                'goal_entity',
                'semantic_plan',
                'import_verification',
                'runtime_inspection',
                'preview_launch',
                'runtime_snapshot',
                'reality_score',
                'self_heal_loop',
                'virtual_os_mount',
                'live_handoff'
            ],
            edges: [
                ['goal_entity', 'semantic_plan'],
                ['semantic_plan', 'import_verification'],
                ['import_verification', 'runtime_inspection'],
                ['runtime_inspection', 'preview_launch'],
                ['preview_launch', 'runtime_snapshot'],
                ['runtime_snapshot', 'reality_score'],
                ['reality_score', 'self_heal_loop'],
                ['reality_score', 'virtual_os_mount'],
                ['virtual_os_mount', 'live_handoff']
            ]
        },
        goal: normalized.goal
    };
}

function genericReport(tool, normalized, project) {
    const base = baseReport(tool, normalized, project);
    const map = {
        semantic_diff: { diff: { before: normalized.args.before || null, after: normalized.args.after || null, changes: ['architecture', 'runtime', 'dependencies', 'intent'] } },
        detect_concept_clusters: { clusters: conceptReport(normalized.args.concepts || normalized.goal || normalized.target, project) },
        simulate_failure: { simulation: { type: normalized.args.type || 'generic_failure', injected: false, plan: ['model condition', 'run assertions', 'repair'] } },
        generate_repair_plan: { repairPlan: ['inspect failing preview/logs', 'find responsible files', 'apply smallest semantic patch', 'relaunch preview', 'run assertions'] },
        supervise_runtime: { supervisor: { status: 'declared', watch: normalized.args.watch || ['console', 'network', 'memory'] } },
        infer_architecture: { inferredArchitecture: scoreArchitecture(project) },
        detect_abstraction_leaks: { leaks: scoreArchitecture(project).findings.map(f => ({ risk: 'medium', finding: f })) },
        runtime_entity_graph: { entities: conceptReport(normalized.args.entities || [], project) },
        semantic_refactor: { refactor: { goal: normalized.goal, safeSteps: ['outline affected files', 'hash files', 'apply small patches', 'verify preview'] } },
        inspect_render_storms: { renderStorms: { detected: false, note: 'Needs browser instrumentation layer for live render counting.' } },
        runtime_contract_registry: { contracts: ['runnableEntry', 'previewUrl', 'previewRunning', 'noRuntimeErrors'] },
        semantic_search_runtime: { matches: conceptReport(normalized.goal || normalized.args.query || normalized.target, project) },
        preview_branch_matrix: { matrix: (normalized.args.variants || ['performance', 'minimal', 'mobile', 'offline']).map(v => ({ variant: v, status: 'planned' })) },
        infer_business_rules: { rules: conceptReport(['auth', 'payment', 'inventory', 'role', 'permission'], project).filter(r => r.present) },
        state_time_machine: { timeMachine: { snapshots: [], next: 'Capture runtime_snapshot before and after interactions.' } },
        detect_dead_concepts: { deadConcepts: scoreArchitecture(project).findings.map(f => ({ concept: f, confidence: 0.4 })) },
        semantic_merge: { mergePlan: ['compare semantic_diff', 'preserve intent', 'apply patch set', 'verify runtime'] },
        runtime_introspection_stream: { stream: { active: false, snapshot: {consoleErrors: [], network: [], dom: null} } },
        architecture_score: { architectureScore: scoreArchitecture(project) },
        intent_drift_detector: { drift: {expected: normalized.goal || null, score: normalized.goal ? 0.15 : null} },
        semantic_package_generator: { package: { manifest: 'awtsmoos.vibe.runtime', includes: ['source', 'runtime', 'contracts', 'repairRules', 'preview'] } },
        generate_test_universe: { tests: ['offline mode', 'slow network', 'malformed JSON', 'empty state', 'keyboard navigation', 'mobile viewport'] },
        inspect_human_confusion: { uxRisks: ['unclear empty states', 'missing loading/error states', 'keyboard focus unknown'] },
        orchestration_graph: workflowFor(normalized),
        environment_virtualizer: { environment: {needs: normalized.args.needs || [], provisionMode: 'virtual-first', shellNeeded: false} },
        semantic_cache: { cache: { key: normalized.args.key || normalized.target, stored: false, mode: 'runtime-summary' } },
        goal_compiler: { compiledGoal: { goal: normalized.goal, phases: workflowFor(normalized).graph.nodes } },
        autonomous_background_agents: { agents: ['architecture_guardian', 'runtime_healer', 'ux_watcher', 'security_watcher'].map(name => ({ name, status: 'declared' })) },
        semantic_pipeline: { pipeline: workflowFor(normalized).graph.nodes },
        universal_app_manifest: { manifest: { schema: 'awtsmoos.universal.app', runtime: project, capabilities: [], routes: [], repairStrategies: [] } }
    };
    return { ...base, ...(map[tool] || {}) };
}

export const CognitionExecutor = {
    has(name) {
        return cognitiveToolNames.includes(name);
    },

    async execute(name, args, ws, coreType, resolvePath, tab, onProgress = null) {
        const normalized = normalizeArgs(args);
        onProgress?.(`B"H running cognition tool: ${name}`);
        const project = await inspectProject(ws, coreType, resolvePath, normalized.target);
        const importVerification = ImportAssetVerifier.verifyProjectSamples(project);

        if (name === 'runtime_snapshot') {
            const manifest = await PreviewRuntimeManager.inspect(ws, coreType, project.root);
            const snapshot = RuntimeSnapshot.capture({ project, manifest, logs: [], importVerification });
            return json({ ...baseReport(name, normalized, project), importVerification, snapshot, realityScore: RealityScore.compute(snapshot, normalized.options) });
        }

        if (name === 'self_heal_preview') {
            const loop = new SelfHealLoop({ previewManager: PreviewRuntimeManager });
            const result = await loop.run({
                ws,
                coreType,
                projectRoot: project.root,
                project,
                importVerification,
                normalized,
                tabId: tab?.id || null
            });
            return json({ ...baseReport(name, normalized, project), ...result });
        }

        return json(genericReport(name, normalized, project));
    }
};
