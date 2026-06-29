# B"H

# Phase Three Runtime Plan

## Baseline chat prompts
Run without source edits first:
- `What is Kabbalah?`
- `Who are you?`
- `Write one sentence.`
- `Hello.`

For each run capture:
- rendered prompt
- prompt token ids
- generated token ids
- decoded text
- EOS encounters
- top logits where available
- runtime timing
- memory and KV cache stats

## Required numerical probes
1. Embedding lookup: token id to row vector sanity.
2. RMSNorm: compare formula and epsilon against metadata.
3. Attention: q/k/v projection orientation, scaling, softmax, mask, head grouping.
4. RoPE: position, dimensions, base frequency, neox vs non-neox layout.
5. KV cache: position and layer indexing, K/V head selection.
6. FFN: gate/up/down projection order and SiLU.
7. Output: final RMSNorm and LM head orientation.
8. Quantization: Q2_K decode and dot products against ggml layout.
9. Tokenizer/sampler: verify only after logits are inspected.

## Success gate
The investigation remains open until multi-token coherent English answers are produced for multiple prompts. Stopping after `Kabbalah` remains failure.
