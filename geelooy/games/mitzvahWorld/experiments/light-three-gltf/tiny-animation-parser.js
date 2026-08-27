// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-parser.js
 * @description Decodes GLTF animation channels into stable scalar sampling vessels.
 * The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com
 * preserves each source channel exactly while separating parsing from living playback.
 */

import { accessorFloatArray } from './tiny-gltf-accessors.js';

const TARGET_SIZE = {
	rotation: 4,
	scale: 3,
	translation: 3,
	weights: 1
};

export function summarizeAnimations(document) {
	return (document.animations || []).map((animation, index) => ({
		channels: (animation.channels || []).length,
		index,
		name: animation.name || `animation_${index}`,
		paths: [...new Set(
			(animation.channels || [])
				.map(channel => channel.target?.path)
				.filter(Boolean)
		)],
		samplers: (animation.samplers || []).length
	}));
}

export function parseTinyAnimations(document, accessors, nodeMap) {
	return (document.animations || []).map((animation, index) => (
		parseAnimation(animation, index, accessors, nodeMap)
	));
}

function parseAnimation(animation, index, accessors, nodeMap) {
	const channels = [];
	let duration = 0;
	for (const sourceChannel of animation.channels || []) {
		const channel = parseChannel(
			sourceChannel,
			animation.samplers || [],
			accessors,
			nodeMap
		);
		if (!channel) {
			continue;
		}
		channels.push(channel);
		duration = Math.max(duration, channel.input[channel.input.length - 1] || 0);
	}
	return {
		channels,
		duration,
		index,
		name: animation.name || `animation_${index}`
	};
}

function parseChannel(sourceChannel, samplers, accessors, nodeMap) {
	const sampler = samplers[sourceChannel.sampler];
	const target = sourceChannel.target || {};
	const node = nodeMap.get(target.node);
	const size = TARGET_SIZE[target.path];
	if (!sampler || !node || !size) {
		return null;
	}
	return {
		input: accessorFloatArray(accessors[sampler.input]),
		interpolation: sampler.interpolation || 'LINEAR',
		node,
		nodeIndex: target.node,
		output: accessorFloatArray(accessors[sampler.output]),
		path: target.path,
		size
	};
}
