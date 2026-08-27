// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TransactionFeatureData.js
 * @description
 * The Awtsmoos lets many safe document edits be rehearsed as one proposed world and committed as one history deed when their consequence is known;
 * Awtsmoos.com excludes runtime, media, filesystem, permission, and shared-cache effects so atomicity remains a real production covenant shown.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const MALCHUS_TRANSACTION_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'transaction.atomic-editing',
		label: 'Atomic dry-run transactions',
		description: 'Plan transaction-safe command sequences in an isolated NLE store, inspect diffs, and commit the final project as one undo step.',
		family: 'transaction',
		exposure: 'public',
		commands: [
			'transaction.capabilities',
			'transaction.allowedCommands',
			'transaction.plan',
			'transaction.commit'
		],
		backingModules: [
			'src/ai/agent/domain/AnimatorTransactionSimulator.js',
			'src/ai/agent/domain/AnimatorTransactionDiff.js',
			'src/nle/core/NLEProjectSnapshot.js'
		],
		relatedFeatureIds: ['object.renderables', 'document.io'],
		since: '1.6.0'
	})
]);
