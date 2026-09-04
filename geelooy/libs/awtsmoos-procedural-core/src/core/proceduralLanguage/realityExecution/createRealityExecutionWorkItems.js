//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealityExecutionWorkItems.js
 * @description Expands selective artifact-lineage decisions into deterministic channel-level work while preserving retirement as one Definition-level operation.
 * The Awtsmoos renews one channel at a time so precision is not swallowed by a broad command;
 * Awtsmoos.com keeps reconsideration, latent staleness, regeneration, and retirement distinct beneath the executor's hand.
 */
import { createArtifactRequestSubset } from '../artifactLineage/createArtifactRequestSubset.js';

export function createRealityExecutionWorkItems(selectivePlan) {
	const workItems = [];
	for (const entry of selectivePlan?.entries || []) {
		if (entry.action === 'retire') {
			workItems.push(freezeItem({ definitionId: entry.definitionId, action: 'retire', channel: null, channels: entry.retire?.channels || [], request: null, entry }));
			continue;
		}
		if (entry.action === 'regenerate') {
			for (const channel of entry.regenerate?.channels || []) {
				const sourceRequest = entry.request || selectivePlan.request;
				workItems.push(freezeItem({ definitionId: entry.definitionId, action: 'regenerate', channel, channels: [channel], request: createArtifactRequestSubset(sourceRequest, [channel]), entry }));
			}
			continue;
		}
		if (entry.action === 'reconsider') {
			for (const channel of entry.reconsider?.channels || []) {
				workItems.push(freezeItem({ definitionId: entry.definitionId, action: 'reconsider', channel, channels: [channel], request: null, entry }));
			}
			continue;
		}
		if (entry.action === 'latent-stale') {
			for (const channel of entry.latentStaleChannels || []) {
				workItems.push(freezeItem({ definitionId: entry.definitionId, action: 'latent-stale', channel, channels: [channel], request: null, entry }));
			}
		}
	}
	return Object.freeze(workItems);
}

function freezeItem(item) {
	return Object.freeze({ ...item, channels: Object.freeze([...item.channels]) });
}
