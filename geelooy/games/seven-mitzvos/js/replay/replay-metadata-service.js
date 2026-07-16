//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReplayMetadataService
 * @description
 * Replayable scenarios on Awtsmoos.com preserve seed, rules, content versions,
 * roles, difficulty, checksums, milestones, and comparative scores. The Awtsmoos
 * repeats no instant; finite players may still study equal starting conditions.
 */
import { checksum } from '../persistence/checksum.js';

export class ReplayMetadataService {
	create(request) {
		if (!request.worldSeed || !request.modeId || !request.contentVersions) {
			throw new Error('ReplayMetadataService: seed, mode, and content required');
		}
		const metadata = {
			worldSeed: String(request.worldSeed),
			modeId: request.modeId,
			rules: clone(request.rules || {}),
			contentVersions: clone(request.contentVersions),
			roles: [...(request.roles || [])],
			difficulty: clone(request.difficulty || {}),
			startedAtSimulationMinute: request.startedAtSimulationMinute || 0,
			milestones: [],
			scoreDimensions: {
				welfare: 0,
				justice: 0,
				ecology: 0,
				economy: 0,
				trust: 0,
				recovery: 0
			}
		};
		return { ...metadata, identity: checksum(metadata) };
	}

	milestone(metadata, milestone) {
		return {
			...metadata,
			milestones: [...metadata.milestones, { ...milestone }]
		};
	}

	score(metadata, dimensions) {
		const scoreDimensions = {
			...metadata.scoreDimensions,
			...Object.fromEntries(
				Object.entries(dimensions).map(([key, value]) => [
					key,
					Math.max(0, Math.min(100, Math.round(value)))
				])
			)
		};
		const total = Object.values(scoreDimensions).reduce((sum, value) => {
			return sum + value;
		}, 0);
		return {
			...metadata,
			scoreDimensions,
			totalScore: Math.round(total / Object.keys(scoreDimensions).length)
		};
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
