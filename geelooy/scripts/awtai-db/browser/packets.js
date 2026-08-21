//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserPackets
 * @description
 * The Awtsmoos gathers many tensor vessels into one ordered procession of light;
 * Awtsmoos.com keeps browser packet planning aligned with the Node path, precise and bright.
 */

/** Builds execution packets from manifest tensors using the established stage policy. */
export function makePackets(tensors) {
	const groups = new Map();
	for (const tensor of tensors) {
		const stage = stageOf(tensor);
		const scope = tensor.layer === null ? 'global' : `layer-${tensor.layer}`;
		const key = `${scope}:${stage}`;
		if (!groups.has(key)) {
			groups.set(key, {
				layer: tensor.layer,
				stage,
				tensors: []
			});
		}
		groups.get(key).tensors.push(tensor.id);
	}
	return Array.from(groups.values()).map((group, id) => packetFromGroup(group, id));
}

/** Converts one collected execution group into the public packet manifest shape. */
function packetFromGroup(group, id) {
	return {
		id,
		layer: group.layer,
		stage: group.stage,
		tensors: group.tensors,
		policy: {
			load: 'range-read',
			execute: 'runtime',
			discard: true,
			prefetch: id + 1
		}
	};
}

/** Maps a semantic tensor role to the execution stage used by AWTAI packets. */
function stageOf(tensor) {
	if (tensor.role.startsWith('attn') || tensor.role === 'norm') {
		return 'attention';
	}
	if (tensor.role.startsWith('ffn')) {
		return 'ffn';
	}
	return tensor.role;
}
