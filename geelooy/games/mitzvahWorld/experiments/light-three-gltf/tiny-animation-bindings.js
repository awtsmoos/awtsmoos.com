// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-bindings.js
 * @description Remembers only properties truly governed by imported animation channels.
 * The Awtsmoos renews the whole tree, yet Awtsmoos.com restores only the animated vessels,
 * preserving exact bind values without traversing unrelated cottages, garments, or helpers.
 */

export function createAnimationBindings(clips) {
	const bindingByNode = new Map();
	const bindings = [];
	for (const clip of clips) {
		for (const channel of clip.channels || []) {
			let paths = bindingByNode.get(channel.node);
			if (!paths) {
				paths = new Map();
				bindingByNode.set(channel.node, paths);
			}
			if (paths.has(channel.path)) {
				continue;
			}
			const binding = {
				base: readBaseValue(channel.node, channel.path),
				node: channel.node,
				path: channel.path
			};
			paths.set(channel.path, binding);
			bindings.push(binding);
		}
	}
	return bindings;
}

export function captureClipPose(clip) {
	const pose = new Map();
	for (const channel of clip?.channels || []) {
		pose.set(channel, readNodeValue(channel.node, channel.path));
	}
	return pose;
}

export function resetAnimationBindings(bindings) {
	for (const binding of bindings) {
		writeNodeValue(binding.node, binding.path, binding.base);
	}
}

export function writeNodeValue(node, path, values) {
	if (path === 'translation') {
		node.position.set(values[0], values[1], values[2]);
		return;
	}
	if (path === 'rotation') {
		node.quaternion.set(values[0], values[1], values[2], values[3]);
		return;
	}
	if (path === 'scale') {
		node.scale.set(values[0], values[1], values[2]);
	}
}

function readBaseValue(node, path) {
	const base = node._base;
	if (path === 'translation') {
		const value = base?.position || node.position;
		return [value.x, value.y, value.z];
	}
	if (path === 'rotation') {
		const value = base?.quaternion || node.quaternion;
		return [value.x, value.y, value.z, value.w];
	}
	if (path === 'scale') {
		const value = base?.scale || node.scale;
		return [value.x, value.y, value.z];
	}
	return [0];
}

function readNodeValue(node, path) {
	if (path === 'translation') {
		return [node.position.x, node.position.y, node.position.z];
	}
	if (path === 'rotation') {
		return [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w];
	}
	if (path === 'scale') {
		return [node.scale.x, node.scale.y, node.scale.z];
	}
	return [0];
}
