//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySession.js
 * @description Stateful Medaber surface for defining, patching, planning, explaining, compiling, applying, resetting, and inspecting one incremental procedural Reality.
 * The Awtsmoos renews intention, proof, and manifestation before one method can confuse their order;
 * Awtsmoos.com lets this session speak to the execution engine while dedicated state vessels guard committed and draft worlds below the border.
 */
import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { UnifiedRealityExecutionEngine } from '../realityExecution/UnifiedRealityExecutionEngine.js';
import { createRealitySessionExplanation } from './createRealitySessionExplanation.js';
import { createRealitySessionExecutionInput, createRealitySessionTransitionInput } from './createRealitySessionInputs.js';
import { createRealitySessionSnapshot } from './createRealitySessionSnapshot.js';
import { RealitySessionState } from './RealitySessionState.js';
import { createRealitySessionTransition } from './createRealitySessionTransition.js';

export class RealitySession {
	#state;

	constructor({ engine = null, definitions = [], request = {}, ...engineOptions } = {}) {
		this.engine = engine || new UnifiedRealityExecutionEngine(engineOptions);
		this.defaultRequest = createArtifactRequest(request);
		this.#state = new RealitySessionState(definitions);
	}

	/** @description Stages a canonical whole Definition without fabricating channel precision. */
	define(input) {
		return this.#state.define(input);
	}

	/** @description Stages guarded atomic edits and preserves their real patch receipt for selective lineage. */
	patch(definitionId, operations = [], options = {}) {
		return this.#state.patch(definitionId, operations, options);
	}

	/** @description Stages Definition retirement. */
	remove(definitionId) {
		return this.#state.remove(definitionId);
	}

	/** @description Discards the draft world and pending patch evidence. */
	reset() {
		this.#state.reset();
		return this.snapshot();
	}

	/** @description Computes the committed-to-draft transition without compiler execution or session mutation. */
	plan(options = {}) {
		return createRealitySessionTransition(
			createRealitySessionTransitionInput(this.#sessionInput(options))
		);
	}

	/** @description Produces portable human/machine consequence explanation for the current draft. */
	explain(options = {}) {
		return createRealitySessionExplanation(this.plan(options));
	}

	/** @description Materializes the current draft while deliberately leaving semantic committed state unchanged. */
	async compile(options = {}) {
		const executionInput = createRealitySessionExecutionInput(this.#sessionInput(options));
		const result = await this.engine.executeWorldChange(executionInput);
		return Object.freeze({
			...result,
			committed: false,
			sessionRevision: this.#state.revision()
		});
	}

	/** @description Materializes first, then commits the draft only after every required execution succeeds. */
	async apply(options = {}) {
		const executionInput = createRealitySessionExecutionInput(this.#sessionInput(options));
		const result = await this.engine.executeWorldChange(executionInput);
		const changed = result.worldImpact.semanticChanged || result.worldImpact.dependencyChanged;
		const revision = this.#state.commit(changed);
		return Object.freeze({
			...result,
			committed: true,
			sessionRevision: revision,
			sessionSnapshot: this.snapshot()
		});
	}

	/** @description Returns portable committed/draft/freshness state without opaque runtime artifact values. */
	snapshot() {
		return createRealitySessionSnapshot({
			engine: this.engine,
			committedDefinitions: this.#state.committedDefinitions(),
			draftDefinitions: this.#state.draftDefinitions(),
			revision: this.#state.revision(),
			pendingPatchReceipts: this.#state.patchReceipts()
		});
	}

	#sessionInput(options) {
		return {
			engine: this.engine,
			committedDefinitions: this.#state.committedDefinitions(),
			draftDefinitions: this.#state.draftDefinitions(),
			defaultRequest: this.defaultRequest,
			patchReceipts: this.#state.patchReceipts(),
			options
		};
	}
}
