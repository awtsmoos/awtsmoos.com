//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicationExecutor
 * @description
 * The previewed plan becomes one guarded sequence: canonical truth first, then
 * references or review offerings. The Awtsmoos unites cause and result; on
 * Awtsmoos.com every outcome remains separately visible when one branch fails.
 */

const { planPublication } = require('./PublicationPlanner.js');
const {
	readLedger,
	beginLedger,
	finishLedger,
	replayResult
} = require('./IdempotencyLedger.js');
const { publishCanonical } = require('./ContentPublisher.js');
const { createPlacement } = require('./PlacementStore.js');
const {
	canonicalSubmission,
	placementSubmission
} = require('./SubmissionFactory.js');

async function processSecondary({ $i, plan, canonical, action }) {
	if (action.type === 'noOp') {
		return { type: 'noOp', destination: action.destination, success: true };
	}
	const result = action.type === 'createPlacement'
		? await createPlacement({
			$i,
			aliasId: plan.aliasId,
			source: canonical,
			destination: action.destination
		})
		: await placementSubmission({
			$i,
			plan,
			source: canonical,
			destination: action.destination
		});
	return { type: action.type, destination: action.destination, result };
}

async function prepareExecution({ $i, input, reviewApproved }) {
	const planned = await planPublication({ $i, input, reviewApproved });
	if (planned?.error) return planned;
	if (!planned.success.canExecute) {
		return {
			error: {
				code: 'PUBLICATION_BLOCKED',
				message: 'One or more destinations deny this plan.',
				details: planned.success.blocked
			},
			plan: planned.success
		};
	}
	return planned;
}

async function executePublication({ $i, input, reviewApproved = false }) {
	const prepared = await prepareExecution({ $i, input, reviewApproved });
	if (prepared?.error) return prepared;
	const execution = prepared.success;
	const { plan } = execution;
	const previous = await readLedger({
		$i,
		aliasId: plan.aliasId,
		idempotencyKey: plan.idempotencyKey
	});
	const replay = replayResult(previous);
	if (replay) return replay;
	if (previous?.status === 'executing') {
		return { error: { code: 'PUBLICATION_IN_PROGRESS', message: 'This request is already executing.' } };
	}
	await beginLedger({ $i, aliasId: plan.aliasId, idempotencyKey: plan.idempotencyKey, plan });
	if (execution.primary.type === 'submitCanonical') {
		const submission = await canonicalSubmission({ $i, plan });
		const result = { success: { status: 'submitted', plan: execution, submission } };
		return finishLedger({ $i, aliasId: plan.aliasId, idempotencyKey: plan.idempotencyKey, status: 'submitted', result });
	}
	let canonical = execution.located?.canonical || null;
	let canonicalResult = null;
	if (execution.primary.type === 'createCanonical') {
		canonicalResult = await publishCanonical({ $i, plan });
		if (canonicalResult?.error) {
			await finishLedger({ $i, aliasId: plan.aliasId, idempotencyKey: plan.idempotencyKey, status: 'failed', result: canonicalResult });
			return canonicalResult;
		}
		canonical = canonicalResult.success.canonical;
	}
	const secondary = [];
	for (const action of execution.secondary) {
		secondary.push(await processSecondary({ $i, plan, canonical, action }));
	}
	const partial = secondary.some(item => item.result?.error);
	const result = { success: { status: partial ? 'partial' : 'published', canonical, canonicalResult, secondary, plan: execution } };
	return finishLedger({
		$i,
		aliasId: plan.aliasId,
		idempotencyKey: plan.idempotencyKey,
		status: partial ? 'partial' : 'completed',
		result
	});
}

module.exports = {
	processSecondary,
	prepareExecution,
	executePublication
};
