//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UnifiedRealityExecutionEngine.js
 * @description Composes world lineage, selective artifact lineage, and evidence-backed execution while exposing pure transition planning for higher stateful Reality vessels.
 * The Awtsmoos renews intention before execution and execution before manifestation;
 * Awtsmoos.com keeps planning and doing distinct, so a session may inspect the coming world without pretending it has already become creation.
 */
import { WorldDependencyPolicyRegistry } from '../worldLineage/WorldDependencyPolicyRegistry.js';
import { createWorldSemanticSnapshot } from '../worldLineage/createWorldSemanticSnapshot.js';
import { createWorldChangeImpactReceipt } from '../worldLineage/createWorldChangeImpactReceipt.js';
import { ArtifactImpactPolicyRegistry } from '../artifactLineage/ArtifactImpactPolicyRegistry.js';
import { createSelectiveArtifactRegenerationPlan } from '../artifactLineage/createSelectiveArtifactRegenerationPlan.js';
import { ArtifactFreshnessLedger } from './ArtifactFreshnessLedger.js';
import { RealityArtifactExecutor } from './RealityArtifactExecutor.js';

export class UnifiedRealityExecutionEngine {
	constructor({
		artifactExecution,
		worldPolicyRegistry = new WorldDependencyPolicyRegistry(),
		artifactPolicyRegistry = new ArtifactImpactPolicyRegistry(),
		ledger = new ArtifactFreshnessLedger(),
		compilerManifestProvider = null,
		executionIdentity = {}
	} = {}) {
		this.worldPolicyRegistry = worldPolicyRegistry;
		this.artifactPolicyRegistry = artifactPolicyRegistry;
		this.executor = new RealityArtifactExecutor({ artifactExecution, ledger, compilerManifestProvider, executionIdentity });
	}

	/**
	 * @description Computes immutable world and artifact consequence evidence without invoking any compiler or mutating freshness.
	 * @param {object} options Transition definitions, request, patch receipts, and optional policy overrides.
	 * @returns {Readonly<object>} Before/after snapshots, world impact, and selective artifact plan.
	 */
	planWorldChange({
		beforeDefinitions = [],
		afterDefinitions = [],
		request,
		patchReceipts = [],
		worldPolicyRegistry = this.worldPolicyRegistry,
		artifactPolicyRegistry = this.artifactPolicyRegistry
	} = {}) {
		const beforeSnapshot = createWorldSemanticSnapshot(beforeDefinitions, { policyRegistry: worldPolicyRegistry });
		const afterSnapshot = createWorldSemanticSnapshot(afterDefinitions, { policyRegistry: worldPolicyRegistry });
		const worldImpact = createWorldChangeImpactReceipt(beforeSnapshot, afterSnapshot);
		const selectivePlan = createSelectiveArtifactRegenerationPlan({
			beforeSnapshot,
			afterSnapshot,
			worldImpact,
			request,
			patchReceipts,
			policyRegistry: artifactPolicyRegistry
		});
		return Object.freeze({ beforeSnapshot, afterSnapshot, worldImpact, selectivePlan });
	}

	/**
	 * @description Plans then executes one world transition through the persistent freshness-aware artifact executor.
	 * @param {object} options Transition definitions, artifact intent, patch evidence, policies, and execution options.
	 * @returns {Promise<Readonly<object>>} Planned transition plus concrete incremental execution evidence.
	 */
	async executeWorldChange(options = {}) {
		const transition = this.planWorldChange(options);
		const execution = await this.executor.execute(
			transition.selectivePlan,
			options.afterDefinitions || [],
			{ compileOptions: options.compileOptions || {}, executionIdentity: options.executionIdentity }
		);
		return Object.freeze({ ...transition, execution });
	}

	/** @returns {Readonly<object>} Portable freshness ledger snapshot without opaque runtime artifacts. */
	freshnessSnapshot() {
		return this.executor.ledger.snapshot();
	}
}
