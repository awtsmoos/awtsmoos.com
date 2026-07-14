// B"H
// Boruch Hashem
// Blessed is He
/** @module CreatorWorldChapters @description Names all sixty finished contract chapters. */

const entries = [
	[1, 'release', 'Release train manifest', './release/trainManifest.mjs'],
	[2, 'release', 'Artifact classification', './release/artifactClass.mjs'],
	[3, 'release', 'Ownership claims', './release/ownershipClaim.mjs'],
	[4, 'release', 'Drift detection', './release/driftDetector.mjs'],
	[5, 'release', 'Evidence manifest', './release/evidenceManifest.mjs'],
	[6, 'core', 'Stable object IDs', './core/stableObjectId.mjs'],
	[7, 'core', 'Object envelopes', './core/objectEnvelope.mjs'],
	[8, 'core', 'Validation results', './core/validationResult.mjs'],
	[9, 'core', 'Mutable drafts', './core/mutableDraft.mjs'],
	[10, 'core', 'Immutable publications', './core/immutablePublication.mjs'],
	[11, 'provenance', 'Ancestry links', './provenance/ancestryLink.mjs'],
	[12, 'provenance', 'Fork records', './provenance/forkRecord.mjs'],
	[13, 'provenance', 'Merge proposals', './provenance/mergeProposal.mjs'],
	[14, 'provenance', 'Typed coordinates', './provenance/typedCoordinate.mjs'],
	[15, 'provenance', 'Asset manifests', './provenance/assetManifest.mjs'],
	[16, 'social', 'Composer payloads', './social/composerPayload.mjs'],
	[17, 'social', 'Structured sections', './social/structuredSection.mjs'],
	[18, 'social', 'Questions', './social/questionObject.mjs'],
	[19, 'social', 'Answers', './social/answerObject.mjs'],
	[20, 'social', 'Preview adapters', './social/previewAdapter.mjs'],
	[21, 'discovery', 'Radiance signals', './discovery/radianceSignals.mjs'],
	[22, 'discovery', 'Ranking explanations', './discovery/rankingExplanation.mjs'],
	[23, 'discovery', 'Diversity adjustments', './discovery/diversityAdjustment.mjs'],
	[24, 'discovery', 'Discovery lanes', './discovery/discoveryLane.mjs'],
	[25, 'discovery', 'Personalization controls', './discovery/personalizationControl.mjs'],
	[26, 'search', 'Query plans', './search/queryPlan.mjs'],
	[27, 'search', 'Search lane receipts', './search/searchLaneReceipt.mjs'],
	[28, 'search', 'Corpus manifests', './search/corpusManifest.mjs'],
	[29, 'search', 'Vector generations', './search/vectorGeneration.mjs'],
	[30, 'search', 'Atomic corpus swaps', './search/atomicCorpusSwap.mjs'],
	[31, 'worlds', 'World drafts', './worlds/worldDraft.mjs'],
	[32, 'worlds', 'World validation', './worlds/worldValidation.mjs'],
	[33, 'worlds', 'World publication', './worlds/worldPublication.mjs'],
	[34, 'worlds', 'World forks', './worlds/worldFork.mjs'],
	[35, 'worlds', 'World reports', './worlds/worldReport.mjs'],
	[36, 'characters', 'Character passports', './characters/characterPassport.mjs'],
	[37, 'characters', 'Character leases', './characters/characterLease.mjs'],
	[38, 'characters', 'Game projections', './characters/gameProjection.mjs'],
	[39, 'characters', 'Lease transfers', './characters/leaseTransfer.mjs'],
	[40, 'characters', 'Character recovery', './characters/characterRecovery.mjs'],
	[41, 'replays', 'Replay manifests', './replays/replayManifest.mjs'],
	[42, 'replays', 'Replay events', './replays/replayEvent.mjs'],
	[43, 'replays', 'Replay verification', './replays/replayVerification.mjs'],
	[44, 'replays', 'Storyboards', './replays/storyboard.mjs'],
	[45, 'replays', 'Timeline compilation', './replays/timelineCompilation.mjs'],
	[46, 'artifacts', 'Capability levels', './artifacts/capabilityLevel.mjs'],
	[47, 'artifacts', 'Trace coordinates', './artifacts/traceCoordinate.mjs'],
	[48, 'artifacts', 'Private artifact reports', './artifacts/privateArtifactReport.mjs'],
	[49, 'artifacts', 'Compatibility matrices', './artifacts/compatibilityMatrix.mjs'],
	[50, 'artifacts', 'Unsupported boundaries', './artifacts/unsupportedBoundary.mjs'],
	[51, 'tunnel', 'Job lineage', './tunnel/jobLineage.mjs'],
	[52, 'tunnel', 'Worker lifecycle', './tunnel/workerLifecycle.mjs'],
	[53, 'tunnel', 'Quarantine records', './tunnel/quarantineRecord.mjs'],
	[54, 'tunnel', 'Safe replay policy', './tunnel/safeReplayPolicy.mjs'],
	[55, 'tunnel', 'Fairness summaries', './tunnel/fairnessSummary.mjs'],
	[56, 'integration', 'Object registry', './integration/objectRegistry.mjs'],
	[57, 'integration', 'Preview registry', './integration/previewRegistry.mjs'],
	[58, 'integration', 'Adapter registry', './integration/adapterRegistry.mjs'],
	[59, 'integration', 'Verification receipt', './integration/verificationReceipt.mjs'],
	[60, 'integration', 'Creator-world OS index', './integration/creatorWorldOs.mjs']
];

export const CHAPTERS = Object.freeze(entries.map(([number, train, title, module]) => {
	return Object.freeze({ number, train, title, module, state: 'implemented' });
}));

export function chapterByNumber(number) {
	return CHAPTERS.find(chapter => chapter.number === Number(number)) || null;
}
