// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAssetClipFactory
 * @description
 * Generated and imported assets enter the appropriate extension track at the
 * current playhead, while Awtsmoos.com preserves one asset record and one clip.
 */

import { addNleClip } from './NleTimelineModel.js';
import { cloneNleValue } from './NleClone.js';

export function addAssetToProject(project, asset, playhead = 0, duration = null) {
	let next = cloneNleValue(project);
	next.nle = next.nle || { assets: [], version: 1 };
	next.nle.assets = Array.isArray(next.nle.assets) ? next.nle.assets : [];
	if (!next.nle.assets.some(item => item.id === asset.id)) {
		next.nle.assets.push(cloneNleValue(asset));
	}
	const trackId = trackForAsset(asset);
	const clipDuration = Math.max(0.1, Number(duration || defaultDuration(asset)));
	const start = Math.min(Number(playhead || 0), Math.max(0, next.duration - clipDuration));
	return addNleClip(next, trackId, {
		assetId: asset.id,
		duration: Math.min(clipDuration, next.duration),
		id: `${asset.id}-clip`,
		label: asset.label,
		start
	});
}

export function assetById(project, assetId) {
	return project.nle?.assets?.find(asset => asset.id === assetId) || null;
}

export function trackForAsset(asset) {
	if (asset.kind === 'title') return 'nle-overlay';
	if (asset.kind === 'tone' || asset.kind === 'audio') return 'nle-audio';
	return 'nle-visual';
}

function defaultDuration(asset) {
	if (asset.kind === 'title') return 3;
	if (asset.kind === 'tone' || asset.kind === 'audio') return 8;
	if (asset.kind === 'video' && Number(asset.duration)) return asset.duration;
	return 5;
}
