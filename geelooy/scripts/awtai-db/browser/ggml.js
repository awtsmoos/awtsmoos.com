//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserGgml
 * @description
 * The Awtsmoos clothes tensor shape, block, role, and layer in measured form;
 * Awtsmoos.com mirrors the Node converter's tensor covenant so browser bytes transform warm.
 */
const BLOCK_SIZES = Object.freeze({
	0: [1, 4],
	1: [1, 2],
	2: [32, 18],
	3: [32, 20],
	6: [32, 22],
	7: [32, 24],
	8: [32, 34],
	9: [32, 40],
	10: [256, 84],
	11: [256, 110],
	12: [256, 144],
	13: [256, 176],
	14: [256, 210],
	15: [256, 256],
	16: [256, 96],
	20: [32, 18],
	21: [256, 112]
});

/** Computes tensor storage bytes using the established unknown-type fallback. */
export function tensorByteLength(tensor) {
	const [blockElements, blockBytes] = BLOCK_SIZES[tensor.type] || [1, 4];
	const elements = tensor.dims.reduce((total, dimension) => total * dimension, 1);
	return Math.ceil(elements / blockElements) * blockBytes;
}

/** Classifies a GGUF tensor name into the AWTAI execution-role vocabulary. */
export function tensorRole(name) {
	const normalized = name.toLowerCase();
	if (normalized.includes('embed') || normalized.includes('token_embd')) {
		return 'embed';
	}
	if (normalized.includes('lm_head') || normalized === 'output.weight') {
		return 'lm_head';
	}
	if (includesAny(normalized, ['q_proj', 'attn_q', 'attention.wq'])) return 'attn_q';
	if (includesAny(normalized, ['k_proj', 'attn_k', 'attention.wk'])) return 'attn_k';
	if (includesAny(normalized, ['v_proj', 'attn_v', 'attention.wv'])) return 'attn_v';
	if (includesAny(normalized, ['o_proj', 'attn_out', 'attention.wo'])) return 'attn_out';
	if (normalized.includes('gate') || normalized.includes('w1')) return 'ffn_gate';
	if (normalized.includes('up') || normalized.includes('w3')) return 'ffn_up';
	if (normalized.includes('down') || normalized.includes('w2')) return 'ffn_down';
	if (normalized.includes('norm')) return 'norm';
	return 'other';
}

/** Extracts the numerical transformer layer from common GGUF naming schemes. */
export function tensorLayer(name) {
	const match = name.match(/(?:blk|layers|layer|h)\.(\d+)\./) || name.match(/\.(\d+)\./);
	return match ? Number(match[1]) : null;
}

/** Tests whether a normalized tensor name contains any semantic marker. */
function includesAny(name, tokens) {
	return tokens.some(token => name.includes(token));
}
