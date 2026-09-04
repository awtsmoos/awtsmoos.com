//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityArtifactExecutor.js
 * @description Executes selective artifact work through the existing artifact execution authority, skipping only when precise witness equality and live materialization both prove freshness.
 * The Awtsmoos renews every cause before a compiler moves, and renews every resting artifact before a skip is allowed;
 * Awtsmoos.com makes staleness precede replacement work, so failure can never leave an obsolete artifact crowned as current in the crowd.
 */
import { ArtifactFreshnessLedger } from './ArtifactFreshnessLedger.js';
import { createRealityDefinitionLookup } from './createRealityDefinitionLookup.js';
import { describeRealityCompilerManifest } from './describeRealityCompilerManifest.js';
import { createArtifactFreshnessWitness } from './createArtifactFreshnessWitness.js';
import { createRealityExecutionWorkItems } from './createRealityExecutionWorkItems.js';
import { createPortableExecutionEvidence } from './createPortableExecutionEvidence.js';
import { createRealityExecutionReceipt } from './createRealityExecutionReceipt.js';
import { REALITY_EXECUTION_OUTCOMES } from './RealityExecutionProtocol.js';

export class RealityArtifactExecutor {
	constructor({ artifactExecution, ledger = new ArtifactFreshnessLedger(), compilerManifestProvider = null, executionIdentity = {} } = {}) {
		if (!artifactExecution?.plan || !artifactExecution?.compile) throw new TypeError('RealityArtifactExecutor requires artifactExecution plan() and compile().');
		this.artifactExecution = artifactExecution;
		this.ledger = ledger;
		this.compilerManifestProvider = compilerManifestProvider;
		this.executionIdentity = executionIdentity;
	}

	async execute(selectivePlan, definitions, options = {}) {
		const lookup = createRealityDefinitionLookup(definitions);
		const workItems = createRealityExecutionWorkItems(selectivePlan);
		const outcomes = [];
		const artifacts = [];

		for (const item of workItems) {
			if (item.action === 'retire') {
				const channels = this.ledger.retireDefinition(item.definitionId);
				outcomes.push(Object.freeze({ definitionId: item.definitionId, channel: null, status: REALITY_EXECUTION_OUTCOMES.retired, channels }));
				continue;
			}
			if (item.action === 'reconsider' || item.action === 'latent-stale') {
				const status = item.action === 'reconsider' ? REALITY_EXECUTION_OUTCOMES.reconsidered : REALITY_EXECUTION_OUTCOMES.latentStale;
				this.ledger.markStale(item.definitionId, item.channel, item.action);
				outcomes.push(Object.freeze({ definitionId: item.definitionId, channel: item.channel, status, witnessHash: null }));
				continue;
			}
			const result = await this.executeRegeneration(item, lookup, options);
			outcomes.push(result.outcome);
			artifacts.push(result.artifact);
		}

		const ledgerSnapshot = this.ledger.snapshot();
		return Object.freeze({
			receipt: createRealityExecutionReceipt(selectivePlan, outcomes, ledgerSnapshot),
			artifacts: Object.freeze(artifacts),
			ledger: ledgerSnapshot
		});
	}

	async executeRegeneration(item, lookup, options) {
		const definition = lookup.get(item.definitionId);
		if (!definition) throw new RangeError(`Reality execution Definition not found: ${item.definitionId}`);
		const compilerPlan = this.artifactExecution.plan(definition, item.request);
		const compilerManifest = describeRealityCompilerManifest(this.artifactExecution, compilerPlan, this.compilerManifestProvider);
		const witness = createArtifactFreshnessWitness({
			definition,
			channel: item.channel,
			request: item.request,
			compilerPlan,
			compilerManifest,
			planEntry: item.entry,
			definitionLookup: lookup,
			executionIdentity: options.executionIdentity ?? this.executionIdentity
		});
		const match = this.ledger.match(item.definitionId, item.channel, witness.witnessHash);
		if (match) {
			return Object.freeze({
				outcome: Object.freeze({ definitionId: item.definitionId, channel: item.channel, status: REALITY_EXECUTION_OUTCOMES.freshSkip, witnessHash: witness.witnessHash }),
				artifact: Object.freeze({ definitionId: item.definitionId, channel: item.channel, status: REALITY_EXECUTION_OUTCOMES.freshSkip, result: match.runtimeArtifact })
			});
		}
		this.ledger.markStale(item.definitionId, item.channel, 'witness-mismatch');
		const compilationResult = await this.artifactExecution.compile(definition, item.request, options.compileOptions || {});
		const execution = createPortableExecutionEvidence(compilationResult);
		this.ledger.recordFresh({ definitionId: item.definitionId, channel: item.channel, witnessHash: witness.witnessHash, witness, execution }, compilationResult);
		return Object.freeze({
			outcome: Object.freeze({ definitionId: item.definitionId, channel: item.channel, status: REALITY_EXECUTION_OUTCOMES.executed, witnessHash: witness.witnessHash, executionEvidenceHash: execution.executionEvidenceHash }),
			artifact: Object.freeze({ definitionId: item.definitionId, channel: item.channel, status: REALITY_EXECUTION_OUTCOMES.executed, result: compilationResult })
		});
	}
}
