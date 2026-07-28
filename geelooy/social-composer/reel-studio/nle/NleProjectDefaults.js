// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleProjectDefaults
 * @description
 * Existing MitzvahWorld scenes and dialogue become an editable starter film
 * without rewriting original 3D tracks or duplicating complete AI compositions.
 */

import { cloneNleValue } from './NleClone.js';
import {
	createGradientAsset,
	createParticlesAsset,
	createTitleAsset
} from './NleAssetGenerators.js';

const EXTENSION_TRACKS = Object.freeze([
	['nle-visual', 'nle-visual'],
	['nle-overlay', 'nle-overlay'],
	['nle-audio', 'nle-audio']
]);

export function ensureNleProject(source) {
	const project = cloneNleValue(source || {});
	const existing = project.nle || {};
	project.nle = {
		...existing,
		assets: Array.isArray(existing.assets) ? existing.assets : [],
		version: Math.max(2, Number(existing.version) || 0)
	};
	project.tracks = Array.isArray(project.tracks) ? project.tracks : [];
	if (!project.tracks.some(track => String(track.type).startsWith('nle-'))) {
		installStarterComposition(project);
	}
	for (const [id, type] of EXTENSION_TRACKS) {
		if (!project.tracks.some(track => track.id === id)) {
			project.tracks.unshift({ clips: [], id, type });
		}
	}
	return project;
}

export function installStarterComposition(project) {
	const assets = project.nle.assets;
	const scenes = clipsOf(project, 'scene');
	const dialogue = clipsOf(project, 'dialogue');
	const visualClips = scenes.map((clip, index) => {
		const asset = index % 2
			? createGradientAsset({ colors: [clip.grade || '#16243a', '#050912'], label: clip.label })
			: createParticlesAsset({ colors: [clip.grade || '#8fd6b4', '#f7d57a'], label: clip.label, seed: project.seed + index });
		assets.push(asset);
		return clipFromAsset(asset, clip, clip.label);
	});
	const overlayClips = dialogue.map(clip => {
		const asset = createTitleAsset({
			fontSize: 48,
			label: clip.speaker || 'Dialogue',
			subtext: clip.speaker || '',
			text: clip.text || ''
		});
		assets.push(asset);
		return clipFromAsset(asset, clip, clip.speaker || 'Dialogue');
	});
	project.tracks.unshift(
		{ clips: [], id: 'nle-audio', type: 'nle-audio' },
		{ clips: overlayClips, id: 'nle-overlay', type: 'nle-overlay' },
		{ clips: visualClips, id: 'nle-visual', type: 'nle-visual' }
	);
}

export function extensionTrack(project, id) {
	return project.tracks.find(track => track.id === id) || null;
}

function clipsOf(project, type) {
	return project.tracks.filter(track => track.type === type).flatMap(track => track.clips || []);
}

function clipFromAsset(asset, source, label) {
	return {
		assetId: asset.id,
		duration: Number(source.duration || 3),
		id: `${asset.id}-clip`,
		label: label || asset.label,
		start: Number(source.start || 0)
	};
}
